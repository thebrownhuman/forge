import type { SdModule } from '../schema';

/** Phase 1 concepts: the numbers, the front door, and the data tier. */

export const estimation: SdModule = {
  id: 'estimation',
  kind: 'concept',
  name: 'Back-of-Envelope Estimation',
  whyItMatters:
    'Every design decision in the round is downstream of one number: how much traffic and how much data. Candidates who skip the arithmetic end up defending architecture they cannot justify, and candidates who can do it in ninety seconds earn the right to say "this fits on one machine" when it does — which is often the strongest answer available.',
  estHours: 3,
  prerequisites: ['framework'],
  notes: [
    {
      heading: 'Round aggressively and say that you are rounding',
      body:
        'A day is 86,400 seconds; call it 100,000. A million daily users doing ten actions each is 10 million actions, so roughly 100 per second. Nobody is checking your arithmetic to two decimal places, and precision you did not earn is worse than an honest approximation, because it invites a correction that costs you time.',
    },
    {
      heading: 'Peak is not average',
      body:
        'Traffic is not flat across a day: a consumer product typically peaks at two to three times its average, and an event-driven one far higher. Size the system for peak and say which multiplier you used, because a design that only works at the mean will fall over every evening.',
      detail: [
        'Announce it: "I will assume peak is 3x average, so 300 writes per second."',
        'Spiky products — ticket sales, live sport, flash offers — are 10x or worse and need queueing rather than provisioning.',
      ],
    },
    {
      heading: 'Storage is a per-year number',
      body:
        'One record size times records per day times 365 gives you the annual figure that decides whether this is a single-database problem or a sharded one. Terabytes per year is ordinary and fine; petabytes per year changes the architecture and should be said out loud the moment you see it.',
    },
    {
      heading: 'The question behind every estimate: does the working set fit in memory?',
      body:
        'If the hot data fits in RAM across a modest cache tier, most read problems dissolve. Work out the size of what is actually read often — usually a small fraction of total storage — and compare it to a few hundred gigabytes, which is what a handful of cache nodes gives you cheaply.',
    },
  ],
  figures: [
    { label: 'Seconds in a day', value: '86,400 ≈ 100k', soWhat: 'Daily volume divided by 100k gives per-second load in one step.' },
    { label: 'L1 cache reference', value: '~1 ns', soWhat: 'The baseline everything else is measured against.' },
    { label: 'Main memory reference', value: '~100 ns', soWhat: 'Memory is ~100x slower than L1 and ~100,000x faster than disk seek.' },
    { label: 'SSD random read', value: '~100 µs', soWhat: 'A cache miss to SSD costs a thousand memory reads. This is why caching works.' },
    { label: 'Disk seek (HDD)', value: '~10 ms', soWhat: 'Roughly 100 seeks per second per spindle — the reason random access on spinning disk is avoided.' },
    { label: 'Round trip within a datacentre', value: '~0.5 ms', soWhat: 'You can afford several internal hops inside one request budget; you cannot afford dozens.' },
    { label: 'Round trip across continents', value: '~150 ms', soWhat: 'One cross-ocean hop blows a 200 ms budget. This is the whole argument for CDNs and regional replicas.' },
    { label: 'Typical QPS per commodity server', value: '~1,000–10,000', soWhat: 'Divide required QPS by this to size the fleet; if the answer is under five machines, stop designing for scale.' },
    { label: 'One row of structured data', value: '~100 B – 1 KB', soWhat: 'Lets you turn a record count into a storage figure without thinking.' },
  ],
  tradeoffs: [
    {
      decision: 'Estimate storage from record count, or from bandwidth?',
      optionA: {
        name: 'Record count × size',
        whenItWins: 'Structured data — posts, orders, messages — where a row has a predictable size.',
        cost: 'Badly underestimates systems dominated by blobs, where metadata is a rounding error next to the media.',
      },
      optionB: {
        name: 'Bandwidth × time',
        whenItWins: 'Media-heavy systems — video, images, backups — where what arrives is what you store.',
        cost: 'Ignores compression, deduplication and tiering, so it can overestimate by an order of magnitude.',
      },
      howToDecide:
        'Ask which dominates: if a single record carries a file, size the file and treat the row as free; otherwise count rows. Say which you chose and why in one sentence.',
    },
    {
      decision: 'Design for stated scale, or for ten times it?',
      optionA: {
        name: 'Stated scale',
        whenItWins: 'When the interviewer gave you a number — it is a constraint they chose, and honouring it shows discipline.',
        cost: 'You may be asked "and if this grows 10x?" and need a ready answer.',
      },
      optionB: {
        name: 'Ten times stated',
        whenItWins: 'When the product is obviously growing, or when the extra headroom is free.',
        cost: 'Complexity you cannot justify, and every box invites the question "why is that there?"',
      },
      howToDecide:
        'Design for the stated scale, but know which component saturates first at 10x and be ready to name it. That is the answer to the follow-up, and it is better than having pre-built for a load nobody asked for.',
    },
  ],
};

export const loadBalancing: SdModule = {
  id: 'load-balancing',
  kind: 'concept',
  name: 'Load Balancing and the Front Door',
  whyItMatters:
    'Everything user-facing arrives through this tier, so it is where availability, TLS, routing and the first line of defence live. It is also the easiest place to show you understand the difference between a component that can be trivially replicated and one that cannot.',
  estHours: 3,
  prerequisites: ['estimation'],
  notes: [
    {
      heading: 'Stateless services scale by addition; stateful ones do not',
      body:
        'If a request can be served by any instance, you scale by adding instances and the load balancer does the rest. The moment an instance holds session state, you have introduced affinity, and affinity turns a machine failure into a user-visible failure. Push session state into a shared store and keep the service tier disposable.',
    },
    {
      heading: 'Layer 4 versus Layer 7 is about what the balancer can see',
      body:
        'An L4 balancer routes on IP and port: fast, cheap, protocol-agnostic, and blind to the request. An L7 balancer terminates the connection and reads the HTTP request, which lets it route by path or header, retry idempotent calls, and apply per-route limits — at the cost of more CPU and a deeper dependency on the protocol.',
      detail: [
        'L7 is the default for user-facing HTTP; L4 for raw throughput or non-HTTP protocols.',
        'TLS termination at L7 lets you centralise certificates but means traffic inside the perimeter needs its own protection.',
      ],
    },
    {
      heading: 'Health checks are the actual availability mechanism',
      body:
        'A load balancer only helps if it removes broken instances quickly and adds them back carefully. A shallow check that only proves the process is alive will happily route to an instance whose database connection pool is exhausted; a deep check that exercises dependencies can take down the whole fleet when one shared dependency degrades. Most production systems run a shallow check for routing and a deep one for alerting.',
    },
    {
      heading: 'The balancer is itself a single point of failure',
      body:
        'Saying "load balancer" and moving on invites the obvious question. In practice the answer is DNS with multiple A records, or an anycast address fronting several balancers, so no single device is in the path of every request. Naming this unprompted is a cheap, strong signal.',
    },
  ],
  figures: [
    { label: 'Typical LB throughput', value: '10k–100k rps per node', soWhat: 'Most systems in an interview need one balancer tier, not a hierarchy of them.' },
    { label: 'Health check interval', value: '5–10 s', soWhat: 'With a 3-failure threshold, a dead instance leaves rotation in under a minute.' },
    { label: 'Connection draining', value: '30–60 s', soWhat: 'Long enough for in-flight requests to finish; this is why deploys are not instant.' },
  ],
  tradeoffs: [
    {
      decision: 'Round-robin or least-connections?',
      optionA: {
        name: 'Round-robin',
        whenItWins: 'Requests cost roughly the same and instances are identical — most stateless HTTP APIs.',
        cost: 'One slow request type can pile up on an unlucky instance, because the balancer is not watching load.',
      },
      optionB: {
        name: 'Least-connections',
        whenItWins: 'Request costs vary widely, or connections are long-lived, such as streaming and websockets.',
        cost: 'Requires per-instance state in the balancer and can herd traffic onto a newly added instance.',
      },
      howToDecide:
        'If the p99 of your request duration is close to the median, round-robin is fine. When the p99 is an order of magnitude above the median, track connections.',
    },
    {
      decision: 'Client-side load balancing or a dedicated balancer tier?',
      optionA: {
        name: 'Dedicated tier',
        whenItWins: 'Public traffic, mixed clients, and anywhere you need one place to enforce TLS, limits and WAF rules.',
        cost: 'An extra network hop and another thing to run and scale.',
      },
      optionB: {
        name: 'Client-side (service discovery in the caller)',
        whenItWins: 'Internal service-to-service traffic, where the hop matters and every client is yours.',
        cost: 'Balancing logic is duplicated into every client and every language, and a change means redeploying callers.',
      },
      howToDecide:
        'Dedicated at the edge, client-side or a service mesh inside. The deciding question is whether you control all the callers.',
    },
  ],
};

export const caching: SdModule = {
  id: 'caching',
  kind: 'concept',
  name: 'Caching',
  whyItMatters:
    'Caching is the highest-leverage move in most read-heavy designs and the source of the subtlest bugs, so it is asked constantly. The interview rarely wants "add Redis" — it wants to know which invalidation strategy you chose and what a user sees when it goes wrong.',
  estHours: 4,
  prerequisites: ['estimation'],
  notes: [
    {
      heading: 'Cache where the read amplification is, not everywhere',
      body:
        'There are several places to cache — browser, CDN, application memory, a shared cache tier, the database buffer pool — and each removes a different cost. Put the cache where the same expensive result is produced repeatedly, which is usually one or two specific queries, not the system as a whole.',
    },
    {
      heading: 'The strategy is defined by who writes to the cache',
      body:
        'Cache-aside means the application reads the cache, misses, reads the database and populates — simple, resilient, and the default. Write-through updates cache and database together, keeping them consistent at the cost of write latency. Write-behind acknowledges the write from cache and persists asynchronously, which is fast and will lose data if the cache dies.',
      detail: [
        'Cache-aside: misses are normal, so the system survives a cold cache.',
        'Write-through: every write pays both costs, but reads never see stale data through that path.',
        'Write-behind: only when losing a window of writes is genuinely acceptable.',
      ],
    },
    {
      heading: 'Invalidation is the hard part, and TTL is the honest default',
      body:
        'Explicit invalidation is correct and fragile: every code path that writes must remember to evict, and one that forgets produces a bug you will not find for a month. A short TTL bounds staleness without perfect discipline, so most systems use a TTL as the backstop and explicit eviction as an optimisation on the paths that matter.',
    },
    {
      heading: 'Name the three failure modes before you are asked',
      body:
        'A stampede is many concurrent misses on the same hot key hitting the database at once — fix with a lock or a single-flight fetch. Penetration is repeated lookups of a key that does not exist — fix by caching the negative result. An avalanche is a mass simultaneous expiry — fix by jittering the TTLs.',
    },
  ],
  figures: [
    { label: 'Target hit rate', value: '> 90%', soWhat: 'Below this, the cache is adding a hop and latency without removing much load.' },
    { label: 'Cache read latency', value: '< 1 ms in-datacentre', soWhat: 'Two orders of magnitude under a typical database query — that gap is the entire benefit.' },
    { label: 'Memory per cache node', value: '~64–256 GB', soWhat: 'Divide the hot-set size by this to size the tier; a handful of nodes covers most designs.' },
    { label: 'Typical TTL', value: '30 s – 1 h', soWhat: 'Choose it from how stale the product can tolerate being, then say that number out loud.' },
  ],
  tradeoffs: [
    {
      decision: 'Cache-aside or write-through?',
      optionA: {
        name: 'Cache-aside',
        whenItWins: 'Read-heavy workloads where some staleness is fine and resilience matters — the common case.',
        cost: 'Every key is cold once, and a race between a read populating and a write invalidating can leave stale data behind.',
      },
      optionB: {
        name: 'Write-through',
        whenItWins: 'Read-after-write correctness matters for the same key, such as a user seeing their own edit.',
        cost: 'Writes are slower, and you cache things nobody reads, wasting memory.',
      },
      howToDecide:
        'Ask whether a user reading immediately after their own write must see it. If yes, write-through for that path; otherwise cache-aside with a TTL.',
    },
    {
      decision: 'Local in-process cache or a shared cache tier?',
      optionA: {
        name: 'Local',
        whenItWins: 'Small, hot, slow-changing data — configuration, feature flags, reference tables. Nanosecond access, no network.',
        cost: 'Every instance holds a copy, so memory is multiplied and invalidation must fan out to all of them. Instances disagree during the gap.',
      },
      optionB: {
        name: 'Shared tier',
        whenItWins: 'Large data, or anything where all instances must agree — sessions, counters, rendered fragments.',
        cost: 'A network hop, and a new dependency whose failure you must design for.',
      },
      howToDecide:
        'Local when the data is small and stale copies are harmless; shared when the data is big or disagreement is visible to users. Many systems run both, with local in front of shared.',
    },
    {
      decision: 'Evict by LRU or by TTL?',
      optionA: {
        name: 'LRU (size-bounded)',
        whenItWins: 'The hot set is smaller than the cache and access is skewed — it keeps exactly what is being used.',
        cost: 'An item can live indefinitely if it stays warm, so staleness is unbounded without a separate TTL.',
      },
      optionB: {
        name: 'TTL (time-bounded)',
        whenItWins: 'Correctness requires a ceiling on how old data can be.',
        cost: 'Throws away still-hot entries, and synchronised expiry causes avalanches unless jittered.',
      },
      howToDecide:
        'Use both: TTL bounds staleness, LRU bounds memory. They answer different questions, and an interviewer noticing you treat them as alternatives will push on it.',
    },
  ],
};

export const databases: SdModule = {
  id: 'databases',
  kind: 'concept',
  name: 'Choosing a Database',
  whyItMatters:
    '"SQL or NoSQL" is the most common question in the round and the one most often answered by reputation rather than reasoning. The grading criterion is whether you derive the choice from access patterns and consistency needs, and whether you can name what you gave up.',
  estHours: 4,
  prerequisites: ['estimation'],
  notes: [
    {
      heading: 'Start from the queries, not the schema',
      body:
        'Write down the three reads the system performs most and the write that happens most often. A relational schema is designed so any query is possible; a wide-column or document schema is designed so specific queries are fast. Which of those you need is decided by whether your access patterns are known and few, or open-ended.',
    },
    {
      heading: 'Relational is the correct default and you should say so',
      body:
        'A single Postgres or MySQL instance handles tens of thousands of reads per second and a few thousand writes, with transactions, joins, secondary indexes and mature operations. Most systems described in an interview fit comfortably. Reaching for a distributed store before the relational one is exhausted is the most common overreach in this round.',
    },
    {
      heading: 'What "NoSQL" actually buys, and what it costs',
      body:
        'The families solve different problems: key-value for simple lookups at enormous rates, wide-column for huge write volumes with known partition keys, document for flexible nested records, graph for traversals. What they generally give up is cross-entity transactions, ad-hoc querying, and joins — which is fine if your access patterns are fixed and painful if they are not.',
      detail: [
        'Key-value: Redis, DynamoDB. Access by key, microsecond-scale, little else.',
        'Wide-column: Cassandra, HBase. Enormous write throughput; you must know the partition key up front.',
        'Document: MongoDB. Nested records, flexible schema; secondary indexes exist but cost.',
        'Graph: Neo4j. Many-hop traversals that would be self-joins in SQL.',
      ],
    },
    {
      heading: 'Indexes are the read/write trade in miniature',
      body:
        'Each index makes a class of read fast and every write to that table slower, because the index must be maintained. A table with eight indexes has a write path eight times heavier than it looks. When asked how to speed up a query, saying "add an index, which costs write throughput and storage" is a complete answer where "add an index" is half of one.',
    },
  ],
  figures: [
    { label: 'Single relational node, reads', value: '~10k–50k qps', soWhat: 'Most interview systems do not exceed this. Check before distributing anything.' },
    { label: 'Single relational node, writes', value: '~1k–10k tps', soWhat: 'The usual first ceiling, and the trigger for sharding or a different store.' },
    { label: 'Practical single-table size', value: '~1–10 TB', soWhat: 'Beyond this, index maintenance and backups get painful; it is the honest signal to partition.' },
    { label: 'Redis throughput', value: '~100k ops/s per node', soWhat: 'An order of magnitude above a relational node — the reason hot paths move off the database entirely.' },
  ],
  tradeoffs: [
    {
      decision: 'Relational or wide-column for a high-write workload?',
      optionA: {
        name: 'Relational, sharded',
        whenItWins: 'You need transactions or ad-hoc queries, and the write rate is within an order of magnitude of what one node does.',
        cost: 'You own the sharding: routing, rebalancing, and the loss of cross-shard joins and transactions.',
      },
      optionB: {
        name: 'Wide-column (Cassandra, etc.)',
        whenItWins: 'Writes dominate, access is by a known partition key, and eventual consistency is acceptable.',
        cost: 'No joins, limited ad-hoc querying, and a data model you must get right up front — changing the partition key later means a migration.',
      },
      howToDecide:
        'Can you name the partition key today, and is every important read served by it? If yes, wide-column is a fair choice. If you cannot, you will be fighting the store within a quarter.',
    },
    {
      decision: 'Normalise or denormalise?',
      optionA: {
        name: 'Normalised',
        whenItWins: 'Write-heavy data with strong integrity requirements, where one fact should live in one place.',
        cost: 'Reads need joins, which get expensive across shards — and across shards, may be impossible.',
      },
      optionB: {
        name: 'Denormalised',
        whenItWins: 'Read-heavy systems with a fixed display shape — feeds, timelines, product pages.',
        cost: 'Every copy must be updated, so writes fan out, and the system can be internally inconsistent while that happens.',
      },
      howToDecide:
        'Follow the read/write ratio. At 100:1 reads, pay on write and denormalise. Near parity, normalise and cache instead.',
    },
    {
      decision: 'Store blobs in the database or in object storage?',
      optionA: {
        name: 'In the database',
        whenItWins: 'Small objects, and when transactional consistency between the blob and its metadata genuinely matters.',
        cost: 'Bloats the database, slows backups and replication, and wastes an expensive tier on bytes it adds no value to.',
      },
      optionB: {
        name: 'Object storage, metadata in the database',
        whenItWins: 'Nearly always for media: cheap, effectively unbounded, and directly servable through a CDN.',
        cost: 'Two systems to keep in step, so orphaned objects and dangling references need a reconciliation job.',
      },
      howToDecide:
        'If the object is larger than a megabyte or will be served to users directly, it belongs in object storage with a URL in the row.',
    },
  ],
};
