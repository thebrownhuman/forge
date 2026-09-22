import type { SdModule } from '../schema';

export const urlShortener: SdModule = {
  id: 'case-url-shortener',
  kind: 'case',
  name: 'Design a URL Shortener',
  whyItMatters:
    'The standard warm-up, and the one most candidates underestimate. The system is small enough that there is nowhere to hide: the grade comes entirely from how you generate ids, how you handle the read/write ratio, and whether you notice that this is a caching problem wearing a database costume.',
  estHours: 3,
  prerequisites: ['caching', 'databases'],
  notes: [],
  figures: [],
  tradeoffs: [],
  caseStudy: {
    id: 'url-shortener',
    name: 'URL Shortener',
    prompt: 'Design a service like TinyURL: a user submits a long URL and gets a short one; anyone who visits the short one is redirected.',
    difficulty: 'warmup',
    estMinutes: 45,
    askedBy: ['google', 'amazon', 'microsoft'],
    requirements: [
      'Create a short URL from a long one, optionally with a caller-chosen custom alias.',
      'Redirect a short URL to its original target.',
      'Links may have an expiry date, after which they stop resolving.',
      'Basic analytics per link: click count, and roughly where clicks came from.',
    ],
    constraints: [
      'Read-heavy by roughly 100:1 — redirects vastly outnumber creations.',
      'Redirect latency must be low; this sits in front of a page load, so tens of milliseconds, not hundreds.',
      'Short codes must not be guessable in bulk if links are semi-private.',
      'High availability on the read path: a dead redirect breaks every link ever shared.',
    ],
    estimation: [
      { label: 'New URLs', value: '100M/day ≈ 1,200/s', soWhat: 'Trivial write load — a single database node handles this, so do not shard on day one.' },
      { label: 'Redirects', value: '10B/day ≈ 120k/s', soWhat: 'This is the real system. It is a cache-tier problem, not a database problem.' },
      { label: 'Storage', value: '~500 B/record × 100M/day ≈ 18 TB/year', soWhat: 'Large but single-cluster manageable; partition by short code when it grows.' },
      { label: 'Keyspace', value: '62^7 ≈ 3.5 trillion', soWhat: 'Seven base-62 characters outlast the product. Six gives 56 billion, which may not.' },
      { label: 'Hot-set size', value: '~20% of links get ~80% of traffic', soWhat: 'A few hundred GB of cache covers nearly all redirects.' },
    ],
    api: [
      'POST /urls { longUrl, customAlias?, expiresAt? } -> { shortUrl, code }',
      'GET /{code} -> 301/302 redirect to longUrl',
      'GET /urls/{code}/stats -> { clicks, createdAt, expiresAt, topCountries }',
      'DELETE /urls/{code} -> 204',
    ],
    dataModel: [
      {
        heading: 'links',
        body:
          'Primary key is the short code, because the dominant access pattern is lookup by code. Fields: code, longUrl, ownerId, createdAt, expiresAt. A secondary index on ownerId serves the much rarer "my links" listing.',
        detail: [
          'Partition key: code. High cardinality and uniformly accessed once hashed.',
          'No joins required on the hot path — one key, one row, which is why a key-value store also fits.',
        ],
      },
      {
        heading: 'click events',
        body:
          'Never incremented synchronously on the redirect path. Emit an event to a stream and aggregate asynchronously; the stats endpoint reads a rolled-up table. Writing a counter update into the redirect makes every redirect a database write and destroys the design.',
      },
    ],
    highLevel: [
      'Write: client POSTs to the API, which generates a code, writes the row, and returns the short URL.',
      'Read: GET /{code} hits the CDN or edge, then the cache tier; on a hit it returns a redirect without touching the database.',
      'On a cache miss the service reads the row, populates the cache with a TTL, and redirects.',
      'The redirect handler emits a click event to a queue and returns immediately — analytics never blocks the user.',
      'A background consumer aggregates click events into per-link counters on a schedule.',
      'An expiry job sweeps rows past expiresAt, or the read path checks expiry and treats an expired link as missing.',
    ],
    deepDives: [
      {
        decision: 'How do you generate the short code?',
        optionA: {
          name: 'Counter + base-62 encode',
          whenItWins: 'You want guaranteed uniqueness with no collision handling and the shortest possible codes.',
          cost: 'Codes are sequential and therefore enumerable, which leaks link count and lets anyone crawl every link. Needs a distributed counter, so a single point of coordination.',
        },
        optionB: {
          name: 'Random 7 chars, check-and-retry',
          whenItWins: 'Codes must be unguessable, and you would rather handle a rare collision than run a counter.',
          cost: 'A uniqueness check on every write, and the collision rate climbs as the keyspace fills.',
        },
        howToDecide:
          'If links are semi-private, random is required — sequential codes are a data leak. Otherwise use a counter sharded into ranges (each app server pre-allocates a block of a thousand ids), which removes coordination from the hot path. Hashing the long URL is a third option but produces duplicate codes for duplicate URLs, which breaks per-user analytics and custom expiry.',
      },
      {
        decision: '301 permanent or 302 temporary redirect?',
        optionA: {
          name: '301 permanent',
          whenItWins: 'You want to minimise traffic — browsers cache it and stop asking you entirely.',
          cost: 'You lose all analytics after the first visit, and you can never change or revoke the target, because clients have cached it possibly forever.',
        },
        optionB: {
          name: '302 temporary',
          whenItWins: 'You need click analytics, expiry, or the ability to repoint or disable a link.',
          cost: 'Every single visit hits your infrastructure, which is why the read path must be a cache.',
        },
        howToDecide:
          'The product requires analytics and expiry, so 302. Then say the consequence out loud: this is why the redirect path must be served from cache at 120k/s rather than from the database.',
      },
      {
        decision: 'Where does the custom alias uniqueness check happen?',
        optionA: {
          name: 'Conditional write in the database',
          whenItWins: 'Correctness matters and volume is low — a unique constraint is atomic and cannot be raced.',
          cost: 'A database round trip on every creation, and a failed insert to handle as a user-facing error.',
        },
        optionB: {
          name: 'Bloom filter in front',
          whenItWins: 'You want to reject the common "already taken" case cheaply without touching the database.',
          cost: 'False positives reject some available aliases, and the filter must be kept in step across nodes.',
        },
        howToDecide:
          'Use the database constraint as the source of truth — creation is only 1,200/s, so it is not the bottleneck — and add a Bloom filter only if the check becomes hot. Never rely on the filter alone: a false negative would let two users claim the same alias.',
      },
      {
        decision: 'Cache eviction for redirect lookups?',
        optionA: {
          name: 'LRU with no TTL',
          whenItWins: 'Links are immutable, so a cached entry can never become wrong.',
          cost: 'Deleted or expired links keep resolving until evicted, which is a correctness bug for revocation.',
        },
        optionB: {
          name: 'LRU with a short TTL',
          whenItWins: 'Links can expire or be revoked and you need a bound on how long a dead link keeps working.',
          cost: 'Slightly lower hit rate, and popular links are re-fetched periodically for no benefit.',
        },
        howToDecide:
          'TTL, because expiry is a requirement. Set it from the product promise — "revocation takes effect within a minute" — and on explicit delete, evict the key directly rather than waiting.',
      },
    ],
    bottlenecks: [
      {
        heading: 'A viral link becomes a hot key',
        body:
          'One code can take a large share of all traffic, and a single cache node owning that key saturates its network interface. Fix by replicating hot keys across several cache nodes, or by pushing the very hottest into the CDN and local process memory where each app server holds its own copy.',
      },
      {
        heading: 'Analytics writes overwhelm the store',
        body:
          'At 120k redirects per second, a per-click row is ten billion rows a day. Aggregate in the stream layer — count in windows and write rollups — and keep raw events only in cheap object storage if they are needed at all.',
      },
      {
        heading: 'The id counter becomes a coordination point',
        body:
          'A single global counter is a write bottleneck and a failure point. Hand out ranges: each server takes a block of ids and only coordinates when the block is exhausted, turning per-request coordination into per-thousand-request coordination.',
      },
    ],
    followUps: [
      'How do you prevent the service being used to mask phishing and malware links?',
      'How would you support link expiry at 10 billion links without a scan?',
      'What changes if custom aliases must be globally unique across regions with active-active writes?',
      'How do you migrate from 7-character to 8-character codes without breaking existing links?',
    ],
  },
};

export const newsFeed: SdModule = {
  id: 'case-news-feed',
  kind: 'case',
  name: 'Design a News Feed',
  whyItMatters:
    'The canonical fan-out question, asked in some form by nearly every large consumer company. Everything interesting is in one decision — push or pull — and in what you do about accounts with tens of millions of followers, where the clean answer breaks.',
  estHours: 4,
  prerequisites: ['async-queues', 'caching', 'replication-sharding'],
  notes: [],
  figures: [],
  tradeoffs: [],
  caseStudy: {
    id: 'news-feed',
    name: 'News Feed / Timeline',
    prompt: 'Design the home timeline for a social network: users follow others, post content, and see a feed of recent posts from the people they follow.',
    difficulty: 'standard',
    estMinutes: 50,
    askedBy: ['meta', 'google', 'amazon'],
    requirements: [
      'A user posts text and optional media.',
      'A user follows and unfollows other users.',
      'A user loads a feed of recent posts from those they follow, newest first, paginated.',
      'The feed should reflect a new post from someone you follow within seconds.',
    ],
    constraints: [
      'Extremely read-heavy: feed loads outnumber posts by around 100:1.',
      'Feed load must be fast — under 200 ms for the first page.',
      'Fan-out is wildly uneven: the median user has hundreds of followers, the maximum has over 100 million.',
      'Eventual consistency is acceptable for others\' posts; a user must always see their own post immediately.',
    ],
    estimation: [
      { label: 'Daily active users', value: '300M', soWhat: 'Sets the shape of everything below.' },
      { label: 'Posts', value: '2 per user per day ≈ 7,000/s', soWhat: 'Modest as a write rate — until you multiply by fan-out.' },
      { label: 'Feed loads', value: '10 per user per day ≈ 35,000/s', soWhat: 'The path that must be fast, and the one to cache.' },
      { label: 'Fan-out writes (push)', value: '7,000/s × ~500 avg followers ≈ 3.5M writes/s', soWhat: 'The number that decides the architecture, and why pure push fails for large accounts.' },
      { label: 'Feed cache', value: '300M users × 200 post ids × 8 B ≈ 480 GB', soWhat: 'Fits in a cache tier of a few dozen nodes — store ids, never full posts.' },
    ],
    api: [
      'POST /posts { text, mediaIds? } -> { postId, createdAt }',
      'GET /feed?cursor={cursor}&limit=20 -> { posts[], nextCursor }',
      'POST /follows { targetUserId } -> 204',
      'DELETE /follows/{targetUserId} -> 204',
    ],
    dataModel: [
      {
        heading: 'posts',
        body:
          'Partitioned by postId (a time-sortable id such as a Snowflake), with authorId and createdAt. Storing the id as time-sortable means a feed of ids is already in order and needs no lookup to sort.',
      },
      {
        heading: 'follows',
        body:
          'Two tables, because both directions are hot: followers by userId for fan-out, and following by userId for pull-based merge. Denormalised deliberately — the read patterns are opposite and a single table would make one of them a full scan.',
      },
      {
        heading: 'feed cache',
        body:
          'Per-user list of post ids in a sorted structure, capped at a few hundred entries. Ids only: hydrating the post bodies from a separate cache keeps the feed list small and means editing a post does not require rewriting millions of feeds.',
      },
    ],
    highLevel: [
      'Post write: the post service persists the post, then emits an event to the fan-out queue.',
      'Fan-out worker reads the author\'s followers and pushes the post id onto each follower\'s cached feed list, trimming to the cap.',
      'For accounts above a follower threshold, fan-out is skipped entirely and the post is left to be pulled.',
      'Feed read: fetch the user\'s cached feed list, then separately fetch the recent posts of the large accounts they follow, and merge the two by id order.',
      'Hydrate the merged id list into post objects from the post cache in one batch call.',
      'Return a page with a cursor derived from the last post id, so pagination is stable as new posts arrive.',
    ],
    deepDives: [
      {
        decision: 'Fan-out on write, or fan-out on read?',
        optionA: {
          name: 'Push (fan-out on write)',
          whenItWins: 'Ordinary accounts: the read becomes a single list fetch, which is exactly what a 35,000/s read path needs.',
          cost: 'A post by a huge account triggers tens of millions of writes, taking minutes and wasting most of them on users who will not log in today.',
        },
        optionB: {
          name: 'Pull (fan-out on read)',
          whenItWins: 'Celebrity accounts and inactive readers — no write amplification at all.',
          cost: 'Every read is a scatter-gather across everyone you follow, then a merge. Slower, and much harder to cache.',
        },
        howToDecide:
          'Hybrid, with a follower threshold — push below it, pull above it, merge at read. State the threshold and the reasoning: it should sit where fan-out cost per post exceeds the aggregate read cost of pulling, typically tens of thousands of followers. Also skip fan-out to users inactive for weeks, and rebuild their feed on next login.',
      },
      {
        decision: 'What goes in the feed cache: post ids or full posts?',
        optionA: {
          name: 'Post ids',
          whenItWins: 'Nearly always. The list stays tiny, and an edited or deleted post is corrected in one place.',
          cost: 'A second hydration round trip on every feed load, though it is one batched call.',
        },
        optionB: {
          name: 'Full denormalised posts',
          whenItWins: 'When you must guarantee one round trip and posts are genuinely immutable.',
          cost: 'Memory multiplied by the number of followers, and an edit or delete means rewriting millions of copies.',
        },
        howToDecide:
          'Ids, and say why: it turns "edit a post" from a distributed rewrite into a single update. The extra hop is cheap because hydration is one batched cache read.',
      },
      {
        decision: 'How do you keep pagination stable while new posts arrive?',
        optionA: {
          name: 'Offset pagination',
          whenItWins: 'Never, really, for a live feed.',
          cost: 'New posts shift the window, so the user sees duplicates when scrolling — a visible, classic bug.',
        },
        optionB: {
          name: 'Cursor on a time-sortable post id',
          whenItWins: 'Any feed with concurrent writes, which is all of them.',
          cost: 'Cannot jump to an arbitrary page, which a feed does not need.',
        },
        howToDecide:
          'Cursor, always. Snowflake-style ids give you ordering and the cursor for free, which is a good reason to choose them for posts in the first place.',
      },
      {
        decision: 'Chronological or ranked feed?',
        optionA: {
          name: 'Chronological',
          whenItWins: 'Simple, predictable, cacheable, and easy to reason about in an interview.',
          cost: 'Worse engagement, and heavy posters drown out everyone else.',
        },
        optionB: {
          name: 'Ranked',
          whenItWins: 'Real products — relevance beats recency for retention.',
          cost: 'A scoring service in the read path, features to compute and store, and the cached list is no longer a simple ordering.',
        },
        howToDecide:
          'Build chronological first and say that ranking slots in as a scoring pass over a larger candidate set fetched from the same cache. That framing — candidate generation, then ranking — is what the interviewer is listening for.',
      },
    ],
    bottlenecks: [
      {
        heading: 'Celebrity fan-out saturates the queue',
        body:
          'A single post to 100 million followers is 100 million cache writes. The threshold-based hybrid removes it, but the boundary cases still spike: a user just over the threshold generates enormous bursts. Rate-limit fan-out workers per author and let the backlog drain rather than letting one post starve everyone else\'s.',
      },
      {
        heading: 'Feed cache node loss causes a thundering rebuild',
        body:
          'If a cache node dies, every user it served rebuilds their feed by pulling, all at once, against the post store. Mitigate with replicated cache nodes and by rebuilding lazily with a single-flight lock per user.',
      },
      {
        heading: 'Follow and unfollow storms',
        body:
          'Unfollowing does not retroactively clean millions of cached feeds; those posts must be filtered at read time or allowed to age out. Filtering at read means fetching the follow set anyway, which partly undoes the benefit of push — so cap it by trimming feeds aggressively.',
      },
    ],
    followUps: [
      'How do you insert ads or recommended posts into a cached chronological feed?',
      'What changes if a user must never see a post from someone they blocked, with zero delay?',
      'How would you support "catch up since you were last here" without unbounded feed growth?',
      'How do you handle a post deleted for policy reasons that is already in ten million cached feeds?',
    ],
  },
};

export const chatSystem: SdModule = {
  id: 'case-chat',
  kind: 'case',
  name: 'Design a Chat System',
  whyItMatters:
    'Tests the part of distributed systems that feeds and shorteners do not: long-lived connections, delivery guarantees, ordering, and presence. It is also the case where "exactly once" gets said most often and is most often wrong.',
  estHours: 4,
  prerequisites: ['async-queues', 'consistency'],
  notes: [],
  figures: [],
  tradeoffs: [],
  caseStudy: {
    id: 'chat',
    name: 'Chat / Messaging',
    prompt: 'Design a messaging service like WhatsApp: one-to-one and group chat, delivery and read receipts, and online presence.',
    difficulty: 'hard',
    estMinutes: 55,
    askedBy: ['meta', 'google', 'microsoft'],
    requirements: [
      'Send and receive one-to-one messages in near real time.',
      'Group chat up to a few hundred members.',
      'Delivery states: sent, delivered, read.',
      'Messages are stored and sync to a device that was offline.',
      'Online/offline presence for contacts.',
    ],
    constraints: [
      'Messages must never be silently lost, and must arrive in order within a conversation.',
      'Delivery latency under a few hundred milliseconds when both parties are online.',
      'Clients are mobile: frequently offline, on flaky networks, and battery-constrained.',
      'A user may be signed in on several devices, which must converge to the same history.',
    ],
    estimation: [
      { label: 'Daily active users', value: '500M', soWhat: 'Sets the connection count, which is the unusual constraint here.' },
      { label: 'Messages', value: '40 per user per day ≈ 230,000/s', soWhat: 'High write rate with a known partition key — a wide-column store fits well.' },
      { label: 'Concurrent connections', value: '~50M at peak', soWhat: 'At ~100k sockets per gateway node, that is ~500 gateway nodes. This tier is the distinctive part of the design.' },
      { label: 'Storage', value: '~200 B/message × 20B/day ≈ 4 TB/day', soWhat: 'Drives the retention policy: keep recent history hot, tier the rest or delete it.' },
      { label: 'Presence updates', value: 'potentially larger than message volume', soWhat: 'Naive presence fan-out costs more than the messages themselves — a real trap in this question.' },
    ],
    api: [
      'WebSocket connect -> authenticate, then bidirectional frames',
      'SEND { conversationId, clientMessageId, body } -> { messageId, serverTimestamp }',
      'GET /conversations/{id}/messages?after={messageId}&limit=50 -> { messages[] }',
      'POST /receipts { messageId, state: delivered|read } -> 204',
      'GET /presence?userIds=[...] -> { userId: { state, lastSeen } }',
    ],
    dataModel: [
      {
        heading: 'messages',
        body:
          'Partition key is conversationId, clustering key is a monotonically increasing per-conversation sequence number. This gives ordered reads within a conversation and keeps all of one conversation\'s history on one partition, which is exactly the access pattern.',
        detail: [
          'Server assigns the sequence number, so ordering does not depend on client clocks.',
          'clientMessageId is stored and uniquely indexed for idempotent retries.',
        ],
      },
      {
        heading: 'user inbox / sync cursor',
        body:
          'Per device, the last sequence number acknowledged per conversation. A reconnecting device sends its cursors and receives everything after them, which makes offline sync a range read rather than a push-replay problem.',
      },
      {
        heading: 'connection registry',
        body:
          'userId → gateway node holding that user\'s socket, in a fast shared store with a short TTL and heartbeat. This is how a message reaches the right node; it is state, so it must be highly available and is a legitimate deep-dive target.',
      },
    ],
    highLevel: [
      'Client opens a persistent WebSocket to a gateway node chosen by the load balancer, authenticates, and the registry records userId → node.',
      'Sender emits a message frame; the gateway forwards it to the message service, which assigns a sequence number and persists it.',
      'The service looks up each recipient in the registry and forwards the message to the owning gateway node, which writes it to that socket.',
      'A recipient who is offline has nothing to push to; the message is simply persisted, and the device pulls it on reconnect using its sync cursor.',
      'The receiving client acknowledges; the delivery receipt flows back the same way and updates message state.',
      'A push notification service is invoked for offline recipients so the device wakes and reconnects.',
    ],
    deepDives: [
      {
        decision: 'How do you guarantee no message is lost, given at-least-once delivery?',
        optionA: {
          name: 'Server-side dedupe on a client message id',
          whenItWins: 'Always — it is the only workable answer, and it belongs in every version of this design.',
          cost: 'You must store and index the client id, and keep it long enough to cover any plausible retry window.',
        },
        optionB: {
          name: 'Trust the transport',
          whenItWins: 'Never. TCP delivery says nothing about whether the application persisted the message.',
          cost: 'Duplicates on retry, or silent loss when a gateway dies between socket write and persistence.',
        },
        howToDecide:
          'Persist before acknowledging, dedupe on clientMessageId, and let the client retry until it sees an ack. Say plainly that exactly-once delivery does not exist and that this is at-least-once plus idempotency — that sentence is worth a lot in this round.',
      },
      {
        decision: 'How do you order messages within a conversation?',
        optionA: {
          name: 'Server sequence number per conversation',
          whenItWins: 'When a single total order per conversation is required, which is what users expect.',
          cost: 'The conversation becomes a coordination point; a very hot group serialises on one partition.',
        },
        optionB: {
          name: 'Client timestamps',
          whenItWins: 'Nothing, in practice.',
          cost: 'Device clocks are wrong and skewed; messages reorder visibly and users notice immediately.',
        },
        howToDecide:
          'Server-assigned sequence per conversation. Ordering only has to be total within a conversation, not globally, which keeps the coordination scope small — one partition, not the system.',
      },
      {
        decision: 'Group message fan-out: at write or at read?',
        optionA: {
          name: 'Write once, read by all members',
          whenItWins: 'Groups of any meaningful size — one row, and every member reads the same partition.',
          cost: 'Each member needs their own read cursor and receipt state, so per-member metadata still exists.',
        },
        optionB: {
          name: 'Copy into each member\'s inbox',
          whenItWins: 'Very small groups, or when per-recipient mutation is needed.',
          cost: 'Storage multiplied by group size; a 500-member group turns one message into 500 writes.',
        },
        howToDecide:
          'Single copy per conversation plus per-member cursors. This is why conversationId is the partition key — it makes both the write and every member\'s read a single-partition operation.',
      },
      {
        decision: 'How is presence propagated without swamping the system?',
        optionA: {
          name: 'Push every state change to all contacts',
          whenItWins: 'Small contact lists and low churn.',
          cost: 'A user on a flaky mobile network flaps online and offline repeatedly, multiplying into a fan-out storm larger than actual message traffic.',
        },
        optionB: {
          name: 'Heartbeat with a TTL, pulled on demand',
          whenItWins: 'Realistic mobile conditions. The client refreshes presence only for contacts currently on screen.',
          cost: 'Presence is slightly stale, and "last seen" granularity is coarser.',
        },
        howToDecide:
          'Heartbeat into a store with a short TTL; treat a missing heartbeat as offline; fetch on view rather than pushing broadly. Add debouncing so a thirty-second disconnect does not generate two events. Presence being seconds stale is invisible; a presence storm is not.',
      },
    ],
    bottlenecks: [
      {
        heading: 'Gateway node failure drops 100k connections at once',
        body:
          'Every affected client reconnects simultaneously against the remaining nodes, and each replays its sync cursors. Mitigate with jittered client reconnect backoff and by spreading a user\'s reconnect across the fleet; without jitter the fleet fails progressively as each node takes the load of the last.',
      },
      {
        heading: 'The connection registry is on every message path',
        body:
          'It is read for every recipient of every message, so it must be fast and highly available. Cache it at the gateway with a short TTL, and design for the stale case: forwarding to a node that no longer holds the socket should fail fast and fall back to a registry re-read.',
      },
      {
        heading: 'Hot conversations serialise',
        body:
          'A single very active group partitions to one node and its sequence assignment is serial. For groups large enough for this to matter, relax to per-sender ordering with a merge at read, and say explicitly that you are weakening the guarantee and why.',
      },
    ],
    followUps: [
      'How would you add end-to-end encryption, and what does it cost you in server-side features?',
      'How do you sync history to a newly added device without re-sending years of messages?',
      'What changes for a 100,000-member broadcast channel rather than a 500-member group?',
      'How do you implement message deletion for everyone, given messages already delivered to offline devices?',
    ],
  },
};

export const rateLimiter: SdModule = {
  id: 'case-rate-limiter',
  kind: 'case',
  name: 'Design a Rate Limiter',
  whyItMatters:
    'Small enough to be asked as a 30-minute question and deep enough to separate people, because the distributed version forces you to confront accuracy against latency explicitly. It also appears as a deep dive inside half the other cases.',
  estHours: 3,
  prerequisites: ['api-edge'],
  notes: [],
  figures: [],
  tradeoffs: [],
  caseStudy: {
    id: 'rate-limiter',
    name: 'Distributed Rate Limiter',
    prompt: 'Design a rate limiter for a public API: each client gets a quota, and requests beyond it are rejected.',
    difficulty: 'standard',
    estMinutes: 40,
    askedBy: ['amazon', 'google', 'microsoft'],
    requirements: [
      'Enforce per-client limits such as 1,000 requests per minute.',
      'Support several rules at once — per second, per minute, per day — and per endpoint.',
      'Reject over-limit requests with a clear response and a retry hint.',
      'Rules are configurable without redeploying the service.',
    ],
    constraints: [
      'Adds under a millisecond to the request path; a slow limiter is worse than no limiter.',
      'Works across a fleet of API nodes, not per node.',
      'Must fail open: if the limiter is down, traffic should flow rather than the API going dark.',
      'Memory bounded — millions of distinct clients cannot each hold unbounded state.',
    ],
    estimation: [
      { label: 'API traffic', value: '100k rps', soWhat: 'Every request touches the limiter, so it needs cache-tier throughput.' },
      { label: 'Distinct keys', value: '~10M active clients', soWhat: 'At ~50 B of state per key, roughly 500 MB — easily in memory.' },
      { label: 'State per key (token bucket)', value: '2 values', soWhat: 'Token count plus last-refill timestamp. Cheap enough to make the choice obvious.' },
      { label: 'Added latency budget', value: '< 1 ms', soWhat: 'Rules out any design with a cross-region hop on the hot path.' },
    ],
    api: [
      'Internal: allow(key, rule) -> { allowed: bool, remaining: int, retryAfterMs: int }',
      'Admin: PUT /rules/{scope} { limit, windowSeconds, endpoint? } -> 204',
      'Response headers: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After',
    ],
    dataModel: [
      {
        heading: 'counter state in Redis',
        body:
          'Key is a composite of client identity, rule and window — for example "user:123:posts:minute". Value is the bucket state with a TTL slightly longer than the window, so keys for idle clients expire on their own and memory stays bounded without a sweeper.',
      },
      {
        heading: 'rules configuration',
        body:
          'Stored centrally and cached locally in each node with a short TTL, because rules change rarely and are read on every request. A rule change taking a few seconds to propagate is fine and says so explicitly.',
      },
    ],
    highLevel: [
      'The request arrives at the API gateway or a middleware in the service.',
      'The limiter derives the key from the authenticated client, or from IP for unauthenticated routes.',
      'A single atomic Redis operation — a Lua script — refills the bucket by elapsed time, attempts to take a token, and returns the result.',
      'If a token was taken the request proceeds and rate-limit headers are attached; otherwise the gateway returns 429 with Retry-After.',
      'If Redis is unreachable, the limiter falls back to a per-node local limit and allows traffic rather than failing the request.',
    ],
    deepDives: [
      {
        decision: 'Which algorithm: fixed window, sliding log, sliding counter, or token bucket?',
        optionA: {
          name: 'Fixed window counter',
          whenItWins: 'Simplest possible implementation — one integer and a TTL.',
          cost: 'Allows twice the limit across a window boundary: a client can spend the whole quota at 0:59 and again at 1:00.',
        },
        optionB: {
          name: 'Token bucket',
          whenItWins: 'Almost always. Two values per key, smooth sustained rate, and it permits the short bursts real clients produce.',
          cost: 'Slightly more logic than a counter, and the burst capacity is another parameter to choose and explain.',
        },
        howToDecide:
          'Token bucket as the default. Mention the sliding-window counter as the middle ground when precise windows matter, and rule out the sliding log by cost: storing every timestamp is unaffordable at 100k rps.',
      },
      {
        decision: 'Centralised counters or per-node local limits?',
        optionA: {
          name: 'Centralised (shared Redis)',
          whenItWins: 'When the limit must be reasonably accurate globally — paid API quotas, for instance.',
          cost: 'A network hop on every request, and the store becomes a dependency on your hottest path.',
        },
        optionB: {
          name: 'Per-node local',
          whenItWins: 'Enormous traffic where approximate enforcement is fine and latency is sacred.',
          cost: 'Actual limit is roughly limit ÷ nodes per node, so uneven balancing lets some clients exceed quota; the effective ceiling drifts as the fleet scales.',
        },
        howToDecide:
          'Centralised with a local pre-filter: the local counter rejects the obviously over-limit cheaply, and the shared store arbitrates the rest. Then say the accuracy you are accepting — a few percent overshoot during rebalancing — rather than claiming exactness you do not have.',
      },
      {
        decision: 'Fail open or fail closed when the limiter store is down?',
        optionA: {
          name: 'Fail open',
          whenItWins: 'The limiter exists to protect against abuse, not to be the availability of the product.',
          cost: 'During an outage you are unprotected, which an attacker could in principle trigger deliberately.',
        },
        optionB: {
          name: 'Fail closed',
          whenItWins: 'When the limit enforces something with financial or legal weight — metered billing, for example.',
          cost: 'A limiter outage becomes a full API outage, turning a protective component into a single point of failure.',
        },
        howToDecide:
          'Fail open for protection limits, with the local fallback taking over so you are degraded rather than defenceless. Fail closed only where exceeding the limit costs real money, and say which category you are in.',
      },
      {
        decision: 'Where does the limiter run — gateway or service?',
        optionA: {
          name: 'At the gateway',
          whenItWins: 'One place to configure, and rejected traffic never reaches your services at all.',
          cost: 'The gateway may not know service-specific context such as which plan a caller is on.',
        },
        optionB: {
          name: 'In each service',
          whenItWins: 'Per-endpoint limits that depend on business context the gateway lacks.',
          cost: 'Duplicated logic across services, and rejected requests have already consumed a hop and a connection.',
        },
        howToDecide:
          'Coarse limits at the gateway to shed obvious abuse early, fine-grained business limits in the service. The deciding question is whether the rule needs information only the service has.',
      },
    ],
    bottlenecks: [
      {
        heading: 'A hot key serialises on one Redis node',
        body:
          'A single large customer\'s key lives on one shard, and at high enough volume that shard saturates. Shard the key — split the quota across N sub-keys and pick one at random — accepting slightly looser enforcement in exchange for spreading the load.',
      },
      {
        heading: 'Redis round trip dominates a fast endpoint',
        body:
          'On an endpoint that otherwise takes 2 ms, a 1 ms limiter check is a third of the budget. Batch checks for multiple rules into one Lua script and keep the limiter in the same availability zone as the callers.',
      },
    ],
    followUps: [
      'How would you support quotas that reset at a wall-clock boundary, such as midnight in the user\'s timezone?',
      'How do you rate limit by cost rather than by request count, where one call is worth a hundred?',
      'What changes when limits must be enforced across several regions with the same global quota?',
    ],
  },
};
