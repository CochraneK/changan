from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:8010/index.html"
CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"

errors = []


def playthrough(page, pick):
    """pick: 'first' | 'last' | 'middle'  —— 每步固定选哪个选项"""
    page.goto(URL, wait_until="networkidle")
    page.wait_for_timeout(900)
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
        if pick == "first":
            idx = 0
        elif pick == "last":
            idx = n - 1
        else:
            idx = min(1, n - 1)
        btns.nth(idx).click()
        page.wait_for_timeout(180)
    page.wait_for_timeout(500)

    try:
        end_tag = page.text_content(".end-tag")
    except Exception:
        end_tag = None
    try:
        title = page.text_content(".psy-title")
    except Exception:
        title = None
    try:
        match = page.text_content(".psy-match-name")
    except Exception:
        match = None
    # 读取六维分数
    scores = {}
    try:
        rows = page.locator(".psy-row").all()
        for r in rows:
            name = r.locator(".psy-name").inner_text().strip()
            val = r.locator(".psy-val").inner_text().strip()
            scores[name] = int(val)
    except Exception:
        pass
    return {"end": end_tag, "title": title, "match": match, "scores": scores}


with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    page = b.new_page(viewport={"width": 1280, "height": 900})
    page.on("pageerror", lambda e: errors.append("PAGEERROR: " + str(e)))
    page.on("console", lambda m: errors.append("CONSOLE: " + m.text)
            if m.type == "error" and "favicon" not in m.text else None)

    for strategy in ["first", "last", "middle"]:
        r = playthrough(page, strategy)
        print(f"--- 策略: {strategy} ---")
        print("  结局:", r["end"])
        print("  人格称号:", r["title"])
        print("  最相似:", r["match"])
        print("  六维:", r["scores"])
        # 截图
        page.screenshot(path=f"tools/psy_{strategy}.png", full_page=True)
        print("")

    b.close()

print("")
if errors:
    print("运行时错误:")
    for e in errors[:8]:
        print("   " + e)
else:
    print("OK: 无运行时错误")
