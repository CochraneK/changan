// MBTI 人格测评体系 —— v3
// 4 个维度，每个抉择在 4 个维度上各有倾向分（-3 ~ +3，0 为中性）
//   正值偏向左侧字母（E / S / T / J）
//   负值偏向右侧字母（I / N / F / P）
// 结局时算出每个维度的偏好强度与最终 4 字母类型

// ===== 4 个维度 =====
export const MBTI_DIMS = [
  {
    key: 'EI', left: 'E', right: 'I',
    leftName: '外向', rightName: '内向',
    iconL: 'game-icons:crowd', iconR: 'game-icons:hooded-figure',
    question: '你的精力从哪来',
    leftDesc: '你从行动、人群、碰撞中获得力量。破局靠调动人手，也靠当机立断。',
    rightDesc: '你从独处、思考、内省中获得力量。一个人时，你反而看得最清楚。',
  },
  {
    key: 'SN', left: 'S', right: 'N',
    leftName: '实感', rightName: '直觉',
    iconL: 'game-icons:magnifying-glass', iconR: 'game-icons:crystal-ball',
    question: '你如何获取信息',
    leftDesc: '你信眼睛看到的：脚印、卷宗、户籍、物证。真相藏在一笔笔具体的账里。',
    rightDesc: '你信脑子里推的：动机、人心、局面。真相藏在那些没被说出口的东西里。',
  },
  {
    key: 'TF', left: 'T', right: 'F',
    leftName: '思考', rightName: '情感',
    iconL: 'game-icons:scales', iconR: 'game-icons:two-hearts',
    question: '你如何做决定',
    leftDesc: '你按原则和结果下判断。必要的时候，你可以很冷。有些代价，必须有人付。',
    rightDesc: '你按人情和 value 下判断。你做不到看着一个人去死，哪怕"道理"上该如此。',
  },
  {
    key: 'JP', left: 'J', right: 'P',
    leftName: '判断', rightName: '知觉',
    iconL: 'game-icons:anvil', iconR: 'game-icons:wind-slap',
    question: '你如何安排行动',
    leftDesc: '你要计划、要闭环、要一个交代。认准的路，撞了南墙也要把墙撞穿。',
    rightDesc: '你留余地、看情况、随机应变。路走不通就换一条，活人不能被规矩困死。',
  },
];

export const MBTI_DIM_MAP = Object.fromEntries(MBTI_DIMS.map(d => [d.key, d]));

// ===== 16 型定义：中文名 + 长安化称号 + 描述 + 对应长安人物 =====
export const MBTI_TYPES = {
  INTJ: {
    name: '建筑师', title: '执棋者',
    desc: '你习惯在别人还在慌乱时，就已经推演完了三步。孤独、清醒、不近人情——但长安需要这样的人。',
    who: 'libi',
  },
  INTP: {
    name: '逻辑学家', title: '案牍中的推演者',
    desc: '你相信这天下没有算不出来的事。别人看到的是人，你看到的是数据、模型和概率。',
    who: 'xuhezi',
  },
  ENTJ: {
    name: '指挥官', title: '权柄执掌者',
    desc: '你天生要掌控局面。效率、结果、胜负——你不在乎过程好不好看，只在乎赢没赢。',
    who: 'linjiulang',
  },
  ENTP: {
    name: '辩论家', title: '冷眼旁观者',
    desc: '你享受拆解和质疑。你不太急着站队，因为你想先看清楚——谁才是那个赢家。',
    who: 'yaoruneng',
  },
  INFJ: {
    name: '提倡者', title: '心怀天下者',
    desc: '你心里有一幅理想的长安图景，并愿意为此耗尽一生。你温和，但极难被说服。',
    who: 'heyizheng',
  },
  INFP: {
    name: '调停者', title: '守灯人',
    desc: '你柔软，却有不肯弯的骨头。你不求改变天下，只想护住心里那一点点不肯妥协的东西。',
    who: 'dingtonger',
  },
  ENFJ: {
    name: '主人公', title: '聚火者',
    desc: '你能看见别人身上的光，并让他们也相信。人们愿意跟着你，不是因为你强，是因为你敢站在人前。',
    who: 'wangyunxiu',
  },
  ENFP: {
    name: '竞选者', title: '暗处的刃',
    desc: '你活得热烈，也活得难测。别人猜不透你，因为你连自己都不打算解释。',
    who: 'yuzhen',
  },
  ISTJ: {
    name: '物流师', title: '守序的军人',
    desc: '你信职责、信规矩、信一纸调令。别人谈大义，你只管把手上的事做到底。',
    who: 'cuiqi',
  },
  ISFJ: {
    name: '守卫者', title: '默默护持者',
    desc: '你几乎不说自己的苦。你只是在别人需要的时候，恰好就在那里。',
    who: 'tanqi',
  },
  ESTJ: {
    name: '总经理', title: '实务钻营者',
    desc: '你要的是秩序、效率和可预期的结果。你务实到近乎冷酷，但也因此很少犯错。',
    who: 'yuanzai',
  },
  ESFJ: {
    name: '执政官', title: '邻里长者',
    desc: '你在意身边每个人的感受，也愿意为这份和气操心到底。坊里的事，就是你的事。',
    who: 'baixing',
  },
  ISTP: {
    name: '鉴赏家', title: '刀锋上的实干者',
    desc: '你话不多，手很稳。道理讲不清楚的事，你用刀解决——你不爱争，但你从不退。',
    who: 'zhangxiaojing',
  },
  ISFP: {
    name: '探险家', title: '随性而行者',
    desc: '你不愛被安排。你跟着感觉走，爱你所爱，恨你所恨，活得坦荡。',
    who: 'wenran',
  },
  ESTP: {
    name: '企业家', title: '孤注一掷者',
    desc: '你在风险里反而最清醒。别人还在算，你已经冲出去了——赢了通吃，输了认命。',
    who: 'longbo',
  },
  ESFP: {
    name: '表演者', title: '坊间活字典',
    desc: '你活在当下，也活在人群里。规矩对你来说是拿来用的，不是拿来守的——没人比你更懂人心。',
    who: 'gela',
  },
};

// ===== 抉择权重表 =====
// 键：'场景id' -> 数组，按 scenes.js 里 choices 的顺序一一对应
// 值：{ EI: n, SN: n, TF: n, JP: n }，n 为 -3 ~ +3
//   正 → E/S/T/J    负 → I/N/F/P
// ⚠️ 改动 scenes.js 选项顺序必须同步改这里；tools/verify.mjs 会强制校验
export const MBTI_CHOICE = {
  // 序 · 死牢
  start: [
    { EI: +2, JP: -1 },                // 带路，跟他走（顺势行动）
    { EI: -2, TF: +1, JP: -1 },        // 我凭什么听你的（质疑/独断/观望）
  ],
  s1_meet: [
    { EI: +2, JP: +1 },                // 说吧，要我做什么
    { EI: +1, TF: +2 },                // 我要自由身，谈条件
    { EI: -2, TF: +1, SN: -1 },        // 我为什么要信你（心存疑虑、独自判断）
  ],
  s1_task: [
    { EI: +3, JP: +1 },                // 给我人给我权（要人、外向）
    { EI: -3, JP: +2 },                // 我一个人就够了（孤行）
    { EI: -1, TF: -2 },                // 先放我回坊里见一个人
  ],
  // 丑时 · 大案牍术
  h_chou: [
    { SN: +3, TF: +2, JP: +1 },        // 那就先算
    { EI: +2, SN: -2 },                // 算不完，跟我上街
    { SN: -1, JP: +2 },                // 两条路都走
  ],
  // 寅时 · 宵禁
  h_yin: [
    { EI: -2, JP: -1 },                // 跟上去，别惊动（独自尾随）
    { EI: +2 },                        // 崔器回去调人（协作）
    { SN: +2, JP: +2 },                // 记下巷子，回头封
  ],
  // 卯时 · 西市
  h_mao: [
    { EI: +1, JP: -2 },                // 直接追上去抓住
    { EI: -3, JP: -1 },                // 远远吊着（独自潜伏）
    { EI: +2, SN: +1 },                // 先找老熟人打听（人脉）
  ],
  h_mao_chase: [
    { SN: +3, TF: +1 },                // 搜身找更多线索
    { EI: +2, JP: +2 },                // 立刻回报靖安司
  ],
  h_mao_tail: [
    { EI: +1, JP: -2 },                // 摸进去毁油罐
    { EI: +2, JP: +2 },                // 记住位置搬援兵（协作）
    { EI: -3, JP: +1 },                // 守在这里等人（独自蹲守）
  ],
  h_mao_ask: [
    { EI: +1, JP: +2 },                // 重谢，赶往修政坊
    { EI: +2, JP: +1 },                // 让他继续盯着
  ],
  // 辰时 · 线索汇聚
  h_chen: [
    { SN: +3, TF: +2, JP: +2 },        // 查户籍，筛一遍
    { EI: +1, JP: -2 },                // 来不及了，直接去
    { EI: -1, TF: -2 },                // 我要见闻染
  ],
  // 巳时 · 闻染
  h_si: [
    { SN: +2, TF: +1 },                // 接过文书当场翻
    { TF: -3 },                        // 对不起，我给你交代
    { TF: +3, JP: +1 },                // 现在不是说这个的时候
  ],
  h_si_doc: [
    { SN: -2, JP: +1 },                // 绕过去，不打草惊蛇
    { EI: +1, TF: +2 },                // 绕过来，现在就去问
    { EI: +2, JP: +2 },                // 带回靖安司让李必定夺
  ],
  // 午时 · 崔器
  h_wu: [
    { EI: +2, TF: -3 },                // 我信你，跟我干
    { TF: +3 },                        // 你签字时没想过查？
    { EI: +2, TF: -2 },                // 都说了，我保你
  ],
  // 未时 · 靖安司之围
  h_wei: [
    { EI: +2, JP: +1 },                // 护着司丞杀出去
    { TF: -3, JP: +1 },                // 我去引开，司丞先走
    { EI: -2, SN: -2, TF: +2 },        // 不急，先看谁下的令（冷静旁观）
  ],
  // 申时 · 真相一层
  h_shen: [
    { SN: -3, JP: +2 },                // 查朝堂
    { SN: +2, JP: +1 },                // 先不管朝堂，保灯会
    { EI: +2, SN: -1 },                // 两面都抓，我要人手
  ],
  // 酉时 · 鱼肠
  h_you: [
    { TF: +2, JP: +1 },                // 少卖关子，龙波在哪
    { TF: -2, SN: -1, JP: -2 },        // 坐下喝茶听她说
    { EI: +1, TF: +2, JP: -2 },        // 直接动手
  ],
  // 戌时 · 龙波
  h_xu: [
    { TF: +1, JP: +2 },                // 放下火折子，动手
    { TF: -2, SN: -2, JP: -1 },        // 你恨的到底是什么
    { TF: -3, SN: -1 },                // 长安不欠你，仇我记下了
  ],
  // 亥时 · 最终抉择
  h_hai: [
    { TF: -2, JP: +3 },                // 我愿意，拔刀一战
    { EI: +2, TF: -3 },                // 我不为长安死，我为这些人活
    { TF: -2, SN: -2, JP: -2 },        // 收手吧，我替你报仇
  ],
};

// ===== 角色 MBTI 向量（用于动态匹配"最相似的书中人物"）=====
// 取值为 -3 ~ +3：正 → E/S/T/J，负 → I/N/F/P
export const CHARACTER_MBTI = {
  // 刀锋上的实干者：独行、重现场、冷决、临场变通
  zhangxiaojing: { EI: -2, SN: +2, TF: +2, JP: -2 },
  // 执棋者：深谋、看大局、理性近乎冷、计划到底
  libi:          { EI: -2, SN: -2, TF: +3, JP: +3 },
  // 守序军人：闷头实干、重军务、按规矩、尽责
  cuiqi:         { EI: -1, SN: +3, TF: +2, JP: +3 },
  // 默默护持者：安静、细致、重情、忠诚
  tanqi:         { EI: -1, SN: +2, TF: -3, JP: +2 },
  // 随性而行者：跟着感觉走、敢爱敢恨、不喜束缚
  wenran:        { EI: 0,  SN: +1, TF: -2, JP: -2 },
  // 案牍中的推演者（INTP）：沉迷数据与模型、纯逻辑、开放推演不急于定论
  xuhezi:        { EI: -2, SN: 0,  TF: +3, JP: -1 },
  // 孤注一掷者：果决行动、冷酷执行、冒险豪赌
  longbo:        { EI: +1, SN: +1, TF: +2, JP: -2 },
  // 暗处的刃：神秘难测、看可能性、不受拘束
  yuzhen:        { EI: +1, SN: -2, TF: -1, JP: -3 },
  // 冷眼旁观者：八面玲珑、思辨、利己、不急着站队
  yaoruneng:     { EI: +2, SN: -1, TF: +2, JP: -1 },
  // 实务钻营者：交际、务实、利益优先、讲流程
  yuanzai:       { EI: +3, SN: +2, TF: +3, JP: +3 },
  // 权柄执掌者：战略、掌控、冷酷、求胜
  linjiulang:    { EI: +2, SN: -2, TF: +3, JP: +3 },
  // 心怀天下者：洞察本质、仁厚、理想坚定
  heyizheng:     { EI: -1, SN: -3, TF: -2, JP: +1 },
  // 市井烟火（ESFJ）：重人情、过眼前日子、守习俗
  baixing:       { EI: +2, SN: +2, TF: -2, JP: +1 },
  // 守灯人（INFP）：深情、内省、为心中那点不肯妥协的东西活着
  dingtonger:    { EI: -1, SN: -1, TF: -3, JP: -1 },
  // 聚火者（ENFJ）：敢担当、能凝聚人心、站在人前
  wangyunxiu:    { EI: +2, SN: -1, TF: -2, JP: +2 },
  // 平康坊之主（ESFP）：八面玲珑、活在当下、最懂人情世故
  gela:          { EI: +3, SN: +2, TF: -1, JP: -2 },
};

function zscore(vec, keys) {
  const vals = keys.map(k => vec[k] || 0);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const sd = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length);
  const out = {};
  keys.forEach((k, i) => { out[k] = sd > 1e-6 ? (vals[i] - mean) / sd : 0; });
  return out;
}

// ===== 匹配最相似的书中人物 =====
// 策略：
//   1) 主匹配 = 与你 MBTI 型相同的那位人物（16 型 ↔ 16 人物，一一对应）
//   2) 契合度 = 你的四维强度与该人物向量的平均偏差（100 分制）
//   3) 次席   = 用 z-score 比较"特质形状"找第二接近的人物，提供补充视角
export function matchMBTICharacter(dims, type) {
  const keys = dims.map(d => d.key);
  const player = {};
  dims.forEach(d => { player[d.key] = d.leftPct - 50; });

  const main = (MBTI_TYPES[type] && MBTI_TYPES[type].who) || null;
  const cv = (v) => keys.map(k => ((v[k] || 0) / 3) * 50);

  // 契合度：平均绝对偏差越小越高
  let similarity = 0;
  if (main && CHARACTER_MBTI[main]) {
    const c = cv(CHARACTER_MBTI[main]);
    const dev = keys.reduce((s, k, i) => s + Math.abs(player[k] - c[i]), 0) / keys.length;
    similarity = Math.max(0, Math.min(100, Math.round(100 - dev)));
  }

  // 次席：z-score 形状最接近（排除主匹配）
  const pz = zscore(player, keys);
  let second = null, secondD = Infinity, secondSim = 0;
  for (const id in CHARACTER_MBTI) {
    if (id === main) continue;
    const cz = zscore(CHARACTER_MBTI[id], keys);
    const d = Math.sqrt(keys.reduce((s, k) => s + (pz[k] - cz[k]) ** 2, 0));
    if (d < secondD) {
      secondD = d; second = id;
      secondSim = Math.max(0, Math.min(100, Math.round(100 - d * 18)));
    }
  }

  return {
    id: main, similarity,
    second, secondSimilarity: secondSim,
  };
}

// ===== 计算 MBTI 结果 =====
// raw:  { EI: n, SN: n, TF: n, JP: n }
// caps: { EI: n, ... } 各维度"可获得的绝对上限"累计
// 返回：{ type: 'INTJ', dims: [ {key, letter, percent, ...} ] }
export function computeMBTI(raw, caps) {
  const dims = MBTI_DIMS.map(d => {
    const r = raw[d.key] || 0;
    const cap = caps[d.key] || 0;
    // 主导字母及强度：raw=0 → 50/50；raw=+cap → 100/0；raw=-cap → 0/100
    let ratio = cap > 0 ? (r / cap) * 50 : 0;
    ratio = Math.max(-50, Math.min(50, ratio));
    const leftPct = Math.round(50 + ratio);      // 左侧字母(E/S/T/J)占比
    const rightPct = 100 - leftPct;
    const letter = r > 0 ? d.left : d.right;      // 0 时归右侧（常规做法）
    return {
      key: d.key, letter,
      left: d.left, right: d.right,
      leftName: d.leftName, rightName: d.rightName,
      leftPct, rightPct,
      strength: Math.max(leftPct, rightPct),       // 偏好强度 50-100
      desc: letter === d.left ? d.leftDesc : d.rightDesc,
      question: d.question,
      iconL: d.iconL, iconR: d.iconR,
      raw: r,
    };
  });
  const type = dims.map(d => d.letter).join('');
  return { type, dims };
}

// 某场景节点各维度的可获得绝对上限
export function mbtiNodeMax(sceneId) {
  const list = MBTI_CHOICE[sceneId] || [];
  const m = { EI: 0, SN: 0, TF: 0, JP: 0 };
  list.forEach(w => {
    if (!w) return;
    for (const k in m) m[k] = Math.max(m[k], Math.abs(w[k] || 0));
  });
  return m;
}
