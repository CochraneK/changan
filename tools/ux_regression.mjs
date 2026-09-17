// 玩家级回归：覆盖自动结构审计曾漏掉的真实体验问题。
import fs from 'node:fs';
import { scenes } from '../src/data/scenes.js';
import {
  MBTI_DIMS,
  matchMBTICharacter,
} from '../src/data/mbti.js';
import {
  PUZZLE_PIPELINES,
  computePipelineProgress,
  renderPuzzlePanel,
} from '../src/data/puzzles.js';

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// 1) 人物匹配榜必须真的按契合度降序，禁止“第一名 67%，次席 86%”。
const levels = [10, 30, 50, 70, 90];
let rankCases = 0;
for (const a of levels) for (const b of levels) for (const c of levels) for (const d of levels) {
  const pcts = [a, b, c, d];
  const dims = MBTI_DIMS.map((dim, i) => ({
    key: dim.key,
    left: dim.left,
    right: dim.right,
    leftPct: pcts[i],
    rightPct: 100 - pcts[i],
  }));
  const type = dims.map((x, i) => pcts[i] >= 50 ? MBTI_DIMS[i].left : MBTI_DIMS[i].right).join('');
  const m = matchMBTICharacter(dims, type);
  assert(m.similarity >= m.secondSimilarity,
    `人物匹配排序倒挂：${m.id} ${m.similarity}% < ${m.second} ${m.secondSimilarity}%`);
  rankCases++;
}

// 2) 侦探笔记显示值不得超过门槛，真实命中数仍保留在 matched 里。
for (const p of PUZZLE_PIPELINES) {
  const clues = p.keywords.map(k => `线索：${k}`);
  const item = computePipelineProgress(clues).find(x => x.id === p.id);
  assert(item, `找不到推理管线 ${p.id}`);
  assert(item.displayMatched <= item.threshold,
    `推理显示溢出：${p.name} ${item.displayMatched}/${item.threshold}`);
  const html = renderPuzzlePanel(clues, new Set([p.reward.flag]));
  assert(html.includes(`${Math.min(item.matched, item.threshold)}/${item.threshold}`),
    `推理面板未使用封顶显示：${p.name}`);
}

// 3) 当前展示页之间不能再出现已知陈旧文案。
const readme = fs.readFileSync('README.md', 'utf8');
const results = fs.readFileSync('results.html', 'utf8');
const hub = fs.readFileSync('extensions/hub.html', 'utf8');

const endings = Object.values(scenes).filter(sc => sc.ending).length;
const landingEnding = readme.match(/条件门控分支 · (\d+) 个结局 · 人格画像/);
assert(landingEnding && Number(landingEnding[1]) === endings,
  `README 顶部结局数与 scenes 不一致：README=${landingEnding?.[1]} scenes=${endings}`);
assert(!results.includes('三位归宿'), 'results.html 仍保留“三位归宿”陈旧文案');

const countText = (text, needle) => text.split(needle).length - 1;
assert(countText(hub, '<h3>AI NPC 对话</h3>') === 1, 'Hub 的 AI NPC 对话存在重复状态卡');
assert(countText(hub, '<h3>唐代知识卡 · 教育科普</h3>') === 0, 'Hub 仍把已上线唐代知识卡列为未上线项目');
assert(hub.includes('type="module"') && hub.includes("from '../src/data/scenes.js'"),
  'Hub 统计仍未接入 scenes.js 实时数据');

console.log(`✅ UX 回归通过：人物排名 ${rankCases} 组 · 推理管线 ${PUZZLE_PIPELINES.length} 条 · ${endings} 个结局展示一致`);
