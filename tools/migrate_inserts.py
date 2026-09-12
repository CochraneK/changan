#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 inserts 的定位方式从「pos: 'start'|'end'」迁移到「正文里的显式锚点 {{inserts}}」。

为什么必须改：
    pos 只能二选一（塞在最前 / 塞在最后），但节点正文往往以「转场句」开头
    （例如「你出了靖安司，没有直接去查案。」）。一律塞在最前，就会变成
    「先提到葛老、再说你走进葛老的暗市」这种预告式倒叙——读起来就是断的。

    {{inserts}} 让插入点由正文结构决定：作者在哪一行想要延伸，就把标记放哪里。

本脚本做两件纯机械的事（不改一个字的叙事内容）：
    ① 删掉所有 inserts 条目里的 pos 字段
    ② 在指定的正文位置插入 {{inserts}} 标记

锚点表 anchors 里每一项是 (节点id, 锚点原文, 标记放在锚点前还是后)。
脚本会强制校验「锚点在该节点正文里唯一出现」，否则报错退出——宁可停下，也不猜。
"""
import re
import sys
from pathlib import Path

SCENES = Path(__file__).resolve().parent.parent / "src" / "data" / "scenes.js"

# (节点 id, 锚点字符串, 位置)  position: 'before' = 标记放在锚点之前；'after' = 之后
# 锚点统一选「转场句 / 定场句」的边界，让插段落在"场景已经交代清楚你在哪"之后。
ANCHORS = [
    # 李必收图之后、更鼓之前 —— 让"你刚才那句话"的回声落在收图这个动作上
    ("s1_task", "窗外的更鼓响了一声。子时已过。", "before"),
    # 葛老把价码摆出来之前 —— 姿态的回声先响，再落到"但我不白给"
    ("h_zi2_gela", "「你要的人，我知道在哪。」葛老终于看你一眼", "before"),
    # 破题句之后 —— 先把"你跑了一上午"立住，再交代这一上午你到底干了什么
    ("h_mao_snack", "路过西市口，那个老胡人的胡饼摊还在。", "before"),
    # 爬上来之后、长安铺开之前
    ("h_wei_roof", "长安城在脚下铺开——", "before"),
    # 走进靖安司之后、徐宾出现之前
    ("h_you_xubin", "徐宾坐在门槛上，旁边放着一壶酒和两个碗。", "before"),
    # 进了库房之后、被震住之前
    ("h_chou", "一进门，你就被震住了。", "before"),
    # 街面立住之后、崔器开口之前
    ("h_yin", "崔器走在你旁边，手一直按在刀柄上。", "before"),
    # 这条街认得之后、骚动出现之前
    ("h_mao", "前面传来一阵骚动。", "before"),
    # 定场之后、李必动作之前
    ("h_chen", "李必听完你的回报，手指在案上敲了两下。", "before"),
    # 定场之后、闻染出现之前
    ("h_si", "闻染正在碾香料，听见门响，头也没抬。", "before"),
    # 插段本身以"她把文书递过来"收尾，所以放在"你翻开文书"之前正好接得上
    ("h_si_doc", "你翻开文书。", "before"),
    # 定场之后、崔器出现之前
    ("h_wu", "崔器正在擦他的横刀。", "before"),
    # 「人却不见了」之后 —— 顺势交代谁没走
    ("h_wei", "李必从屏风后走出来，脸色苍白。", "before"),
    # 定场之后
    ("h_shen", "你靠在墙上，喘着气。", "before"),
    # 定场之后
    ("h_you", "你顺着线索摸到一处废弃的宅院。", "before"),
    # 龙波背对你检查油桶时 —— 酒桌上的回声 + 你对这批油的辨认都落在这
    ("h_xu", "「来了。」他说，「比我想的早。」", "before"),
    # 定场之后、他举起火折子之前
    ("h_hai", "龙波把火折子举在你面前。", "before"),
]

MARK = "{{inserts}}"


def node_body(src: str, node_id: str) -> tuple[int, int]:
    """返回某节点在源码中的 [start, end) 区间。按缩进 2 空格的 `id: {` 匹配。"""
    pat = re.compile(r"^  " + re.escape(node_id) + r": \{", re.M)
    m = pat.search(src)
    if not m:
        raise SystemExit(f"✗ 找不到节点 {node_id}")
    start = m.start()
    # 节点结束 = 下一个 `  xxx: {` 或文件尾的 `};`
    nxt = re.compile(r"^  [a-z_0-9]+: \{|^\};", re.M).search(src, m.end())
    end = nxt.start() if nxt else len(src)
    return start, end


def main() -> int:
    src = SCENES.read_text(encoding="utf-8", newline="")
    orig = src

    # ---------- ① 删掉 pos 字段 ----------
    removed = len(re.findall(r"\s*pos: '(?:start|end)',", src))
    src = re.sub(r"\s*pos: '(?:start|end)',", "", src)
    print(f"① 删除 pos 字段：{removed} 处")

    # ---------- ② 插入 {{inserts}} 标记 ----------
    # 从后往前处理，避免前面的插入让后面的偏移量失效
    placed = 0
    for node_id, anchor, where in sorted(
        ANCHORS, key=lambda a: node_body(src, a[0])[0], reverse=True
    ):
        ns, ne = node_body(src, node_id)
        seg = src[ns:ne]
        n = seg.count(anchor)
        if n != 1:
            raise SystemExit(
                f"✗ [{node_id}] 锚点出现 {n} 次（要求恰好 1 次），拒绝改动：{anchor!r}"
            )
        if MARK in seg:
            print(f"   · [{node_id}] 已有标记，跳过")
            continue
        ins = f"{MARK}\n\n{anchor}" if where == "before" else f"{anchor}\n\n{MARK}"
        seg = seg.replace(anchor, ins, 1)
        src = src[:ns] + seg + src[ne:]
        placed += 1
    print(f"② 插入 {{inserts}} 标记：{placed} 处")

    # ---------- ③ 自检 ----------
    if src.count(MARK) != placed:
        raise SystemExit("✗ 标记数量与预期不符，已放弃写入")

    if src == orig:
        print("（无变化，未写盘）")
        return 0
    SCENES.write_text(src, encoding="utf-8", newline="")
    print(f"✓ 已写入 {SCENES.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
