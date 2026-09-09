// 《长安十二时辰》人物名册
// side: 靖安司 / 朝廷 / 坊间 / 狼卫 / 暗线  (用于关系与立场判定)
// trust: 对主角张小敬的初始信任度 0-100，会随抉择变化

export const characters = {
  zhangxiaojing: {
    id: 'zhangxiaojing', name: '张小敬', alias: '五尊阎罗 / 不良帅',
    side: '靖安司', trust: 100, isPOV: true,
    bio: '前长安不良帅，现死囚。十年西域兵、九年不良帅，为守护长安的百姓不惜一切。性格孤狠，手段狠辣，心中却有一杆秤。',
    words: '长安，是我拼了命也要守住的地方。',
  },
  libi: {
    id: 'libi', name: '李必', alias: '靖安司司丞',
    side: '靖安司', trust: 70, isPOV: true,
    bio: '靖安司司丞，少年天才，道家出身，师承何执正。以「必」为名，志在守护大唐。理性、孤高，愿意为长安赌上一切。',
    words: '我要保的，是这长安城里的八十四万人。',
  },
  cuiqi: {
    id: 'cuiqi', name: '崔器', alias: '旅贲军校尉',
    side: '朝廷', trust: 40, isPOV: true,
    bio: '右骁卫旅贲军校尉。出身行伍，崇尚军功，一直想调回陇右。与张小敬既有冲突也有敬意，是典型的军人思维。',
    words: '我崔器，是要靠军功博一个出身的。',
  },
  tanqi: {
    id: 'tanqi', name: '檀棋', alias: '李必侍女',
    side: '靖安司', trust: 75,
    bio: '李必身边的侍女，机敏善察，通晓人情。身世有隐情，对李必忠心耿耿，也是连接坊间的纽带。',
    words: '公子要做什么，奴婢便做什么。',
  },
  wenran: {
    id: 'wenran', name: '闻染', alias: '香铺老板娘',
    side: '坊间', trust: 55,
    bio: '长安香铺老板娘，与张小敬有旧。聪慧果敢，掌握着不少坊间消息，身上牵着一段旧案。',
    words: '张小敬，你欠我的，不止一条命。',
  },
  yaoruneng: {
    id: 'yaoruneng', name: '姚汝能', alias: '靖安司官吏',
    side: '靖安司', trust: 45,
    bio: '靖安司官吏，出身世家，心思缜密但立场摇摆。记录着这一切，也在暗自观察每一个人。',
    words: '这靖安司里，谁是干净的？',
  },
  longbo: {
    id: 'longbo', name: '龙波', alias: '狼卫首领',
    side: '狼卫', trust: 0,
    bio: '狼卫首领。冷酷、缜密，为复仇而潜入长安。他不是疯子，他的每一步都算得很准。',
    words: '这长安，欠我们的，总要还。',
  },
  heyizheng: {
    id: 'heyizheng', name: '何执正', alias: '秘书监',
    side: '朝廷', trust: 20,
    bio: '秘书监，李必的恩师。朝堂老臣，看似超然，实则深知朝局险恶。',
    words: '必儿，你要走的路，比你想的更难。',
  },
  yuanzai: {
    id: 'yuanzai', name: '元载', alias: '大理寺评事',
    side: '朝廷', trust: 10,
    bio: '大理寺评事，趋炎附势，善于钻营。在朝堂的旋涡中，他永远站在能赢的一边。',
    words: '这世道，识时务者才是俊杰。',
  },
  linjiulang: {
    id: 'linjiulang', name: '林九郎', alias: '右相',
    side: '朝廷', trust: 5,
    bio: '当朝右相，权倾朝野。朝堂争斗的另一端，与太子一系水火不容。',
    words: '长安的棋局，从来不在长安。',
  },
  // 暗线 / 幕后
  xuhezi: {
    id: 'xuhezi', name: '徐宾', alias: '靖安司主事',
    side: '靖安司', trust: 60,
    bio: '靖安司主事，精通算术与户籍，过目不忘。执着于「大案牍术」，相信数据能预知一切。',
    words: '只要数据够全，这天下没有算不出来的事。',
  },
  // 结局关键人物
  yuzhen: {
    id: 'yuzhen', name: '鱼肠', alias: '神秘女子',
    side: '暗线', trust: 0,
    bio: '来历神秘的女子，与龙波有千丝万缕的联系。她的一切都藏在暗处。',
    words: '你以为你在查案，其实你只是棋子。',
  },
  // ===== 补 3 位（凑齐 16 型人物对应）=====
  dingtonger: {
    id: 'dingtonger', name: '丁瞳儿', alias: '平康坊女子',
    side: '坊间', trust: 40,
    bio: '平康坊的女子，与阿枝相恋却身不由己。她看似柔弱，心里却有不肯妥协的东西。别人拿钱买她，她只认一样东西——真心。',
    words: '这世上，总有些东西是钱买不来的。',
  },
  wangyunxiu: {
    id: 'wangyunxiu', name: '王韫秀', alias: '将门之女',
    side: '朝廷', trust: 35,
    bio: '大将军王宗汜之女。生于权贵之门，却有股不服输的倔强。她不信女子只能困于后宅，敢质疑、敢担当，也敢站在人前。',
    words: '我爹是将军，我也能提刀。',
  },
  gela: {
    id: 'gela', name: '葛老', alias: '平康坊之主',
    side: '坊间', trust: 30,
    bio: '平康坊地下世界的掌控者。八面玲珑，最懂长安的人情世故。他不讲道义，只讲规矩——他自己的规矩。在这座城里，没人比他更会看人。',
    words: '长安城里的规矩，到平康坊就得改一改。',
  },

  // 群众 / 象征
  baixing: {
    id: 'baixing', name: '长安百姓', alias: '八十四万人',
    side: '坊间', trust: 0,
    bio: '长安城一百零八坊，八十四万人口。他们不懂朝堂、不懂权谋，只想好好过这个上元节。',
    words: '灯亮起来就好了。',
  },
};

// 十二时辰（剧情章节）
export const hours = [
  { key: 'zi',   name: '子时', span: '23-01', label: '夜半' },
  { key: 'chou', name: '丑时', span: '01-03', label: '鸡鸣' },
  { key: 'yin',  name: '寅时', span: '03-05', label: '平旦' },
  { key: 'mao',  name: '卯时', span: '05-07', label: '日出' },
  { key: 'chen', name: '辰时', span: '07-09', label: '食时' },
  { key: 'si',   name: '巳时', span: '09-11', label: '隅中' },
  { key: 'wu',   name: '午时', span: '11-13', label: '日中' },
  { key: 'wei',  name: '未时', span: '13-15', label: '日昳' },
  { key: 'shen', name: '申时', span: '15-17', label: '哺时' },
  { key: 'you',  name: '酉时', span: '17-19', label: '日入' },
  { key: 'xu',   name: '戌时', span: '19-21', label: '黄昏' },
  { key: 'hai',  name: '亥时', span: '21-23', label: '人定' },
];
