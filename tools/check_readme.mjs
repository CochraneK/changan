// README 当前态校验：从 scenes.js 推导真实项目元数据，避免文档中的数字随版本腐化。
import fs from 'node:fs';
import { scenes, isPassage } from '../src/data/scenes.js';

const md = fs.readFileSync('README.md', 'utf8').replace(/\r\n/g, '\n');
const list = Object.values(scenes);
const meta = {
  nodes: list.length,
  passages: list.filter(sc => isPassage(sc)).length,
  choicePoints: list.filter(sc => !sc.ending && !isPassage(sc) && Array.isArray(sc.choices) && sc.choices.length).length,
  choices: list.reduce((n, sc) => n + (sc.choices?.length || 0), 0),
  endings: list.filter(sc => sc.ending).length,
};

const checks = [];
function check(label, ok, detail = '') {
  checks.push({ label, ok, detail });
}

const landing = md.match(/条件门控分支 · (\d+) 个结局 · 人格画像/);
check(
  'README 顶部结局数',
  !!landing && Number(landing[1]) === meta.endings,
  `README=${landing?.[1] ?? 'missing'} / scenes=${meta.endings}`
);

const gameplay = md.match(/共 (\d+) 个剧情节点 \/ (\d+) 个抉择/);
check(
  'README 玩法抉择统计',
  !!gameplay && Number(gameplay[1]) === meta.choicePoints && Number(gameplay[2]) === meta.choices,
  `README=${gameplay ? gameplay[1] + '/' + gameplay[2] : 'missing'} / scenes=${meta.choicePoints}/${meta.choices}`
);

const endingTags = list.filter(sc => sc.ending).map(sc => sc.endTag).filter(Boolean);
for (const tag of endingTags) {
  const name = String(tag).replace(/^结局\s*·\s*/, '').trim();
  check(`结局表包含「${name}」`, md.includes(`**${name}**`));
}

check('README 不保留易腐化的固定结局百分比', !md.includes('49.7% / 未竟之局 24.1%'));
check('README verify 段声明实时统计', md.includes('数量以当前 verify 输出为准'));

let bad = 0;
for (const c of checks) {
  console.log((c.ok ? '  ✅ ' : '  ❌ ') + c.label + (c.detail ? ` — ${c.detail}` : ''));
  if (!c.ok) bad++;
}
console.log(`\nREADME 当前态核对：${checks.length - bad}/${checks.length} 通过`);
console.log(`实时元数据：${meta.nodes} 节点 / ${meta.passages} 过场 / ${meta.choicePoints} 抉择点 / ${meta.choices} 选项 / ${meta.endings} 结局`);
if (bad) process.exit(1);
