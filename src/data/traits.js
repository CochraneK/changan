// 人格测评体系 —— v2
// 6 个维度，每个抉择会为若干维度加分（0~3）
// 结局时按占比归一化到 0-100，并匹配「最相似的长安人物」

// ===== 维度定义 =====
export const TRAITS = [
  {
    key: 'yi', name: '义气', icon: 'game-icons:hand-of-god',
    desc: '你有多愿意为他人付出代价',
    high: '义薄云天', low: '明哲保身',
    highDesc: '你把别人的命看得比自己重。长安于你，不是一座城，是活生生的人。',
    lowDesc: '你清楚自己的斤两，不轻易为不相干的人押上身家。这不是错，只是活法。',
  },
  {
    key: 'mou', name: '谋略', icon: 'game-icons:chess-king',
    desc: '你解决问题靠脑子还是靠刀',
    high: '运筹帷幄', low: '快意恩仇',
    highDesc: '你习惯先看三步再落子。数据、线索、人心，在你手里都是可以算的账。',
    lowDesc: '你想不了那么多，也不想。该出手时就出手，是你的道理。',
  },
  {
    key: 'ren', name: '仁恕', icon: 'game-icons:dove',
    desc: '面对仇怨，你选择宽恕还是了断',
    high: '仁心侠骨', low: '铁石心肠',
    highDesc: '你恨这件事，但你理解做这件事的人。你愿意给仇人一个解释的机会。',
    lowDesc: '有些事不能算了。你认为宽恕是对受害者的第二次辜负。',
  },
  {
    key: 'dan', name: '胆魄', icon: 'game-icons:saber-slash',
    desc: '风险当前，你是进是退',
    high: '孤勇无畏', low: '步步为营',
    highDesc: '你不怕死，也不怕输。有些事明知道会死，你还是会去做。',
    lowDesc: '你珍惜每一次机会，不愿把筹码压在一次豪赌上。活着才有下文。',
  },
  {
    key: 'xin', name: '信义', icon: 'game-icons:handshake',
    desc: '你信同伴，还是只信自己',
    high: '众志成城', low: '独行其是',
    highDesc: '你愿意把后背交给别人。你知道一个人再强，也扛不起整座长安。',
    lowDesc: '你被辜负过太多次。人多嘴杂，不如一个人来得干净利落。',
  },
  {
    key: 'zhi', name: '执念', icon: 'game-icons:anvil-impact',
    desc: '是守住初衷，还是见机行事',
    high: '执念如刀', low: '通达权变',
    highDesc: '你认准的事，九头牛也拉不回。哪怕撞了南墙，你也要把墙撞个洞。',
    lowDesc: '你懂得转弯。目标没变，但路可以换一条走——活人不能被尿憋死。',
  },
];

export const TRAIT_MAP = Object.fromEntries(TRAITS.map(t => [t.key, t]));

// ===== 抉择权重表 =====
// 键：'场景id' -> 数组，按 scenes.js 里 choices 的顺序一一对应
// 值：{ 维度key: 分值 }，分值 0~3
// ⚠️ 改动 scenes.js 的选项顺序时，必须同步改这里；tools/verify.mjs 会强制校验覆盖完整
export const CHOICE_TRAITS = {
  // 序 · 死牢
  start: [
    { xin: 2, dan: 1 },          // 带路，跟他走
    { mou: 2, xin: 1 },          // 先摸清对方的底
  ],
  s1_meet: [
    { yi: 3, xin: 2 },           // 说吧，要我做什么
    { yi: 1, mou: 2 },           // 我要自由身，谈条件
    { mou: 2, xin: 1 },          // 我为什么要信你
  ],
  s1_task: [
    { dan: 2, xin: 1 },          // 给我人权，横着走
    { xin: 0, dan: 3, yi: 1 },   // 我一个人就够了（孤行+胆魄）
    { xin: 2, zhi: 2 },          // 先放我回坊里见人（执念：要见闻染）
  ],
  // 丑时 · 大案牍术
  h_chou: [
    { mou: 3, xin: 1 },          // 那就先算
    { dan: 2, xin: 2 },          // 算不完，跟我上街
    { mou: 2, xin: 2, dan: 1 },  // 两条路都走
  ],
  // 寅时 · 宵禁
  h_yin: [
    { dan: 2, mou: 1 },          // 跟上去，别惊动
    { xin: 3, mou: 1 },          // 崔器回去调人
    { mou: 2, zhi: 2 },          // 记下巷子，回头封
  ],
  // 卯时 · 西市
  h_mao: [
    { dan: 3, mou: 1 },          // 直接追上去抓住
    { mou: 2, dan: 1 },          // 远远吊着
    { xin: 2, mou: 2 },          // 先找老熟人打听
  ],
  h_mao_chase: [
    { mou: 3 },                  // 搜身找线索
    { xin: 2, mou: 1 },          // 回报靖安司
  ],
  h_mao_tail: [
    { dan: 3, yi: 1 },           // 摸进去毁油罐
    { xin: 3, mou: 2 },          // 记住位置搬援兵
    { mou: 3, dan: 1 },          // 守株待兔
  ],
  h_mao_ask: [
    { zhi: 2, mou: 2 },          // 重谢，赶往修政坊
    { xin: 2, mou: 2 },          // 让他继续盯着
  ],
  // 辰时 · 线索汇聚
  h_chen: [
    { mou: 3 },                  // 查户籍
    { dan: 2, zhi: 1 },          // 直接去修政坊
    { xin: 2, zhi: 2 },          // 我要见闻染
  ],
  // 巳时 · 闻染
  h_si: [
    { mou: 2, ren: 1 },          // 接过文书当场翻
    { ren: 3, yi: 2, xin: 1 },   // 对不起，我给你交代（许诺）
    { dan: 2, ren: 0 },          // 现在不是说这个的时候（冷）
  ],
  h_si_doc: [
    { mou: 2, xin: 1 },          // 绕过去，不打草惊蛇
    { dan: 2, ren: 1 },          // 绕过来，现在就去问
    { xin: 3, mou: 1 },          // 带回靖安司让李必定夺
  ],
  // 午时 · 崔器
  h_wu: [
    { xin: 3, ren: 2 },          // 我信你，跟我干
    { ren: 0, dan: 2 },          // 你签字时没想过查？（逼问）
    { xin: 2, ren: 2, yi: 1 },   // 都说了，我保你
  ],
  // 未时 · 靖安司之围
  h_wei: [
    { dan: 3, yi: 1 },           // 护着司丞杀出去
    { yi: 3, dan: 3 },           // 我去引开，司丞先走（舍己）
    { mou: 3, dan: 1 },          // 不急，先看谁下的令
  ],
  // 申时 · 真相一层
  h_shen: [
    { mou: 3, zhi: 2 },          // 查朝堂
    { dan: 2, zhi: 1 },          // 先不管朝堂，保灯会
    { mou: 2, xin: 2 },          // 两面都抓，我要人手
  ],
  // 酉时 · 鱼肠
  h_you: [
    { dan: 2, mou: 1 },          // 少卖关子，龙波在哪
    { mou: 2, ren: 2, xin: 2 },  // 坐下喝茶听她说（耐心+共情）
    { dan: 3, ren: 0 },          // 直接动手
  ],
  // 戌时 · 龙波
  h_xu: [
    { dan: 3, ren: 1 },          // 放下火折子（动手）
    { mou: 2, ren: 2 },          // 你恨的到底是什么（倾听）
    { ren: 3, yi: 2 },           // 长安不欠你，但仇我记下了（共情）
  ],
  // 亥时 · 抉择
  h_hai: [
    { dan: 3, zhi: 3, yi: 2 },   // 我愿意，拔刀一战
    { yi: 3, xin: 3, ren: 1 },   // 我不为长安死，我为这些人活
    { ren: 3, mou: 2, yi: 2 },   // 收手吧，我替你报仇
  ],
};

// ===== 角色人格向量（0-10），用于「最相似的长安人物」匹配 =====
export const CHARACTER_TRAITS = {
  zhangxiaojing: { yi: 9, mou: 6, ren: 5, dan: 9, xin: 4, zhi: 9 },
  libi:          { yi: 8, mou: 9, ren: 6, dan: 5, xin: 6, zhi: 10 },
  cuiqi:         { yi: 6, mou: 4, ren: 4, dan: 8, xin: 5, zhi: 7 },
  tanqi:         { yi: 7, mou: 7, ren: 8, dan: 4, xin: 8, zhi: 6 },
  wenran:        { yi: 6, mou: 8, ren: 7, dan: 5, xin: 5, zhi: 8 },
  xuhezi:        { yi: 4, mou: 10, ren: 3, dan: 2, xin: 4, zhi: 9 },
  longbo:        { yi: 3, mou: 9, ren: 2, dan: 7, xin: 2, zhi: 10 },
  yuzhen:        { yi: 4, mou: 9, ren: 3, dan: 6, xin: 3, zhi: 8 },
  yaoruneng:     { yi: 4, mou: 7, ren: 5, dan: 3, xin: 3, zhi: 4 },
  yuanzai:       { yi: 1, mou: 8, ren: 1, dan: 3, xin: 2, zhi: 3 },
  linjiulang:    { yi: 2, mou: 10, ren: 1, dan: 4, xin: 2, zhi: 8 },
  heyizheng:     { yi: 6, mou: 8, ren: 7, dan: 3, xin: 6, zhi: 7 },
  baixing:       { yi: 5, mou: 3, ren: 6, dan: 2, xin: 7, zhi: 5 },
  dingtonger:    { yi: 6, mou: 5, ren: 8, dan: 4, xin: 7, zhi: 7 },
  wangyunxiu:    { yi: 8, mou: 6, ren: 7, dan: 7, xin: 8, zhi: 8 },
  gela:          { yi: 4, mou: 7, ren: 5, dan: 6, xin: 6, zhi: 4 },
};

// ===== 称号生成：取最高的两个维度 =====
export function makeTitle(scores) {
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter(([, v]) => v > 0);
  if (!sorted.length) return '无名过客';
  const parts = sorted.slice(0, 2).map(([k]) => TRAIT_MAP[k].high);
  return parts.join(' · ');
}

// ===== 归一化：绝对达成率 0-100 =====
// 含义：在"本可以表现该特质"的场合里，你实际有多大比例选择了它
// 例：义气 80 = 10 个能讲义气的路口，你走了 8 次义气
// 这样跨局可比，也不会因某一维度权重密集而恒定满分
export function normalize(raw, maxPossible) {
  const out = {};
  for (const k in raw) {
    const cap = maxPossible ? (maxPossible[k] || 0) : 0;
    out[k] = cap > 0
      ? Math.max(0, Math.min(100, Math.round((raw[k] / cap) * 100)))
      : 0;
  }
  return out;
}

// 计算某个场景节点各维度的"可获得上限"（该节点所有选项里该维度的最高分）
export function nodeMax(sceneId) {
  const list = CHOICE_TRAITS[sceneId] || [];
  const m = {};
  TRAITS.forEach(t => { m[t.key] = 0; });
  list.forEach(w => {
    if (!w) return;
    for (const k in w) {
      if (k in m) m[k] = Math.max(m[k], w[k]);
    }
  });
  return m;
}

// ===== 匹配最相似角色 =====
// 做法：对玩家画像和角色向量各自做 z-score 标准化，再比欧氏距离
// 这样比较的是"特质的高低形态"（哪几项突出、哪几项低），而不是绝对水平，
// 避免总是匹配到最平庸的角色
function zscore(vec, dims) {
  const vals = dims.map(k => vec[k] || 0);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const sd = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length);
  const out = {};
  dims.forEach((k, i) => { out[k] = sd > 1e-6 ? (vals[i] - mean) / sd : 0; });
  return out;
}

export function matchCharacter(scores) {
  const dims = TRAITS.map(t => t.key);
  const pz = zscore(scores, dims);
  let best = null, bestDist = Infinity, second = null, secondDist = Infinity;
  for (const id in CHARACTER_TRAITS) {
    const cz = zscore(CHARACTER_TRAITS[id], dims);
    let d = 0;
    for (const k of dims) d += (pz[k] - cz[k]) ** 2;
    d = Math.sqrt(d);
    if (d < bestDist) {
      second = best; secondDist = bestDist;
      bestDist = d; best = id;
    } else if (d < secondDist) {
      secondDist = d; second = id;
    }
  }
  return { id: best, distance: bestDist, second, secondDistance: secondDist };
}
