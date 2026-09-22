import type { SdModule } from '../schema';

/**
 * The method. Everything else in this track is material you pour into these
 * seven steps. Candidates who fail this round rarely fail on knowledge — they
 * fail by designing before agreeing what they are designing, or by narrating
 * a diagram with no decisions in it.
 */
export const framework: SdModule = {
  id: 'framework',
  kind: 'framework',
  name: 'The 45-Minute Method',
  whyItMatters:
    'A design round has no right answer, so it is scored on process: did you scope it, size it, and defend your choices. A candidate with an ordinary design and a clean method beats one with a clever design and no method, every time. Run these seven steps in this order until they are automatic, so that under pressure you are executing rather than improvising.',
  estHours: 4,
  prerequisites: [],
  notes: [
    {
      heading: 'Drive the interview; do not wait to be asked',
      body:
        'The interviewer is assessing whether you can run a design discussion, which means you set the agenda out loud: "I will spend five minutes on requirements, then sizing, then a high-level design, and we can go deep wherever you like." Announcing the plan converts an ambiguous hour into a structure you control, and it tells them immediately that you have done this before.',
    },
    {
      heading: 'Say the number before you say the design',
      body:
        'Every architectural choice follows from scale. One thousand writes a second and one million writes a second are different problems with different answers, so a design offered before the estimate is a guess. Doing the arithmetic first also gives you the right to say "this fits on one Postgres box" when it does, which is a stronger answer than a distributed system nobody needs.',
    },
    {
      heading: 'A design is a set of decisions, not a set of boxes',
      body:
        'Drawing a load balancer, a service and a database demonstrates nothing — everyone draws that. The signal is in the sentences that connect them: why this database, what happens when this queue backs up, what you give up by caching here. If a minute has passed without you naming a tradeoff, you are narrating, not designing.',
    },
    {
      heading: 'Be explicit about what you are not building',
      body:
        'Scope creep kills more design interviews than ignorance. Say "I am going to treat auth as a solved problem and focus on the feed, unless you would rather go the other way" — this shows judgement about what matters and hands the interviewer a cheap way to redirect you.',
    },
  ],
  figures: [
    {
      label: 'Round length',
      value: '45–60 min',
      soWhat: 'You get roughly 40 usable minutes after intros. Anything you have not rehearsed will not fit.',
    },
    {
      label: 'Time on requirements',
      value: '5 min',
      soWhat: 'Under three minutes and you are guessing at scope; over eight and you will not reach a deep dive.',
    },
    {
      label: 'Deep dives expected',
      value: '2–3',
      soWhat: 'This is where the grade is actually decided. Leave at least 15 minutes for it.',
    },
  ],
  tradeoffs: [
    {
      decision: 'Go broad across the whole system, or deep on one component?',
      optionA: {
        name: 'Broad',
        whenItWins: 'Early in the round, and when the interviewer has not yet steered — it establishes that you can see the whole system.',
        cost: 'Stay broad the whole hour and you produce a diagram with no defended decisions, which reads as shallow.',
      },
      optionB: {
        name: 'Deep',
        whenItWins: 'Once a high-level design exists and the interviewer shows interest in a component, or asks "how would you handle…".',
        cost: 'Going deep too early leaves the rest of the system undefined, and you can burn the round on a detail nobody cared about.',
      },
      howToDecide:
        'Broad until a complete-if-naive system exists end to end, then deep wherever the interviewer looks. Their follow-up question is the instruction; take it immediately rather than finishing your own thought.',
    },
    {
      decision: 'Start simple and scale up, or design for the target scale immediately?',
      optionA: {
        name: 'Simple first',
        whenItWins: 'Almost always. It shows you can find the smallest thing that works and evolve it under stated pressure.',
        cost: 'Costs a few minutes, and with an impatient interviewer can look like you are underestimating the problem — so say out loud that you will scale it next.',
      },
      optionB: {
        name: 'Target scale immediately',
        whenItWins: 'When the prompt states an enormous scale up front and the round is short.',
        cost: 'You inherit complexity you cannot justify, and you will be asked why each piece exists. "Because it is web scale" is not an answer.',
      },
      howToDecide:
        'Build the single-box version in one sentence, name what breaks first at the stated load, and let that failure introduce each new component. Every box in your final diagram should have arrived because something broke.',
    },
  ],
  steps: [
    {
      id: 'requirements',
      name: 'Requirements and scope',
      minutes: 5,
      output: 'A short written list: three to five functional requirements, and the two or three non-functional ones that will shape the design.',
      prompts: [
        'Who uses this, and what are the two or three things they do most?',
        'Read-heavy or write-heavy, and by roughly what ratio?',
        'How fresh must the data be — can a user tolerate seconds of staleness?',
        'What is explicitly out of scope for this hour?',
      ],
      failureMode:
        'Designing before agreeing the scope. You build a beautiful system for the wrong problem, and there is no time left to change it.',
    },
    {
      id: 'estimation',
      name: 'Back-of-envelope sizing',
      minutes: 5,
      output: 'Writes per second, reads per second, storage per year, and bandwidth — each with the arithmetic visible.',
      prompts: [
        'Daily active users times actions per user, divided by 86,400 — round it to one significant figure.',
        'What is the peak-to-average ratio? Two to three times is a normal assumption; say which you are using.',
        'How large is one record, and how many will exist after a year?',
        'Does the working set fit in memory? That single answer decides the caching strategy.',
      ],
      failureMode:
        'False precision, or skipping it entirely. Nobody wants four significant figures; they want to see that you can reason about magnitude and that your design follows from it.',
    },
    {
      id: 'api',
      name: 'API surface',
      minutes: 4,
      output: 'Three to five endpoint signatures with their parameters and return shapes.',
      prompts: [
        'What is the smallest set of operations that satisfies the functional requirements?',
        'What identifies a resource, and who generates that id?',
        'Which calls are synchronous, and which can return immediately and finish later?',
        'How is a list endpoint paginated — offset, or a cursor?',
      ],
      failureMode:
        'Skipping the API and going straight to boxes. The API is where you discover that a requirement is ambiguous, and it costs four minutes.',
    },
    {
      id: 'data',
      name: 'Data model and storage choice',
      minutes: 6,
      output: 'Entities with their key fields, the access patterns they serve, and a named database choice with one sentence of justification.',
      prompts: [
        'What are the read patterns? The primary key should fall out of the most common query, not the other way round.',
        'Does this data need transactions across entities, or is per-entity atomicity enough?',
        'What is the cardinality of the relationships, and where does the fan-out live?',
        'What is the partition key, and does it distribute evenly?',
      ],
      failureMode:
        'Naming a database by reputation rather than by access pattern. "I would use Cassandra" without saying what the partition key is tells the interviewer nothing.',
    },
    {
      id: 'highlevel',
      name: 'High-level design',
      minutes: 8,
      output: 'A diagram of components with the request path traced end to end, for one write and one read.',
      prompts: [
        'Walk one write through every hop, naming what could fail at each.',
        'Walk one read through, and say where it is served from on a cache hit.',
        'Which of these components can be stateless, and which must hold state?',
        'What is asynchronous, and what is the user waiting on?',
      ],
      failureMode:
        'A diagram you never trace. Boxes with arrows are worth nothing until you narrate a single request across them.',
    },
    {
      id: 'deepdive',
      name: 'Deep dives',
      minutes: 12,
      output: 'Two or three components designed properly, each with a named tradeoff and a defended position.',
      prompts: [
        'Where is the hardest part of this system, and what makes it hard?',
        'What happens under a hot key or a celebrity user?',
        'How does this behave when a downstream dependency is down for ten minutes?',
        'What is the consistency guarantee here, and what does a user actually observe when it is violated?',
      ],
      failureMode:
        'Answering "it depends" and stopping. Say what it depends on, pick a side, and state what you gave up. An interviewer can work with a wrong-but-defended answer; they cannot grade a shrug.',
    },
    {
      id: 'wrap',
      name: 'Bottlenecks and wrap-up',
      minutes: 5,
      output: 'The first thing that breaks at ten times the load, how you would detect it, and what you would do about it.',
      prompts: [
        'Which component saturates first, and what metric would show it?',
        'What is the single point of failure that remains?',
        'What would you build first if this were real, and what would you defer?',
        'What did you knowingly leave out, and why was that the right call for this hour?',
      ],
      failureMode:
        'Running out of time and letting the round end mid-sentence. Reserve the last five minutes; a candidate who names their own design\'s weaknesses looks senior, and one who is surprised by them does not.',
    },
  ],
};
