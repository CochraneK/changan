# AGENTS.md —— 给 AI 协作者的速查

> 这份文件只写「不看就会改坏」的东西。用法 / 玩法 / 人格模型的完整说明见 [README.md](README.md)，
> 原著设定基准与逐项偏离见 [docs/CANON.md](docs/CANON.md)。改剧情结构前另读
> `~/.workbuddy/skills/branching-narrative-continuity/`（分支叙事连贯性的验收流水线）。

## 这是什么
浏览器单页剧情冒险（马伯庸《长安十二时辰》改编，覆盖完整十二时辰主线）+ MBTI 人格画像。
零运行时依赖、零构建，纯原生 ES Modules。

## 怎么跑
```bash
python -m http.server 8010     # 或双击 start.bat；浏览器开 http://localhost:8010/
```
> 必须走 HTTP 服务，**不能** `file://` 直开（原生 ES Modules 会被 CORS 拒绝加载）。

## 技术栈
- 运行态：原生 ES Modules（`index.html` + `src/*.js` + `styles.css`），**无任何第三方依赖**。
- 测试态：Node ≥18（`tools/*.mjs`）、Python 3（`tools/*.py`；浏览器冒烟需 playwright）。

## 目录与唯一真相
- `src/data/scenes.js` —— 全部剧情节点；**导出 `isPassage(sc)` / `nextTargets(sc)` 两个图遍历入口**。
- `src/text.js` —— 条件正文解析（`{{inserts}}` / `textVariants`）的**唯一实现**，引擎与 `results.html` 共用。
- `src/main.js` —— 引擎（条件系统 / 存档 / 六维与 MBTI 计分 / 渲染）。
- `src/data/{characters,traits,mbti}.js` —— 人物表 / 六维权重 / MBTI 权重。
- `tools/` —— 校验与测试脚本（不参与运行时）；`docs/CANON.md` —— 人工核对的原著基准表。

## 铁律（改代码前必读）
1. **图遍历只能有一个实现。** 任何工具都必须 `import` `scenes.js` 的 `isPassage` / `nextTargets`，
   **不许自己抄一份**；抄的那份在结构变化后会给出「看起来正常的错数字」而不报错。
2. **不要写死任何会随结构变化的数字。** 节点总数、步数上限、主干长度、共同节点数断言，一律从数据算。
   （踩过：节点 26 → 85 后写死的 `range(30)` 走不到结局，报出「结局浮层: False」这种假故障。）
3. **主线是共享的。** 所有非结局节点都能到达全部 4 个结局 ⇒ 节点正文（含过场）**不得**断言
   「谁在场 / 谁还活着 / 你有什么凭证」这类结局级或路径级事实；要么交给结局，要么放进条件插段。
4. **`h_hai` 是唯一分流点**：4 个结局由它的 4 个选项区分；更早的抉择点只通过 `trust` / `flag`
   间接影响「能不能选」。
5. **改选项顺序必须同步改权重**：`scenes.js` 某节点选项增删 / 换序后，`traits.js` 的 `CHOICE_TRAITS`
   与 `mbti.js` 的对应权重表必须同步改下标 —— `verify` 会因为错位直接报错，这是刻意设计。

## 节点类型
| 类型 | 特征 |
|---|---|
| 抉择点 | 有 `choices`（2–4 个），每个选项可带 flag / clue / trust / require |
| 过场场景 | 非结局、**没有 `choices`**、只有一个 `next` + `nextLabel` → 渲染成「继续」按钮。**不算抉择、不计分** |
| 结局 | 有 `ending` / `endTag` |

## 改完必须跑的验收
```bash
npm run test:all          # verify + check:readme + simulate + branch_audit + passage_audit + continuity_audit + psy_audit
npm run dump:endings      # 4 个结局各读两遍（改过主线正文必跑）
```
其余人工 / 浏览器验收见 README「校验与测试」。

## 当前状态
- **v6.0**：已按「路线 A · 全面对齐原著」修正 P0~P3 全部偏离（决策与逐项落点见 `docs/CANON.md`）。
- `npm run test:all` 全绿。结构上仍是「过场—汇合」式绕行（21 / 22 个抉择点选项去处互不相同），
  **尚未做真分支**；待办见 README「已知限制 / 待办」。
