// 玩家级回归：覆盖自动结构审计曾漏掉的真实体验问题。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
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

// 4) Extension pages must share canonical data instead of hand-maintained copies.
const cards = fs.readFileSync('extensions/character-cards.html', 'utf8');
const pathPage = fs.readFileSync('extensions/path-visualizer.html', 'utf8');
const stats = fs.readFileSync('extensions/stats-dashboard.html', 'utf8');

assert(cards.includes('Object.entries(MBTI_TYPES)') && !cards.includes("zhangxiaojing: 'ESTP'"),
  '人物卡仍维护独立 MBTI 映射表');
assert(!pathPage.includes('value="e_hero"') && pathPage.includes('filter(([, sc]) => sc.ending)'),
  '路径页仍使用陈旧的硬编码结局 ID');
assert(pathPage.includes('const totalNodes = Object.keys(scenes).length'),
  '路径页“总节点”仍未统计全部 scenes');
assert(!stats.includes('30/63') && !stats.includes('当前 63 选项') && !stats.includes('当前 52%'),
  '数据仪表盘仍残留旧版 63 选项统计');
assert(stats.includes('choiceShapeStats()') && stats.includes('computeMBTI(mbtiVal, mbtiStats)'),
  '数据仪表盘仍未从当前权重/机会基线计算');

// Parse every inline module script so a broken dashboard/path page cannot ship silently.
for (const file of [
  'extensions/character-cards.html',
  'extensions/path-visualizer.html',
  'extensions/stats-dashboard.html',
  'extensions/hub.html',
]) {
  const html = fs.readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(/<script\s+type="module"[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  assert(scripts.length > 0, `${file} 没有可检查的 module script`);
  scripts.forEach((code, i) => {
    const tmp = path.join(os.tmpdir(), `changan-ux-${process.pid}-${i}.mjs`);
    fs.writeFileSync(tmp, code);
    const parsed = spawnSync(process.execPath, ['--check', tmp], { encoding: 'utf8' });
    fs.rmSync(tmp, { force: true });
    assert(parsed.status === 0, `${file} module script 语法错误：${parsed.stderr}`);
  });
}

console.log(`✅ UX 回归通过：人物排名 ${rankCases} 组 · 推理管线 ${PUZZLE_PIPELINES.length} 条 · ${endings} 个结局展示一致`);
