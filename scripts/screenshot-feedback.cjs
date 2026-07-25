/**
 * Playwright: trigger real store feedback + screenshot
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function main() {
  const outDir = path.join(__dirname, '..', 'test-results');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 420, height: 860 },
  });

  await page.goto('http://localhost:8081', {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await page.waitForTimeout(3500);

  for (let i = 0; i < 10; i++) {
    const classic = page.getByText(/classic/i).first();
    if (await classic.isVisible().catch(() => false)) {
      await classic.click({ timeout: 3000 }).catch(() => {});
      break;
    }
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(1500);

  await page.waitForFunction(
    () => typeof window.__GAME_STORE__ !== 'undefined',
    null,
    { timeout: 45000 },
  );

  await page.evaluate(() => {
    window.__GAME_STORE__.setState({
      feedbackVisible: true,
      moodVisible: true,
      feedbackNonce: Date.now(),
      lastScoreBreakdown: {
        points: 100,
        feedbackTier: 'Good',
        comboMultiplier: 1,
        linesCleared: 1,
      },
    });
  });

  await page.waitForSelector('[data-testid="feedback-tier"]', { timeout: 8000 });
  await page.waitForTimeout(250);

  const shotGood = path.join(outDir, 'feedback-good.png');
  await page.screenshot({ path: shotGood, fullPage: false });

  await page.evaluate(() => {
    window.__GAME_STORE__.setState({
      feedbackVisible: true,
      moodVisible: true,
      feedbackNonce: Date.now(),
      lastScoreBreakdown: {
        points: 480,
        feedbackTier: 'Perfect',
        comboMultiplier: 1.4,
        linesCleared: 2,
      },
    });
  });
  await page.waitForTimeout(350);
  const shotPerfect = path.join(outDir, 'feedback-perfect.png');
  await page.screenshot({ path: shotPerfect, fullPage: false });

  const tierText = await page.getByTestId('feedback-tier').innerText();
  const moodText = await page
    .getByTestId('mood-text')
    .innerText()
    .catch(() => null);

  console.log(
    JSON.stringify(
      {
        shotGood,
        shotPerfect,
        tierText,
        moodText,
        ok: /Perfect/i.test(tierText),
      },
      null,
      2,
    ),
  );

  await browser.close();
  if (!/Perfect/i.test(tierText)) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
