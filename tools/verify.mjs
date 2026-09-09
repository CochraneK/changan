// 剧情树连通性校验
import { scenes, START_SCENE } from '../src/data/scenes.js';
import { characters, hours } from '../src/data/characters.js';
import { TRAITS, CHOICE_TRAITS, CHARACTER_TRAITS } from '../src/data/traits.js';
import { MBTI_DIMS, MBTI_TYPES, MBTI_CHOICE, CHARACTER_MBTI } from '../src/data/mbti.js';

let errors = [];
let warnings = [];

const ids = Object.keys(scenes);
const hourKeys = new Set(hours.map(h => h.key));
const charIds = new Set(Object.keys(characters));

// 1. 每个节点的 to 目标必须存在
for (const id of ids) {
  const sc = scenes[id];
  if (sc.ending) {
    if (!sc.endTag) errors.push(`[${id}] 结局节点缺少 endTag`);
    continue;
  }
  if (!sc.choices || !sc.choices.length) {
    errors.push(`[${id}] 非结局节点却没有 choices（会卡死）`);
    continue;
  }
  sc.choices.forEach((ch, i) => {
    if (!ch.t) errors.push(`[${id}] 第${i + 1}个选项缺少文本 t`);
    if (!ch.to) errors.push(`[${id}] 第${i + 1}个选项缺少 to`);
    else if (!scenes[ch.to]) errors.push(`[${id}] 选项 ${i + 1} 指向不存在的节点: ${ch.to}`);
    if (ch.trust) {
      for (const cid in ch.trust) {
        if (!charIds.has(cid)) errors.push(`[${id}] 选项 ${i + 1} trust 引用未知角色: ${cid}`);
      }
    }
  });
}

// 2. hour 必须合法
for (const id of ids) {
  const sc = scenes[id];
  if (!sc.hour) warnings.push(`[${id}] 未指定 hour`);
  else if (!hourKeys.has(sc.hour)) errors.push(`[${id}] 非法 hour: ${sc.hour}`);
  if (!sc.text) errors.push(`[${id}] 缺少 text`);
  if (sc.pov && !charIds.has(sc.pov)) errors.push(`[${id}] pov 未知角色: ${sc.pov}`);
  if (sc.pov && !characters[sc.pov].isPOV) {
    warnings.push(`[${id}] pov=${sc.pov} 未标 isPOV`);
  }
}

// 3. 从 start 出发 BFS，检查可达性与死链
const visited = new Set();
const queue = [START_SCENE];
const endings = new Set();
while (queue.length) {
  const cur = queue.shift();
  if (visited.has(cur)) continue;
  visited.add(cur);
  const sc = scenes[cur];
  if (!sc) continue;
  if (sc.ending) { endings.add(cur); continue; }
  (sc.choices || []).forEach(ch => {
    if (ch.to && !visited.has(ch.to)) queue.push(ch.to);
  });
}

// 4. 不可达节点
const unreachable = ids.filter(id => !visited.has(id));
if (unreachable.length) warnings.push(`不可达节点: ${unreachable.join(', ')}`);

// 5. 人格权重覆盖校验
const traitKeys = new Set(TRAITS.map(t => t.key));
let traitCovered = 0, traitTotal = 0;
for (const id of ids) {
  const sc = scenes[id];
  if (!sc.choices) continue;
  const map = CHOICE_TRAITS[id];
  sc.choices.forEach((ch, i) => {
    traitTotal++;
    const w = map ? map[i] : null;
    if (!w) {
      // 结局前的最后一个节点也必须有
      errors.push(`[${id}] 第${i + 1}个选项缺少人格权重（traits.js）`);
      return;
    }
    traitCovered++;
    for (const k in w) {
      if (!traitKeys.has(k)) errors.push(`[${id}] 第${i + 1}选项引用未知维度: ${k}`);
      if (typeof w[k] !== 'number' || w[k] < 0 || w[k] > 3) {
        warnings.push(`[${id}] 第${i + 1}选项 ${k} 分值异常: ${w[k]}（建议 0-3）`);
      }
    }
  });
}

// 6b. MBTI 权重覆盖校验
const mbtiKeys = new Set(MBTI_DIMS.map(d => d.key));
let mbtiCovered = 0, mbtiTotal = 0;
for (const id of ids) {
  const sc = scenes[id];
  if (!sc.choices) continue;
  const map = MBTI_CHOICE[id];
  sc.choices.forEach((ch, i) => {
    mbtiTotal++;
    const w = map ? map[i] : null;
    if (!w) {
      errors.push(`[${id}] 第${i + 1}个选项缺少 MBTI 权重（mbti.js）`);
      return;
    }
    mbtiCovered++;
    if (Object.keys(w).length === 0) {
      warnings.push(`[${id}] 第${i + 1}选项 MBTI 权重为空 {}（该选项不产生区分）`);
    }
    for (const k in w) {
      if (!mbtiKeys.has(k)) errors.push(`[${id}] 第${i + 1}选项引用未知 MBTI 维度: ${k}`);
      if (typeof w[k] !== 'number' || Math.abs(w[k]) > 3) {
        warnings.push(`[${id}] 第${i + 1}选项 ${k} 超出区间(-3~3): ${w[k]}`);
      }
    }
  });
}

// 6c. 16 型定义完整性
const mbtiLetters = MBTI_DIMS.map(d => d.left);
const expectTypes = [];
function combos(i, prefix) {
  if (i === MBTI_DIMS.length) { expectTypes.push(prefix.join('')); return; }
  combos(i + 1, [...prefix, MBTI_DIMS[i].left]);
  combos(i + 1, [...prefix, MBTI_DIMS[i].right]);
}
combos(0, []);
const missingTypes = expectTypes.filter(t => !(t in MBTI_TYPES));
if (missingTypes.length) errors.push(`MBTI_TYPES 缺少 ${missingTypes.length} 型: ${missingTypes.join(', ')}`);
for (const t in MBTI_TYPES) {
  if (!charIds.has(MBTI_TYPES[t].who)) {
    errors.push(`MBTI_TYPES[${t}].who 未知角色: ${MBTI_TYPES[t].who}`);
  }
}

// 6d. 角色 MBTI 向量校验
for (const id in CHARACTER_MBTI) {
  if (!charIds.has(id)) errors.push(`CHARACTER_MBTI 引用未知角色: ${id}`);
  for (const k in CHARACTER_MBTI[id]) {
    if (!mbtiKeys.has(k)) errors.push(`CHARACTER_MBTI[${id}] 未知维度: ${k}`);
  }
}
const missingMbti = [...charIds].filter(id => !(id in CHARACTER_MBTI));
if (missingMbti.length) errors.push(`缺 MBTI 向量的角色: ${missingMbti.join(', ')}`);

// 6. 角色人格向量校验
for (const id in CHARACTER_TRAITS) {
  if (!charIds.has(id)) errors.push(`CHARACTER_TRAITS 引用未知角色: ${id}`);
  for (const k in CHARACTER_TRAITS[id]) {
    if (!traitKeys.has(k)) errors.push(`CHARACTER_TRAITS[${id}] 未知维度: ${k}`);
  }
}
const missingVec = [...charIds].filter(id => !(id in CHARACTER_TRAITS));

// 输出
console.log(`节点总数: ${ids.length}`);
console.log(`可达节点: ${visited.size}`);
console.log(`结局数:   ${endings.size} -> ${[...endings].join(', ')}`);
console.log(`覆盖时辰: ${new Set(ids.map(i => scenes[i].hour).filter(Boolean)).size} / 12`);
console.log(`选项总数: ${ids.reduce((n, i) => n + (scenes[i].choices?.length || 0), 0)}`);
console.log(`人格权重覆盖: ${traitCovered} / ${traitTotal}`);
console.log(`MBTI 权重覆盖: ${mbtiCovered} / ${mbtiTotal}`);
console.log(`MBTI 16 型定义: ${Object.keys(MBTI_TYPES).length} / ${expectTypes.length}`);
console.log(`角色人格向量: ${Object.keys(CHARACTER_TRAITS).length} / ${charIds.size}`);
console.log(`角色 MBTI 向量: ${Object.keys(CHARACTER_MBTI).length} / ${charIds.size}`);
if (missingVec.length) warnings.push(`缺人格向量的角色: ${missingVec.join(', ')}`);
console.log('');
if (errors.length) {
  console.log('❌ 错误:');
  errors.forEach(e => console.log('   ' + e));
} else {
  console.log('✅ 无致命错误');
}
if (warnings.length) {
  console.log('⚠️  警告:');
  warnings.forEach(w => console.log('   ' + w));
}
console.log('\n--- 结局清单 ---');
[...endings].forEach(e => {
  const sc = scenes[e];
  console.log(`  ${sc.endTag}  (${e})`);
});
