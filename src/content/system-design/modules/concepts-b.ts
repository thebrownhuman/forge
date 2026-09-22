import type { SdModule } from '../schema';

/** Phase 2 concepts: distribution, consistency, and everything asynchronous. */

export const replicationSharding: SdModule = {
  id: 'replication-sharding',
  kind: 'concept',
  name: 'Replication and Sharding',
  whyItMatters:
    'Replication buys availability and read throughput; sharding buys write throughput and storage. They solve different problems and are constantly confused in interviews. Knowing which one a given bottleneck calls for — and what each breaks — separates candidates quickly.',
  estHours: 4,
  prerequisites: ['databases'],
  notes: [
    {
      heading: 'Replication copies everything; sharding splits it',
      body:
        'A replica holds the full dataset, so it adds read capacity and survives a node loss but does nothing for write load or storage. A shard holds a slice, so it adds write capacity and storage but does nothing for availability. A system at its write ceiling does not need replicas, and one falling over on node failure does not need shards — say which problem you are solving before you name the mechanism.',
    },
    {
      heading: 'Single-leader is the default, and its cost is failover',
      body:
        'One node takes writes and streams them to followers that serve reads. Simple, and it preserves a single ordering of writes. The cost is that the leader is a write bottleneck and a failure point: promoting a follower takes seconds to minutes, during which writes fail, and any writes not yet replicated are lost unless replication was synchronous.',
      detail: [
        'Asynchronous replication: fast writes, replica lag, and data loss on failover.',
        'Synchronous to at least one replica: no loss, but write latency is now the slowest replica.',
        'Multi-leader and leaderless exist, and both hand you write conflicts to resolve.',
      ],
    },
    {
      heading: 'Replica lag is a product problem, not just an ops one',
      body:
        'The instant you serve reads from followers, a user can write and then not see their own write. The usual fixes are to route reads for recently written keys to the leader, to pin a user to the leader for a few seconds after a write, or to accept it where the product tolerates it. Naming read-your-writes unprompted is a strong signal.',
    },
    {
      heading: 'The partition key is the whole sharding decision',
      body:
        'Everything else follows from it: how evenly data distributes, which queries stay on one shard, and which become scatter-gather across all of them. A key with skew produces hot shards that no amount of hardware fixes, so choose something high-cardinality and evenly accessed, and check that your most common read includes it.',
    },
    {
      heading: 'Consistent hashing exists to make resharding survivable',
      body:
        'With a plain modulo over N nodes, adding one node remaps nearly every key and the system stalls while data moves. Consistent hashing places nodes and keys on a ring so only the keys between the new node and its predecessor move — roughly 1/N of the data. Virtual nodes are added on top because a handful of real nodes lands unevenly on the ring.',
    },
  ],
  figures: [
    { label: 'Typical replica lag', value: '10 ms – 1 s', soWhat: 'Usually invisible, occasionally not — and it is always visible during a traffic spike.' },
    { label: 'Failover time', value: '10 s – 2 min', soWhat: 'Your write availability number cannot be better than this unless writes are buffered.' },
    { label: 'Data moved when adding a node', value: '~1/N with consistent hashing', soWhat: 'Versus nearly 100% with modulo hashing. This is the entire argument for the ring.' },
    { label: 'Virtual nodes per physical node', value: '100–256', soWhat: 'Enough to smooth out ring placement; fewer and the distribution is visibly lumpy.' },
  ],
  tradeoffs: [
    {
      decision: 'Shard by hash or by range?',
      optionA: {
        name: 'Hash',
        whenItWins: 'Point lookups by key, and any workload where even distribution matters more than ordering.',
        cost: 'Range queries become scatter-gather across every shard, because adjacent keys land far apart.',
      },
      optionB: {
        name: 'Range',
        whenItWins: 'Queries that scan a contiguous span — time series, alphabetical listings, anything with "between".',
        cost: 'Hot spots are near-guaranteed: recent data means the newest range takes every write.',
      },
      howToDecide:
        'If the dominant read is "give me this one key", hash. If it is "give me this window", range — and then plan explicitly for the hot end.',
    },
    {
      decision: 'Synchronous or asynchronous replication?',
      optionA: {
        name: 'Synchronous',
        whenItWins: 'Data you cannot lose: payments, ledgers, anything with a legal record.',
        cost: 'Write latency becomes the slowest replica, and losing a replica can block writes entirely.',
      },
      optionB: {
        name: 'Asynchronous',
        whenItWins: 'Most consumer workloads, where losing a second of writes in a rare failover is acceptable.',
        cost: 'Committed-looking writes can vanish on failover, and replicas serve stale reads.',
      },
      howToDecide:
        'Ask what a lost second of writes costs. Semi-synchronous — one synchronous replica, the rest async — is the usual production compromise and a good answer to give.',
    },
  ],
};

export const consistency: SdModule = {
  id: 'consistency',
  kind: 'concept',
  name: 'Consistency, CAP and What Users Actually See',
  whyItMatters:
    'This is the deep-dive topic that most reliably separates candidates, because it is easy to recite CAP and hard to say what a user observes when consistency is relaxed. Interviewers push here precisely because the vocabulary is widely memorised and rarely understood.',
  estHours: 4,
  prerequisites: ['replication-sharding'],
  notes: [
    {
      heading: 'CAP is narrower than people quote it',
      body:
        'The theorem says only this: when the network partitions, a distributed system must choose between refusing requests and serving possibly-stale data. It says nothing about the normal case, where you are really trading consistency against latency. Quoting "pick two of three" as a general design rule is the mistake interviewers listen for.',
    },
    {
      heading: 'Describe the guarantee in terms of what a user sees',
      body:
        'Instead of "eventually consistent", say "a user may see a stale like count for up to two seconds, but never sees their own like missing". That is the same statement made checkable, and it forces you to decide which anomalies are acceptable for this product rather than waving at a category.',
      detail: [
        'Read-your-writes: you always see your own changes.',
        'Monotonic reads: you never see time go backwards across successive reads.',
        'Causal: effects appear after their causes — a reply never precedes its parent.',
      ],
    },
    {
      heading: 'Strong consistency has a latency price, always',
      body:
        'Making every replica agree before acknowledging means a coordination round trip — a consensus protocol like Raft, or synchronous replication. Inside one datacentre that is a millisecond or two; across regions it is a hundred or more. This is why globally strong systems are rare and why most products localise strong consistency to the few operations that need it.',
    },
    {
      heading: 'Pick consistency per operation, not per system',
      body:
        'Within one product, a balance transfer needs strong consistency and a view counter does not. The strong answer in an interview is to split the system by requirement: transactional store for the handful of operations that need invariants, relaxed store for everything else. A blanket answer for the whole system is almost always wrong in one direction or the other.',
    },
  ],
  figures: [
    { label: 'Consensus round trip, one region', value: '1–10 ms', soWhat: 'Affordable inside a request budget; this is why single-region strong consistency is normal.' },
    { label: 'Consensus round trip, cross-region', value: '100–300 ms', soWhat: 'Blows most budgets — the reason global strong consistency is a specialist choice.' },
    { label: 'Quorum rule', value: 'R + W > N', soWhat: 'Lets you trade read and write latency against each other while keeping overlap.' },
    { label: 'Typical Dynamo-style setting', value: 'N=3, R=2, W=2', soWhat: 'Survives one node loss, keeps both paths fast, and satisfies the quorum rule.' },
  ],
  tradeoffs: [
    {
      decision: 'Strong consistency or eventual, for this operation?',
      optionA: {
        name: 'Strong',
        whenItWins: 'When an invariant must hold: money, inventory, unique usernames, seat allocation.',
        cost: 'Coordination latency on every write, and reduced availability during a partition.',
      },
      optionB: {
        name: 'Eventual',
        whenItWins: 'Counters, feeds, recommendations, presence — anywhere a brief disagreement is invisible or harmless.',
        cost: 'You must specify the anomalies users can observe, and handle conflicts explicitly.',
      },
      howToDecide:
        'Ask what a violation costs in the real world. Double-spending money is unacceptable; a like count that is briefly wrong is not. Then apply the stronger guarantee only where the cost is real.',
    },
    {
      decision: 'Resolve write conflicts by last-write-wins or by merge?',
      optionA: {
        name: 'Last-write-wins',
        whenItWins: 'Independent, overwritable values — a status flag, a profile field, a cached setting.',
        cost: 'Silently discards a concurrent write, and clock skew decides which one. Data loss without an error.',
      },
      optionB: {
        name: 'Merge (CRDT or application logic)',
        whenItWins: 'Collaborative state: shopping carts, collaborative documents, counters, sets.',
        cost: 'More complex data structures and more metadata; every type needs its own merge rule.',
      },
      howToDecide:
        'Ask whether losing one of two concurrent writes is acceptable. For a cart it is not, which is why the classic Dynamo answer merges carts rather than picking one.',
    },
  ],
};

export const asyncQueues: SdModule = {
  id: 'async-queues',
  kind: 'concept',
  name: 'Queues, Streams and Async Work',
  whyItMatters:
    'Anything slow, spiky or fan-out shaped belongs off the request path, and knowing where that boundary sits is core to the round. It is also where delivery semantics come up, and "exactly once" is the most common wrong answer in the whole interview.',
  estHours: 4,
  prerequisites: ['load-balancing'],
  notes: [
    {
      heading: 'A queue converts a latency problem into a throughput problem',
      body:
        'If the user does not need the result to continue, accept the request, enqueue the work and return. The response becomes fast and predictable, and a burst that would have overwhelmed the system becomes a backlog that drains. The cost is that the work is now eventual, so the product must tolerate a gap and expose progress somehow.',
    },
    {
      heading: 'Exactly-once delivery does not exist; idempotency does',
      body:
        'A broker can offer at-most-once or at-least-once. Anything marketed as exactly-once is at-least-once plus deduplication somewhere. The engineering answer is to make consumers idempotent — a natural key, a dedupe table, or an upsert — so redelivery is harmless. Saying this unprompted is one of the highest-signal sentences available in this round.',
    },
    {
      heading: 'Queues and logs are different tools',
      body:
        'A task queue delivers a message to one consumer and deletes it; work is distributed and disappears once done. A log keeps an ordered, replayable record that many independent consumers read at their own offsets. If you need several systems to react to the same event, or to reprocess history after a bug, you need a log, not a queue.',
      detail: [
        'Queue: SQS, RabbitMQ. Competing consumers, per-message ack, no history.',
        'Log: Kafka, Kinesis. Partitioned ordering, consumer groups, retention and replay.',
      ],
    },
    {
      heading: 'Design the failure path before the happy path',
      body:
        'Every consumer needs a retry policy with exponential backoff and jitter, a maximum attempt count, and a dead-letter queue for what still fails. Without a dead-letter queue a single poisoned message blocks a partition forever, which is a real outage and a favourite interviewer probe.',
    },
    {
      heading: 'Queue depth is your best early-warning metric',
      body:
        'A growing backlog means consumers are slower than producers, and it shows up well before user-visible failure. Alert on the depth trend and on consumer lag rather than on error rate alone, because a backlog that grows quietly for an hour becomes an incident with no warning.',
    },
  ],
  figures: [
    { label: 'Kafka throughput per broker', value: '~100k–1M msg/s', soWhat: 'Effectively never the bottleneck at interview scale; the consumers are.' },
    { label: 'Retry backoff', value: 'exponential, jittered', soWhat: 'Unjittered retries synchronise into a thundering herd against a recovering dependency.' },
    { label: 'Dead-letter threshold', value: '3–5 attempts', soWhat: 'Enough to ride out a transient fault, few enough not to block a partition for long.' },
    { label: 'Partition count', value: '≥ consumer count', soWhat: 'Consumer parallelism is capped by partitions, so this decides your maximum throughput.' },
  ],
  tradeoffs: [
    {
      decision: 'Synchronous call or asynchronous message?',
      optionA: {
        name: 'Synchronous',
        whenItWins: 'The caller needs the result to proceed, and the work is fast and reliable.',
        cost: 'Couples the caller to the callee\'s availability and latency; a slow dependency becomes your slow endpoint.',
      },
      optionB: {
        name: 'Asynchronous',
        whenItWins: 'Slow work, fan-out to several consumers, spiky load, or anything the user need not wait for.',
        cost: 'Eventual results, a broker to operate, and the need to expose status to the user somehow.',
      },
      howToDecide:
        'Ask whether the user can be told "done" before the work is finished. If yes, make it async — and then decide how they learn it actually completed.',
    },
    {
      decision: 'Fan out on write or fan out on read?',
      optionA: {
        name: 'On write (push)',
        whenItWins: 'Read-heavy systems with bounded fan-out — reads become a single sequential lookup.',
        cost: 'A write can trigger millions of writes for a popular account, and the work is wasted on inactive users.',
      },
      optionB: {
        name: 'On read (pull)',
        whenItWins: 'Heavy fan-out, celebrity accounts, and users who read rarely.',
        cost: 'Every read does a scatter-gather and merge, so read latency rises and is harder to cache.',
      },
      howToDecide:
        'Hybrid, and say so: push for ordinary accounts, pull for the few with enormous followings, merged at read time. That is what the real systems do, and naming the threshold shows you understand why.',
    },
  ],
};

export const apiEdge: SdModule = {
  id: 'api-edge',
  kind: 'concept',
  name: 'API Design, Rate Limiting and the Edge',
  whyItMatters:
    'The edge is where abuse, cost and latency are controlled, and rate limiting in particular is asked both as a deep dive and as a standalone question. It is also the cheapest place to demonstrate that you think about failure, not just about the happy path.',
  estHours: 3,
  prerequisites: ['caching'],
  notes: [
    {
      heading: 'Idempotency keys make retries safe',
      body:
        'A client that times out cannot tell whether the write happened, so it retries, and without protection you get two orders. Accept a client-supplied idempotency key, store the result against it, and return the stored result on repeat. Any design involving payments or orders should mention this unprompted.',
    },
    {
      heading: 'Paginate with cursors, not offsets',
      body:
        'An offset of 10,000 forces the database to count past ten thousand rows on every page, and rows inserted meanwhile shift the window so users see duplicates or gaps. An opaque cursor encoding the last-seen sort key is O(1) to resume and stable under concurrent writes.',
    },
    {
      heading: 'Token bucket is the rate limiter to reach for',
      body:
        'A bucket refills at a fixed rate up to a capacity; each request takes a token, and an empty bucket means rejection. It allows short bursts, which real clients need, while bounding the sustained rate — and it is two numbers per key in Redis, so it is cheap to implement and easy to explain.',
      detail: [
        'Fixed window is simplest but allows 2x the limit across a boundary.',
        'Sliding window log is exact and stores every timestamp — expensive at scale.',
        'Sliding window counter approximates the log cheaply and is a good compromise.',
      ],
    },
    {
      heading: 'Distributed rate limiting trades accuracy for latency',
      body:
        'Perfectly enforcing a global limit means every node checks shared state on every request, adding a round trip to the hot path. Most systems keep per-node local limits summing to roughly the global target, accepting overshoot during rebalancing. Say which you chose and what the overshoot is.',
    },
    {
      heading: 'Fail fast and shed load rather than queue it',
      body:
        'When a system is overloaded, admitting more work makes every request slower until all of them time out and none succeed. Rejecting excess quickly with a 429 and a Retry-After keeps the accepted fraction healthy. Circuit breakers apply the same logic to a failing dependency: stop calling it, serve degraded results, and probe periodically.',
    },
  ],
  figures: [
    { label: 'Rate limit response', value: '429 + Retry-After', soWhat: 'Tells a well-behaved client exactly when to come back, preventing a retry storm.' },
    { label: 'Token bucket state', value: '2 values per key', soWhat: 'Token count and last-refill timestamp — cheap enough for millions of keys in Redis.' },
    { label: 'CDN cache hit rate for static assets', value: '> 95%', soWhat: 'Static traffic should barely reach your origin; if it does, the cache headers are wrong.' },
    { label: 'Circuit breaker trip threshold', value: '~50% errors over a short window', soWhat: 'Fast enough to protect the caller, slow enough not to trip on noise.' },
  ],
  tradeoffs: [
    {
      decision: 'Rate limit per user or per IP?',
      optionA: {
        name: 'Per user',
        whenItWins: 'Authenticated APIs, where the account is the unit of fairness and abuse.',
        cost: 'Useless before login, which is exactly where credential-stuffing attacks arrive.',
      },
      optionB: {
        name: 'Per IP',
        whenItWins: 'Unauthenticated endpoints — sign-up, login, password reset.',
        cost: 'Punishes shared NATs and corporate networks, and is trivially evaded from a botnet.',
      },
      howToDecide:
        'Both, at different layers: per-IP limits on unauthenticated routes, per-user beyond them. Say that the pre-auth limit must be generous enough not to break a university campus.',
    },
    {
      decision: 'REST or gRPC for service-to-service calls?',
      optionA: {
        name: 'REST/JSON',
        whenItWins: 'Public APIs, heterogeneous clients, and anywhere debuggability and browser support matter.',
        cost: 'Verbose, slower to parse, and no schema enforcement unless you add one.',
      },
      optionB: {
        name: 'gRPC',
        whenItWins: 'Internal high-volume calls: binary encoding, generated clients, streaming, enforced schema.',
        cost: 'Poor browser story, harder to inspect on the wire, and a build-time dependency on protobufs.',
      },
      howToDecide:
        'REST at the edge because clients are diverse, gRPC inside because you own both ends and the efficiency compounds across millions of internal calls.',
    },
  ],
};

export const observability: SdModule = {
  id: 'observability',
  kind: 'concept',
  name: 'Failure, Observability and Operations',
  whyItMatters:
    'Senior candidates are separated from strong mid-level ones here. Anyone can design the happy path; the question that decides the level is "how do you know it is broken, and what happens while it is". Bring it up before you are asked.',
  estHours: 3,
  prerequisites: ['async-queues'],
  notes: [
    {
      heading: 'Design for partial failure, because that is the normal state',
      body:
        'At any real scale something is always degraded. The useful question is not whether a dependency fails but what your system does while it is failing: serve stale cache, degrade the feature, queue for later, or reject cleanly. Naming the degraded mode for each dependency is a senior move.',
    },
    {
      heading: 'Measure percentiles, never averages',
      body:
        'An average hides the tail completely: a service averaging 50 ms can have a p99 of two seconds, and that p99 is the experience of your heaviest users on every page with several calls on it. Quote p50, p95 and p99, and remember that a page making ten parallel calls experiences roughly its p99, not its p50.',
    },
    {
      heading: 'Logs, metrics and traces answer different questions',
      body:
        'Metrics tell you something is wrong and are cheap to keep at high resolution. Traces tell you where in a distributed call path it is wrong. Logs tell you why, for one specific request. A design that mentions only one of the three has a blind spot that is easy for an interviewer to probe.',
    },
    {
      heading: 'Retries need backoff, jitter and a budget',
      body:
        'Naive retries turn a brief degradation into an outage: every client retries simultaneously, tripling load on a service that was already struggling. Exponential backoff with jitter spreads them, and a retry budget — a cap on the fraction of traffic that may be retries — stops the amplification entirely.',
    },
    {
      heading: 'State an SLO and let it drive the design',
      body:
        '99.9% availability is about 43 minutes of downtime a month; 99.99% is about four. The second number rules out any single-region design and most maintenance windows. Stating the target early makes every later argument about replication and failover concrete rather than aesthetic.',
    },
  ],
  figures: [
    { label: '99.9% availability', value: '~43 min/month', soWhat: 'Achievable single-region with good deploy practice.' },
    { label: '99.99% availability', value: '~4.3 min/month', soWhat: 'Forces multi-region and automated failover — a design decision, not an ops one.' },
    { label: 'p99 vs p50', value: 'often 10–50x', soWhat: 'The tail, not the median, is what users on slow paths actually experience.' },
    { label: 'Fan-out tail amplification', value: '10 calls → p99 ≈ page p50', soWhat: 'Why tail latency matters far more in a microservice architecture than a monolith.' },
  ],
  tradeoffs: [
    {
      decision: 'Fail closed or fail open when a dependency is down?',
      optionA: {
        name: 'Fail closed (reject)',
        whenItWins: 'Security and correctness paths: authorisation, payment authorisation, fraud checks.',
        cost: 'The feature is unavailable, and if the dependency is on a hot path, so is your product.',
      },
      optionB: {
        name: 'Fail open (degrade)',
        whenItWins: 'Enrichment and optional features: recommendations, personalisation, analytics.',
        cost: 'Users get a worse experience silently, and failing open on a security check is a breach.',
      },
      howToDecide:
        'Classify each dependency as critical or enhancing at design time. Enhancing dependencies fail open behind a circuit breaker; critical ones fail closed and need their own redundancy.',
    },
    {
      decision: 'Multi-region active-active or active-passive?',
      optionA: {
        name: 'Active-active',
        whenItWins: 'Global users needing low latency, and availability targets that cannot absorb a failover.',
        cost: 'Concurrent writes in two regions means conflict resolution, and cross-region consistency is expensive.',
      },
      optionB: {
        name: 'Active-passive',
        whenItWins: 'Most systems: a standby region for disaster recovery, with a single write region.',
        cost: 'The passive region is idle capacity you pay for, and failover is a rehearsed procedure that takes minutes.',
      },
      howToDecide:
        'Start from the availability target and the write pattern. If writes can be partitioned by geography — users mostly write their own data — active-active is tractable; if every write touches global state, it usually is not.',
    },
  ],
};
