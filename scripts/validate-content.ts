/**
 * Content gate. Fails the build if the 1 + 2 rule is broken, a language is
 * missing, or a problem has no insight. Run before every commit that touches
 * src/content.
 */
import { TOPICS, ALL_QUESTION_TYPES, ALL_PROBLEMS, CONTENT_ISSUES } from '../src/content/dsa/index';
import { ATLAS, TOTAL_TYPES } from '../src/content/dsa/atlas';
import { SD_COUNTS, SD_ISSUES, SD_MODULES, SD_TOTAL_HOURS } from '../src/content/system-design/index';

const authored = TOPICS.length;
const planned = ATLAS.length;
const taught = ALL_PROBLEMS.filter((p) => p.role === 'taught').length;
const practice = ALL_PROBLEMS.filter((p) => p.role === 'practice').length;
const prove = ALL_PROBLEMS.filter((p) => p.role === 'prove').length;
const mockSets = TOPICS.flatMap((t) => t.mockSets ?? []);
const mockProblems = mockSets.flatMap((s) => s.problems);
const mockMinutes = mockSets.reduce((n, s) => n + s.minutes, 0);

// A mock problem the ladder already taught measures recall, not readiness.
const laddered = new Set(ALL_PROBLEMS.map((p) => p.lc));
const leaked = mockProblems.filter((p) => laddered.has(p.lc));

console.log('Forge content check');
console.log('-------------------');
console.log(`topics authored   ${authored} / ${planned}`);
console.log(`question types    ${ALL_QUESTION_TYPES.length} authored, ${TOTAL_TYPES} planned across the atlas`);
console.log(`problems          ${taught} taught, ${practice} practice, ${prove} prove`);
console.log(`1 + 2 ratio       ${practice === taught * 2 ? 'holds' : 'BROKEN'}`);
console.log(`mock sets         ${mockSets.length} sets, ${mockProblems.length} problems, ${mockMinutes} minutes of sitting`);
console.log(`mock isolation    ${leaked.length === 0 ? 'holds — no mock problem appears in the ladder' : 'BROKEN'}`);

for (const topic of TOPICS) {
  const types = topic.questionTypes.length;
  const probs = topic.questionTypes.reduce(
    (n, qt) => n + 1 + qt.practice.length + (qt.prove ? 1 : 0),
    0,
  );
  const sets = topic.mockSets?.length ?? 0;
  const suffix = sets > 0 ? `, ${sets} mock sets` : '';
  console.log(`  ${topic.id.padEnd(16)} ${types} types, ${probs} problems, ${topic.estHours} h${suffix}`);
}

console.log('');
console.log('System Design track');
console.log('-------------------');
console.log(`modules           ${SD_MODULES.length} (${SD_COUNTS.framework} framework, ${SD_COUNTS.concepts} concepts, ${SD_COUNTS.cases} cases)`);
console.log(`hours             ${SD_TOTAL_HOURS}`);
console.log(`tradeoffs         ${SD_COUNTS.tradeoffs} defended decisions`);
console.log(`figures           ${SD_COUNTS.figures} numbers worth memorising`);

if (SD_ISSUES.length > 0) {
  console.error(`
${SD_ISSUES.length} system design issue(s):`);
  for (const issue of SD_ISSUES) console.error(`  [${issue.moduleId}] ${issue.message}`);
  process.exit(1);
}

if (leaked.length > 0) {
  console.error(`
${leaked.length} mock problem(s) already appear in the learning ladder:`);
  for (const p of leaked) console.error(`  ${p.lc}. ${p.title}`);
  process.exit(1);
}

if (CONTENT_ISSUES.length > 0) {
  console.error(`\n${CONTENT_ISSUES.length} content issue(s):`);
  for (const issue of CONTENT_ISSUES) {
    console.error(`  [${issue.topicId}${issue.typeId ? '/' + issue.typeId : ''}] ${issue.message}`);
  }
  process.exit(1);
}

console.log('\nAll content valid.');
