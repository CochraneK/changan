from playwright.sync_api import sync_playwright

URL = "http://127.0.0.1:8010/index.html"
CHROME = r"C:/Program Files/Google/Chrome/Application/chrome.exe"

errors = []


def playthrough(page, pick):
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
        idx = 0 if pick == "first" else (n - 1 if pick == "last" else min(1, n - 1))
        btns.nth(idx).click()
        page.wait_for_timeout(170)
    page.wait_for_timeout(500)

    def t(sel):
        try:
            return page.text_content(sel)
        except Exception:
            return None

    # 四维倾向
    dims = []
    try:
        for d in page.locator(".mbti-dim").all():
            letters = [x.strip() for x in d.locator(".mbti-letter").all_inner_texts()]
            pcts = [x.strip() for x in d.locator(".mbti-pct").all_inner_texts()]
            dims.append(f"{letters[0]}{pcts[0]}/{letters[1]}{pcts[1]}")
    except Exception:
        pass

    return {
        "type": t(".mbti-type"),
        "name": t(".mbti-name"),
        "who": t(".mbti-match-name"),
        "end": t(".end-tag"),
        "dims": dims,
    }


with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME)
    page = b.new_page(viewport={"width": 1280, "height": 900})
    page.on("pageerror", lambda e: errors.append("PAGEERROR: " + str(e)))
    page.on("console", lambda m: errors.append("CONSOLE: " + m.text)
            if m.type == "error" and "favicon" not in m.text else None)

    seen = {}
    for strategy in ["first", "last", "middle"]:
        r = playthrough(page, strategy)
        seen[strategy] = r["type"]
        print(f"--- {strategy} ---")
        print("  结局:", r["end"])
        print("  类型:", r["type"], "|", r["name"])
        print("  同型人物:", r["who"])
        print("  四维:", "  ".join(r["dims"]))
        page.screenshot(path=f"tools/mbti_{strategy}.png", full_page=True)
        print("")

    print("不同类型数:", len(set(seen.values())), "->", seen)
    b.close()

print("")
if errors:
    print("运行时错误:")
    for e in errors[:8]:
        print("   " + e)
else:
    print("OK: 无运行时错误")
