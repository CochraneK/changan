import { chromium } from 'playwright';

const url = 'http://127.0.0.1:8010/index.html';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });

const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

// 首页检查
const title = await page.textContent('.act-title').catch(() => null);
const hour = await page.textContent('.act-hour').catch(() => null);
const choiceCount = await page.locator('.choice-btn').count();
const name = await page.textContent('.view-who').catch(() => null);
console.log('首页时辰:', hour);
console.log('地点标题:', title);
console.log('当前视角:', name);
console.log('选项数量:', choiceCount);

await page.screenshot({ path: 'tools/shot1_start.png' });

// 点击第一个选项，走一步
await page.locator('.choice-btn').first().click();
await page.waitForTimeout(600);
const t2 = await page.textContent('.act-hour').catch(() => null);
const clueCount = await page.locator('#clueList .list-item').count();
console.log('第二步时辰:', t2);
console.log('线索数:', clueCount);
await page.screenshot({ path: 'tools/shot2_step.png' });

// 连续点击走到结局
for (let i = 0; i < 30; i++) {
  const overlayVisible = await page.locator('#overlay').evaluate(el => !el.classList.contains('hidden')).catch(() => false);
  if (overlayVisible) break;
  const btn = page.locator('.choice-btn').first();
  if (await btn.count() === 0) break;
  await btn.click();
  await page.waitForTimeout(220);
}
await page.waitForTimeout(600);
const endVisible = await page.locator('#overlay').evaluate(el => !el.classList.contains('hidden')).catch(() => false);
console.log('结局浮层显示:', endVisible);
if (endVisible) {
  const endTitle = await page.textContent('.end-tag').catch(() => null);
  console.log('结局:', endTitle);
}
await page.screenshot({ path: 'tools/shot3_ending.png' });

console.log('');
if (errors.length) {
  console.log('❌ 运行时错误:');
  errors.forEach(e => console.log('   ' + e));
} else {
  console.log('✅ 无运行时错误');
}

await browser.close();
