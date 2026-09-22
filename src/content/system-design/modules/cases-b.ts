import type { SdModule } from '../schema';

export const webCrawler: SdModule = {
  id: 'case-web-crawler',
  kind: 'case',
  name: 'Design a Web Crawler',
  whyItMatters:
    'The purest distributed-systems question in the set: no product ambiguity, all mechanics. It rewards candidates who think about politeness, deduplication at scale and traps, and exposes those who treat it as a BFS exercise with more machines.',
  estHours: 4,
  prerequisites: ['async-queues', 'replication-sharding'],
  notes: [],
  figures: [],
  tradeoffs: [],
  caseStudy: {
    id: 'web-crawler',
    name: 'Web Crawler',
    prompt: 'Design a crawler that fetches a large portion of the public web, extracts links, and stores page content for later indexing.',
    difficulty: 'hard',
    estMinutes: 50,
    askedBy: ['google', 'microsoft', 'amazon'],
    requirements: [
      'Start from a seed set and discover pages by following links.',
      'Store raw page content for downstream processing.',
      'Recrawl pages periodically, more often for pages that change often.',
      'Respect robots.txt and per-host politeness limits.',
    ],
    constraints: [
      'Billions of pages, so every per-page data structure must be small.',
      'Must not overload any single host — politeness is a hard requirement, not a nicety.',
      'Must survive worker death without losing or duplicating large amounts of work.',
      'Must not be trapped by infinite URL spaces, redirect loops, or duplicate content.',
    ],
    estimation: [
      { label: 'Target', value: '1B pages/month ≈ 400 pages/s', soWhat: 'Modest per-second rate; the difficulty is breadth and state, not throughput.' },
      { label: 'Page size', value: '~500 KB raw, ~100 KB compressed', soWhat: '1B pages ≈ 100 TB/month compressed — object storage, definitely not a database.' },
      { label: 'URL frontier', value: '~10B known URLs × ~100 B ≈ 1 TB', soWhat: 'Too large for memory: the frontier is a disk-backed distributed queue.' },
      { label: 'Seen-set', value: '10B URLs × 8 B hash ≈ 80 GB', soWhat: 'Fits across a modest cluster if you store hashes, not URLs — this decision matters.' },
      { label: 'Politeness', value: '~1 request/host/second', soWhat: 'Caps per-host throughput, so parallelism must come from crawling many hosts at once.' },
    ],
    api: [
      'Internal: frontier.next(workerId) -> { url, hostToken } | empty',
      'Internal: frontier.add(urls[], discoveredFrom, priority)',
      'Internal: store.put(urlHash, compressedContent, fetchedAt, contentHash)',
      'Admin: POST /seeds { urls[] }',
    ],
    dataModel: [
      {
        heading: 'URL frontier',
        body:
          'Two-level queue structure. The front queues hold priority tiers; the back queues are per-host FIFOs, one host per queue, each with a next-allowed-fetch timestamp. A worker takes from a back queue only when its host timer has elapsed, which makes politeness a property of the data structure rather than something each worker must remember.',
      },
      {
        heading: 'seen-set',
        body:
          'Hash of the normalised URL, sharded by that hash. A Bloom filter in front absorbs most repeat checks in memory; the authoritative set behind it resolves the false positives. Normalisation — lowercasing the host, stripping fragments, sorting or removing tracking parameters — matters more than the storage choice, because without it the same page is crawled a hundred times.',
      },
      {
        heading: 'content store',
        body:
          'Object storage keyed by URL hash, with a content hash stored alongside so identical pages served under many URLs can be detected and collapsed without refetching.',
      },
    ],
    highLevel: [
      'Seed URLs are normalised, checked against the seen-set, and added to the frontier.',
      'A fetcher worker pulls a URL whose host is due, checks the cached robots.txt for that host, and fetches with a timeout.',
      'The response is compressed and written to object storage; a content hash is computed for duplicate detection.',
      'A parser extracts links, normalises them, filters by the seen-set and by crawl policy, and adds survivors back to the frontier.',
      'The host\'s next-allowed time is updated, returning its queue to the pool.',
      'A scheduler re-enqueues previously crawled URLs when their recrawl interval elapses, prioritised by observed change frequency.',
    ],
    deepDives: [
      {
        decision: 'How is politeness enforced across a distributed fleet?',
        optionA: {
          name: 'Host-sharded workers',
          whenItWins: 'A host maps to exactly one worker by hash, so per-host rate limiting is local state with no coordination at all.',
          cost: 'Load is uneven — a worker owning a huge host has far more to do — and a worker\'s death stalls its hosts until reassignment.',
        },
        optionB: {
          name: 'Shared distributed lock or token per host',
          whenItWins: 'Any worker can take any host, so load balances naturally.',
          cost: 'A coordination round trip per fetch, and lock churn becomes its own bottleneck at hundreds of fetches a second.',
        },
        howToDecide:
          'Host-sharded, because politeness is fundamentally per-host state and sharding turns a distributed problem into a local one. Handle the imbalance by splitting very large hosts across several back queues with a shared rate budget, and handle worker death by reassigning host ranges through consistent hashing.',
      },
      {
        decision: 'How do you deduplicate at ten billion URLs?',
        optionA: {
          name: 'Bloom filter only',
          whenItWins: 'Memory is the binding constraint and missing a few pages is acceptable.',
          cost: 'False positives mean real pages are silently never crawled, and you cannot tell which.',
        },
        optionB: {
          name: 'Bloom filter plus sharded authoritative set',
          whenItWins: 'Correctness matters and you still want most checks to be answered from memory.',
          cost: 'A network hop for the fraction that pass the filter, plus the storage for the real set.',
        },
        howToDecide:
          'Filter in front, authoritative set behind — the filter answers "definitely not seen" instantly and only possible hits pay the lookup. Then note that URL deduplication is not content deduplication: also hash the body, because the same content appears under countless URLs.',
      },
      {
        decision: 'How do you prioritise what to crawl next?',
        optionA: {
          name: 'Breadth-first from seeds',
          whenItWins: 'Simple, and it naturally reaches well-connected pages early.',
          cost: 'Spends effort on low-value pages and is easily led into large, worthless subtrees.',
        },
        optionB: {
          name: 'Priority by page importance and change rate',
          whenItWins: 'Finite capacity — which is always. Crawl budget goes where it produces the most value.',
          cost: 'Needs a scoring signal, and a feedback loop where unimportant pages are never crawled so never gain a score.',
        },
        howToDecide:
          'Priority tiers in the frontier, seeded by inbound link count and refined by observed change frequency: a news homepage every few minutes, a static page every month. Reserve a slice of capacity for exploration so new pages can be discovered despite having no score.',
      },
      {
        decision: 'How do you avoid crawler traps?',
        optionA: {
          name: 'Depth and per-host page caps',
          whenItWins: 'Cheap, blunt and effective against infinite calendars and session-id URL explosions.',
          cost: 'Truncates legitimately deep sites, so a genuinely large site is under-crawled.',
        },
        optionB: {
          name: 'Pattern detection on URL structure and content similarity',
          whenItWins: 'Catches traps that stay within caps, such as parameter permutations generating near-identical pages.',
          cost: 'More machinery, and it can misfire on legitimate parameterised sites such as large catalogues.',
        },
        howToDecide:
          'Both: caps as the safety net, similarity detection as the scalpel. Add URL normalisation first, since stripping session ids and sorting query parameters removes a large share of trap URLs before any detection is needed.',
      },
    ],
    bottlenecks: [
      {
        heading: 'DNS resolution becomes the limiting step',
        body:
          'Each new host needs a DNS lookup, which can take tens of milliseconds and is easy to overlook. Run a local caching resolver with a long TTL for stable hosts; without it, DNS quietly caps the whole fleet well below its fetch capacity.',
      },
      {
        heading: 'The frontier grows without bound',
        body:
          'Every page yields more links than it consumes, so the frontier grows faster than the crawl drains it. That is expected, and it means the frontier must be disk-backed and prioritised — capacity decides what you never reach, so the ordering policy is the real design.',
      },
      {
        heading: 'Worker death loses in-flight work',
        body:
          'A URL dequeued but not completed vanishes with the worker. Use lease semantics — the item is invisible for a timeout, then reappears — which gives at-least-once crawling; the content store being idempotent by URL hash makes the occasional duplicate harmless.',
      },
    ],
    followUps: [
      'How do you detect that a page has changed without downloading it in full?',
      'How would you support crawling JavaScript-rendered pages, and what does that cost?',
      'How do you handle a site that serves different content to your crawler than to users?',
      'How would you partition the crawl across regions to reduce latency and respect local law?',
    ],
  },
};

export const videoPlatform: SdModule = {
  id: 'case-video',
  kind: 'case',
  name: 'Design a Video Platform',
  whyItMatters:
    'The case where bandwidth, storage tiering and CDN economics dominate, and where the write path is a pipeline rather than a request. It punishes anyone who treats a 4 GB upload like a form submission.',
  estHours: 4,
  prerequisites: ['caching', 'async-queues'],
  notes: [],
  figures: [],
  tradeoffs: [],
  caseStudy: {
    id: 'video-platform',
    name: 'Video Upload and Streaming',
    prompt: 'Design a service like YouTube: creators upload video, viewers stream it worldwide at a quality suited to their connection.',
    difficulty: 'hard',
    estMinutes: 55,
    askedBy: ['google', 'amazon', 'meta'],
    requirements: [
      'Upload a video file, reliably, including from a flaky connection.',
      'Transcode into several resolutions and bitrates.',
      'Stream adaptively, switching quality as the viewer\'s bandwidth changes.',
      'Search and browse by metadata; track view counts.',
    ],
    constraints: [
      'Read-dominated: views vastly outnumber uploads.',
      'Playback must start in about a second, and must not stall mid-stream.',
      'Global audience, so origin round trips are unacceptable for the media itself.',
      'Bandwidth is the dominant cost, which makes CDN hit rate an architectural concern rather than an optimisation.',
    ],
    estimation: [
      { label: 'Uploads', value: '500 hours/min ≈ 8 hours/s', soWhat: 'Low request rate, enormous byte rate — the opposite shape from most systems.' },
      { label: 'Raw storage', value: '~1 GB per hour per rendition, ~5 renditions', soWhat: 'Roughly 5x the source per video; tiering cold content is a real cost decision, not a detail.' },
      { label: 'Peak egress', value: '10M concurrent viewers × 3 Mbps ≈ 30 Tbps', soWhat: 'Impossible from origin. The CDN is load-bearing architecture, not an add-on.' },
      { label: 'Transcode cost', value: '~1–5x real time per rendition', soWhat: 'A one-hour upload is several CPU-hours, so transcoding is a fleet with a queue, not a service call.' },
      { label: 'Popularity skew', value: 'top ~1% of videos ≈ most views', soWhat: 'A small hot set means a high CDN hit rate is achievable — and that the cold tail can live on cheap storage.' },
    ],
    api: [
      'POST /uploads -> { uploadId, presignedUrls[], partSize }',
      'PUT {presignedUrl} (direct to object storage, per part)',
      'POST /uploads/{uploadId}/complete { parts[] } -> { videoId, status: processing }',
      'GET /videos/{id} -> { metadata, manifestUrl, status }',
      'GET {manifestUrl} -> HLS/DASH manifest listing renditions and segments',
    ],
    dataModel: [
      {
        heading: 'video metadata',
        body:
          'Relational: videoId, ownerId, title, description, duration, status, createdAt, plus the rendition list. Small, queryable, and it needs the joins — this is not the part that is large.',
      },
      {
        heading: 'media objects',
        body:
          'Object storage, keyed by videoId and rendition, stored as segments of a few seconds each rather than whole files. Segmentation is what makes adaptive streaming and partial caching possible at all.',
      },
      {
        heading: 'view counts',
        body:
          'Never a synchronous increment. Events to a stream, aggregated into counters; the displayed count is deliberately approximate and slightly delayed, which nobody notices and which removes an enormous write load.',
      },
    ],
    highLevel: [
      'The client requests an upload and receives presigned URLs, then uploads parts directly to object storage — bytes never pass through your API tier.',
      'On completion the API records the video as processing and emits a transcode job.',
      'Transcode workers pull the job, produce each rendition as segments, write them to object storage, and generate the manifest.',
      'When all renditions are ready the video is marked available, and the metadata is indexed for search.',
      'A viewer fetches metadata and the manifest; the player requests segments, which are served by the CDN.',
      'A CDN miss pulls from origin object storage once and is then cached at that edge for subsequent viewers.',
      'Playback events flow to a stream for view counting and recommendations.',
    ],
    deepDives: [
      {
        decision: 'How do you make a multi-gigabyte upload survive a flaky connection?',
        optionA: {
          name: 'Single PUT through the API tier',
          whenItWins: 'Small files only.',
          cost: 'One dropped connection restarts the whole upload, and your API servers proxy terabytes for no reason.',
        },
        optionB: {
          name: 'Chunked multipart upload direct to object storage',
          whenItWins: 'Any large file. Only the failed chunk is retried, and chunks upload in parallel.',
          cost: 'More client complexity, orphaned parts from abandoned uploads to reap, and presigned URLs to scope carefully.',
        },
        howToDecide:
          'Multipart with presigned URLs, always — and say the second benefit explicitly: it keeps your compute tier out of the data path entirely, so upload bandwidth does not scale your API fleet.',
      },
      {
        decision: 'Transcode everything up front, or lazily on first request?',
        optionA: {
          name: 'Eager, all renditions',
          whenItWins: 'Playback is always instant at any quality, and the pipeline is simple and uniform.',
          cost: 'You pay CPU and storage for renditions of videos nobody ever watches — which, given the popularity skew, is most of them.',
        },
        optionB: {
          name: 'Lazy, on demand',
          whenItWins: 'Enormous cold catalogues where most uploads get almost no views.',
          cost: 'The first viewer of a rendition waits, which is a bad experience exactly when a video starts going viral.',
        },
        howToDecide:
          'Hybrid: eagerly produce a low and a medium rendition so playback always works immediately, and generate higher resolutions on demand or when view velocity crosses a threshold. That directly reflects the popularity skew you estimated.',
      },
      {
        decision: 'How does adaptive bitrate switching actually work?',
        optionA: {
          name: 'Server-driven selection',
          whenItWins: 'The server can use aggregate knowledge, and the client stays simple.',
          cost: 'The server does not know the client\'s buffer state, which is the signal that actually matters.',
        },
        optionB: {
          name: 'Client-driven from a manifest',
          whenItWins: 'Standard practice — HLS and DASH both do this. The client sees its own buffer and measured throughput and picks the next segment.',
          cost: 'Quality logic lives in every player, and aggressive switching can oscillate visibly.',
        },
        howToDecide:
          'Client-driven, because the buffer level is the deciding input and only the client has it. The server\'s job is to publish a manifest of segment-aligned renditions; keeping segments short — two to six seconds — is what makes switching responsive.',
      },
      {
        decision: 'What is stored on which storage tier?',
        optionA: {
          name: 'Everything on hot storage',
          whenItWins: 'Simplicity, and uniform access latency.',
          cost: 'You pay premium rates for a long tail that is almost never watched, which at this scale is most of the bill.',
        },
        optionB: {
          name: 'Tiered by access recency',
          whenItWins: 'Large catalogues with strong popularity skew — which is exactly what the estimate showed.',
          cost: 'Retrieval from cold tiers is slow and sometimes charged, so an unlucky viewer waits or the request must be served from a cached rendition.',
        },
        howToDecide:
          'Tier by last-access: hot for recent and popular, cold for the tail, keeping at least one low rendition hot for everything so any video plays immediately while higher qualities restore. Never put the tail\'s only copy somewhere that takes minutes to retrieve.',
      },
    ],
    bottlenecks: [
      {
        heading: 'CDN miss rate directly becomes origin cost',
        body:
          'At tens of terabits per second, even a small miss rate is a large origin load. Pre-warm edges for videos with rising view velocity, and keep segment URLs stable and cacheable — a cache-busting query parameter in the media path would be catastrophic here.',
      },
      {
        heading: 'Transcode queue backs up on upload spikes',
        body:
          'The fleet is sized for average load, so a spike delays publication for everyone. Prioritise by creator tier and video length, always produce the lowest rendition first so something is playable, and autoscale on queue depth rather than on CPU.',
      },
      {
        heading: 'A newly viral video is a cold-cache stampede',
        body:
          'Thousands of edges miss simultaneously on the same segments. Use origin shielding — a mid-tier cache that absorbs edge misses — so the origin sees one request per segment rather than one per edge.',
      },
    ],
    followUps: [
      'How do you support live streaming, where segments are produced as they are watched?',
      'How would you implement resumable playback across devices?',
      'How do you detect and handle copyrighted content at upload time?',
      'What changes if videos can be private or shared with a specific list of users?',
    ],
  },
};

export const fileStorage: SdModule = {
  id: 'case-file-storage',
  kind: 'case',
  name: 'Design a File Sync Service',
  whyItMatters:
    'The sync problem — several devices mutating the same tree while offline — forces you to reason about conflict resolution and delta transfer rather than request handling. It is the case where "last write wins" is most tempting and most wrong.',
  estHours: 4,
  prerequisites: ['consistency', 'databases'],
  notes: [],
  figures: [],
  tradeoffs: [],
  caseStudy: {
    id: 'file-storage',
    name: 'File Storage and Sync',
    prompt: 'Design a service like Dropbox: files sync across a user\'s devices, can be shared with others, and old versions can be restored.',
    difficulty: 'hard',
    estMinutes: 55,
    askedBy: ['google', 'microsoft', 'amazon'],
    requirements: [
      'Upload and download files, preserving a folder structure.',
      'Sync changes automatically to all of a user\'s devices.',
      'Share a folder with other users, with read or write access.',
      'Keep version history and allow restoring a previous version.',
    ],
    constraints: [
      'Devices are frequently offline and reconnect with divergent local state.',
      'Files range from bytes to gigabytes, so transfers must be incremental.',
      'Storage cost matters at scale — identical content should not be stored repeatedly.',
      'A user must never silently lose an edit they made.',
    ],
    estimation: [
      { label: 'Users / devices', value: '100M users × ~3 devices', soWhat: '300M sync clients, each polling or holding a connection — the notification tier is substantial.' },
      { label: 'Storage', value: '~10 GB/user ≈ 1 EB raw', soWhat: 'Deduplication and delta storage are not optimisations here, they are the economics of the product.' },
      { label: 'Block size', value: '~4 MB', soWhat: 'Small enough for useful delta transfer, large enough that metadata stays a fraction of content.' },
      { label: 'Change events', value: '~10 per user per day ≈ 12,000/s', soWhat: 'Modest, but each fans out to the user\'s other devices and every collaborator.' },
      { label: 'Dedup saving', value: 'often 30%+ on shared corpora', soWhat: 'Content-addressed blocks pay for themselves immediately in a business context.' },
    ],
    api: [
      'POST /files/{path}/blocks { blockHashes[] } -> { missingHashes[] }',
      'PUT /blocks/{hash} (upload only blocks the server lacks)',
      'POST /files/{path}/commit { blockHashes[], baseVersion } -> { version } | 409 conflict',
      'GET /changes?cursor={cursor} -> { changes[], nextCursor }',
      'POST /shares { path, userId, role } -> 204',
    ],
    dataModel: [
      {
        heading: 'blocks (content-addressed)',
        body:
          'Object storage keyed by the hash of the block content. Identical blocks are stored once globally, with a reference count or a garbage collector to reclaim unreferenced ones. This single decision delivers both deduplication and delta transfer.',
      },
      {
        heading: 'file metadata',
        body:
          'Per file: path, ordered list of block hashes, version number, size, modified time, owner. A version is a new list of block hashes, so history costs only the blocks that actually changed.',
      },
      {
        heading: 'change journal',
        body:
          'An append-only per-user log of metadata changes with a monotonically increasing cursor. A device syncs by sending its cursor and receiving everything after it, which makes reconnection a range read rather than a diff of the whole tree.',
      },
    ],
    highLevel: [
      'The client watches the local filesystem, chunks changed files into blocks, and hashes each block.',
      'It asks the server which block hashes are missing, and uploads only those — unchanged blocks and blocks any other user already stored cost nothing.',
      'It commits the new block list for the file against the version it started from.',
      'The server appends to the change journal for the owner and every user the folder is shared with.',
      'Other devices learn of the change over a long-lived connection, or by polling with their cursor.',
      'Each device fetches the new metadata, downloads only the blocks it lacks, and reassembles the file locally.',
    ],
    deepDives: [
      {
        decision: 'How are concurrent edits to the same file resolved?',
        optionA: {
          name: 'Last write wins',
          whenItWins: 'Almost never for user files.',
          cost: 'Silently destroys one user\'s work, with the winner decided by clock skew. This is the answer interviewers are waiting to challenge.',
        },
        optionB: {
          name: 'Optimistic concurrency, then a conflict copy',
          whenItWins: 'General file sync, where the server cannot merge arbitrary binary content.',
          cost: 'The user is handed two files and must resolve it themselves, which is ugly but honest.',
        },
        howToDecide:
          'Commit against a base version; if the server\'s version has moved, reject with a conflict and have the client create "document (conflicted copy from Anna\'s laptop)". Never merge binary files automatically, and never discard one side — the requirement says a user must not silently lose an edit, and this is the only option that satisfies it.',
      },
      {
        decision: 'How does a device learn about changes — push or poll?',
        optionA: {
          name: 'Long-lived connection (push)',
          whenItWins: 'Sync feels instant, and idle clients cost almost nothing beyond the socket.',
          cost: '300M persistent connections is a large, stateful tier with its own failure modes.',
        },
        optionB: {
          name: 'Polling with a cursor',
          whenItWins: 'Simple, stateless, and resilient on mobile networks that kill idle sockets.',
          cost: 'Latency equal to the poll interval, and constant background traffic from idle clients.',
        },
        howToDecide:
          'A lightweight notification channel that carries only "you have changes", plus a cursor-based pull for the content. The connection tier then holds no per-file state and can drop a notification harmlessly, because the next poll or reconnect catches up anyway.',
      },
      {
        decision: 'Fixed-size or content-defined chunking?',
        optionA: {
          name: 'Fixed-size blocks',
          whenItWins: 'Simple, predictable, and fine for appends and in-place edits.',
          cost: 'Inserting a byte at the start shifts every subsequent boundary, so the whole file re-uploads despite being nearly identical.',
        },
        optionB: {
          name: 'Content-defined (rolling hash) chunking',
          whenItWins: 'Documents edited in the middle, where boundary stability is what makes deduplication work at all.',
          cost: 'More CPU on the client and variable block sizes to manage.',
        },
        howToDecide:
          'Content-defined for documents, because the insert case is common and fixed blocks handle it worst. Naming the shifted-boundary problem unprompted is the signal here — it is the reason the sophisticated answer exists.',
      },
      {
        decision: 'How is a shared folder\'s change fanned out?',
        optionA: {
          name: 'Write to each member\'s journal',
          whenItWins: 'Small share groups — each member\'s sync stays a single sequential read of their own journal.',
          cost: 'A change in a folder shared with thousands writes thousands of journal entries.',
        },
        optionB: {
          name: 'Per-folder journal, merged at read',
          whenItWins: 'Large shared folders, where per-member copies would be wasteful.',
          cost: 'A device must merge its personal journal with one per shared folder, so sync is a scatter-gather.',
        },
        howToDecide:
          'The same threshold pattern as a news feed: per-member journals below a size, per-folder journals above, merged on read. Saying that this is the fan-out tradeoff in different clothing is exactly the transfer an interviewer wants to see.',
      },
    ],
    bottlenecks: [
      {
        heading: 'Metadata is the hot store, not the blocks',
        body:
          'Blocks live in object storage and scale on their own; the metadata database takes every list, commit and journal write. It is the first thing to shard, partitioned by userId so a user\'s tree and journal stay on one shard and sync stays a single-partition read.',
      },
      {
        heading: 'Garbage collecting unreferenced blocks is risky',
        body:
          'Deleting a block still referenced by another user destroys their file. Reference counting races with concurrent uploads, so use mark-and-sweep with a grace period and never delete a block written recently.',
      },
      {
        heading: 'A device that was offline for months reconnects',
        body:
          'Its cursor is far behind and the journal replay is enormous. Compact journals beyond a horizon into a snapshot of current state, and have very stale clients fetch the snapshot and then resume the journal.',
      },
    ],
    followUps: [
      'How would you add end-to-end encryption while keeping cross-user deduplication?',
      'How do you handle a folder shared with ten thousand users, all editing?',
      'How would you support selective sync so a device holds only part of the tree?',
      'What changes if a file must be strongly consistent across devices, as in a collaborative editor?',
    ],
  },
};

export const rideHailing: SdModule = {
  id: 'case-ride-hailing',
  kind: 'case',
  name: 'Design a Ride-Hailing Service',
  whyItMatters:
    'The geospatial case: continuous location updates, proximity search, and a matching step that must not assign one driver to two riders. It brings in write-heavy streaming and a genuine distributed-locking problem, which few other cases do.',
  estHours: 4,
  prerequisites: ['consistency', 'async-queues'],
  notes: [],
  figures: [],
  tradeoffs: [],
  caseStudy: {
    id: 'ride-hailing',
    name: 'Ride Hailing',
    prompt: 'Design a service like Uber: riders request a trip, nearby drivers are matched to them, and both track the trip in real time.',
    difficulty: 'hard',
    estMinutes: 55,
    askedBy: ['amazon', 'google', 'meta'],
    requirements: [
      'Drivers continuously report their location while available.',
      'A rider requests a trip from a pickup point and is matched to a nearby driver.',
      'Both parties see the other\'s live position during the trip.',
      'Trips have a lifecycle — requested, accepted, in progress, completed — with fare calculated at the end.',
    ],
    constraints: [
      'Location writes are constant and enormous; the freshest value is the only one that matters.',
      'Matching must be fast — a rider waiting more than a few seconds abandons.',
      'A driver must never be assigned to two trips simultaneously.',
      'Regional: almost all queries are local, which is an opportunity rather than a limitation.',
    ],
    estimation: [
      { label: 'Active drivers', value: '1M concurrent', soWhat: 'Sets the size of the live location index.' },
      { label: 'Location updates', value: 'every 4 s ≈ 250,000/s', soWhat: 'A huge write rate for data that is obsolete in seconds — this must not go to a durable database.' },
      { label: 'Trip requests', value: '~5,000/s peak', soWhat: 'Two orders of magnitude below location writes; the expensive path is matching, not request volume.' },
      { label: 'Location record', value: '~50 B', soWhat: '1M drivers ≈ 50 MB live — the whole index fits comfortably in memory.' },
      { label: 'Search radius', value: '1–5 km typical', soWhat: 'Bounds the candidate set to tens of drivers, which is what makes matching tractable.' },
    ],
    api: [
      'POST /drivers/location { lat, lng, heading, availability } -> 204',
      'POST /trips { pickup, destination, productType } -> { tripId, status: matching }',
      'GET /trips/{id} -> { status, driver?, eta?, driverLocation? }',
      'POST /trips/{id}/accept { driverId } -> 200 | 409 already taken',
      'WebSocket /trips/{id}/track -> location frames',
    ],
    dataModel: [
      {
        heading: 'live driver index',
        body:
          'In-memory geospatial index keyed by a geohash or S2 cell, holding driverId, position, heading and availability with a short TTL. Not durable and not meant to be: a location from thirty seconds ago has no value, so losing the index means rebuilding from the next round of updates.',
      },
      {
        heading: 'trips',
        body:
          'Durable and relational, partitioned by city or region. Holds the lifecycle state, both party ids, timestamps and fare. This is the record of truth, and it is the one that needs transactions.',
      },
      {
        heading: 'location history',
        body:
          'Appended to a stream and stored cheaply for billing disputes, route analysis and fraud, entirely separate from the live index. Two systems because the access patterns share nothing.',
      },
    ],
    highLevel: [
      'Driver apps send location updates to a gateway, which writes them to the in-memory geospatial index and mirrors them to a stream for history.',
      'A rider requests a trip; the trip service creates a trip row in the matching state.',
      'The matching service queries the index for the geohash cell containing the pickup point plus its neighbours, producing a candidate set.',
      'Candidates are ranked by estimated time of arrival rather than straight-line distance, then offered the trip in order, or in small parallel batches.',
      'The first driver to accept wins via a conditional update on the trip row; losers get a 409 and remain available.',
      'Once accepted, both clients subscribe to a trip channel that relays the driver position until the trip completes and the fare is computed.',
    ],
    deepDives: [
      {
        decision: 'How do you index locations for proximity search?',
        optionA: {
          name: 'Geohash / S2 cells in memory',
          whenItWins: 'Nearly always here: a prefix lookup gives the candidate set, updates are O(1), and it shards naturally by cell.',
          cost: 'Cell boundaries are artificial — a driver just across a boundary is missed unless you also query neighbouring cells.',
        },
        optionB: {
          name: 'Quadtree or R-tree',
          whenItWins: 'Highly non-uniform density, since the structure adapts to where drivers actually are.',
          cost: 'Rebalancing on every update is expensive at 250,000 writes a second, which is the operation that dominates.',
        },
        howToDecide:
          'Geohash cells, always querying the target cell plus its eight neighbours to eliminate the boundary problem. Choose the precision so a typical cell holds tens of drivers: too coarse and you scan thousands, too fine and you query dozens of cells.',
      },
      {
        decision: 'Where do the 250,000 location writes per second go?',
        optionA: {
          name: 'Straight into a durable database',
          whenItWins: 'Never at this rate for this data.',
          cost: 'Enormous write amplification, index churn and storage, for values that are worthless within seconds.',
        },
        optionB: {
          name: 'In-memory index, with history to a stream',
          whenItWins: 'The live query needs only the newest position; history has completely different requirements.',
          cost: 'Losing the index loses live state, though it rebuilds within one update interval.',
        },
        howToDecide:
          'Split by purpose: memory for the live index because staleness beyond seconds makes the data useless, and an append-only stream for history because it is written once and read rarely. Recognising that these are two systems is the core insight of this case.',
      },
      {
        decision: 'How do you prevent double-assigning a driver?',
        optionA: {
          name: 'Conditional update on the trip and driver state',
          whenItWins: 'A single atomic compare-and-set is enough, and it is the simplest correct mechanism.',
          cost: 'Requires the driver state to live somewhere with atomic operations, and losers must be handled gracefully.',
        },
        optionB: {
          name: 'Distributed lock per driver',
          whenItWins: 'When several services need to coordinate over a driver for longer than one operation.',
          cost: 'Lock lifetimes, expiry and the failure case where the holder dies mid-hold — all avoidable complexity here.',
        },
        howToDecide:
          'Conditional update: offer to several drivers, and the first accept succeeds via compare-and-set on the trip row while the rest get 409. Mark the driver unavailable in the same transaction. Avoid the distributed lock — this is one atomic write, not a coordination protocol.',
      },
      {
        decision: 'Offer the trip to drivers one at a time or in parallel?',
        optionA: {
          name: 'Sequential',
          whenItWins: 'It is fair and never annoys drivers with offers that vanish.',
          cost: 'Each timeout costs several seconds, and a few unresponsive drivers in a row lose the rider.',
        },
        optionB: {
          name: 'Parallel batch',
          whenItWins: 'Fast matching, and it tolerates drivers who do not respond.',
          cost: 'Most recipients lose the race, which is a poor driver experience and can suppress acceptance rates.',
        },
        howToDecide:
          'Small parallel batches — three to five — with a short timeout, then the next batch. Tie the batch size to observed acceptance rate: high acceptance means sequential is fine, low acceptance means widen the batch.',
      },
    ],
    bottlenecks: [
      {
        heading: 'Dense cells during surge events',
        body:
          'A stadium at closing time puts thousands of drivers and riders in one cell, so a candidate query scans far too many. Subdivide cells dynamically by density, and cap the candidate set by taking the nearest N rather than everything in range.',
      },
      {
        heading: 'Tracking connections during long trips',
        body:
          'Every active trip holds two subscribers for its duration. Relay positions through a partitioned channel keyed by tripId so any gateway can serve either party, and reduce update frequency when the vehicle is stationary.',
      },
      {
        heading: 'Region boundaries',
        body:
          'Sharding by city breaks for trips that cross a boundary, and for cities close together. Shard by geographic region with overlap at the edges, and allow the matching query to read from two shards near a border rather than pretending boundaries do not exist.',
      },
    ],
    followUps: [
      'How would you implement surge pricing without making the price flicker for a waiting rider?',
      'How do you handle a driver going offline mid-trip?',
      'How would you support carpooling, where one driver serves several riders with overlapping routes?',
      'How do you compute an accurate ETA, and what data would you need for it?',
    ],
  },
};
