from playwright.sync_api import sync_playwright
from collections import Counter
import random

URL = "http://127.0.0.1:8010/index.html"
CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"
N = 24
random.seed(42)

errors = []
letters = Counter()          # 每个维度各字母出现次数
types = Counter()
dim_pcts = {k: [] for k in ["EI", "SN", "TF", "JP"]}

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    page = b.new_page(viewport={"width": 1280, "height": 900})
    page.on("pageerror", lambda e: errors.append("PAGEERROR: " + str(e)))

    for run in range(N):
        page.goto(URL, wait_until="networkidle")
        page.wait_for_timeout(650)
        for _ in range(40):
            try:
                if not page.locator("#overlay").evaluate("el => el.classList.contains('hidden')"):
                    break
            except Exception:
                pass
            btns = page.locator(".choice-btn")
            n = btns.count()
            if n == 0:
                break
            btns.nth(random.randrange(n)).click()
            page.wait_for_timeout(110)
        page.wait_for_timeout(320)

        t = page.text_content(".mbti-type").strip()
        types[t] += 1
        for i, k in enumerate(["EI", "SN", "TF", "JP"]):
            letters[(k, t[i])] += 1
        try:
            for i, d in enumerate(page.locator(".mbti-dim").all()):
                pct = d.locator(".mbti-pct").first.inner_text().strip().rstrip("%")
                dim_pcts[["EI", "SN", "TF", "JP"][i]].append(int(pct))
        except Exception:
            pass

    b.close()

print(f"随机 {N} 局结果\n")
print("=== 各维度字母分布 ===")
names = {"EI": "E/I", "SN": "S/N", "TF": "T/F", "JP": "J/P"}
for k in ["EI", "SN", "TF", "JP"]:
    a, b2 = (k == "EI" and ("E", "I")) or (k == "SN" and ("S", "N")) \
        or (k == "TF" and ("T", "F")) or ("J", "P")
    ca, cb = letters[(k, a)], letters[(k, b2)]
    lo, hi = (min(dim_pcts[k]), max(dim_pcts[k])) if dim_pcts[k] else (0, 0)
    print(f"  {names[k]}: {a}={ca:2d}  {b2}={cb:2d}   | 左侧占比区间 {lo}%~{hi}%")

print("\n=== 出现的人格类型 ===")
for t, c in types.most_common():
    print(f"  {t}: {c} 次")

print(f"\n不同类型数: {len(types)} / 16")
covered = set()
for t in types:
    for i, k in enumerate(["EI", "SN", "TF", "JP"]):
        covered.add(t[i])
print(f"覆盖字母: {sorted(covered)}")

print("")
if errors:
    print("运行时错误:")
    for e in errors[:5]:
        print("   " + e)
else:
    print("OK: 无运行时错误")
