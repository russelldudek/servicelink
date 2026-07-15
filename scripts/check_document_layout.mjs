import { chromium } from 'playwright';

const baseUrl = process.env.CAMPAIGN_BASE_URL || 'http://127.0.0.1:4173';
const documentRoutes = [
  'resume.html',
  'cover-letter.html',
  'interview-brief.html',
  '90-day-plan.html',
  'agent-title-review.html'
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
const page = await context.newPage();

try {
  for (const route of documentRoutes) {
    await page.emulateMedia({ media: 'screen' });
    await page.goto(`${baseUrl}/${route}`, { waitUntil: 'networkidle' });

    const controls = await page.locator('.document-actions-bar').evaluate((bar) => ({
      printControls: [...bar.querySelectorAll('button, a')]
        .filter((node) => {
          const label = (node.textContent || '').trim().toLowerCase();
          const onclick = node.getAttribute('onclick') || '';
          return label === 'print' || onclick.includes('window.print');
        })
        .map((node) => node.outerHTML),
      downloadLinks: [...bar.querySelectorAll('a')]
        .filter((node) => /download pdf/i.test(node.textContent || ''))
        .map((node) => node.getAttribute('href'))
    }));

    assert(
      controls.printControls.length === 0,
      `${route} still exposes a Print control: ${controls.printControls.join(' | ')}`
    );
    assert(
      controls.downloadLinks.length === 1 && controls.downloadLinks[0]?.includes('.pdf'),
      `${route} must expose exactly one working Download PDF link.`
    );
  }

  await page.goto(`${baseUrl}/90-day-plan.html`, { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });

  const plan = await page.evaluate(() => {
    const toPx = (value) => Number.parseFloat(value || '0');
    const sheets = [...document.querySelectorAll('.document-sheet')];
    const mainTextSelectors = [
      '.document-sheet > p',
      '.document-sheet li',
      '.timeline-table td',
      '.metric-table td',
      '.metric-table th',
      '.callout'
    ];
    const mainText = mainTextSelectors.flatMap((selector) => [...document.querySelectorAll(selector)]);
    const fontSizes = mainText.map((node) => toPx(getComputedStyle(node).fontSize));
    const contactSizes = [...document.querySelectorAll('.document-contact')]
      .map((node) => toPx(getComputedStyle(node).fontSize));

    return {
      sheetCount: sheets.length,
      pageLabels: sheets.map((sheet) => sheet.querySelector('.page-number')?.textContent?.trim() || ''),
      minMainFontPx: Math.min(...fontSizes),
      minContactFontPx: Math.min(...contactSizes),
      overflow: sheets.map((sheet, index) => ({
        page: index + 1,
        clientHeight: sheet.clientHeight,
        scrollHeight: sheet.scrollHeight,
        overflowPx: sheet.scrollHeight - sheet.clientHeight
      }))
    };
  });

  assert(plan.sheetCount === 3, `90-day plan must render exactly 3 sheets; found ${plan.sheetCount}.`);
  assert(
    plan.pageLabels.every((label, index) => label.includes(`${index + 1} of 3`)),
    `90-day page labels are incorrect: ${plan.pageLabels.join(' | ')}`
  );
  assert(
    plan.minMainFontPx >= 11,
    `90-day plan main text is too small: minimum ${plan.minMainFontPx}px; expected at least 11px.`
  );
  assert(
    plan.minContactFontPx >= 9,
    `90-day plan contact text is too small: minimum ${plan.minContactFontPx}px; expected at least 9px.`
  );
  const overflowing = plan.overflow.filter((item) => item.overflowPx > 2);
  assert(
    overflowing.length === 0,
    `90-day plan content overflows the print sheet: ${JSON.stringify(overflowing)}`
  );

  console.log(JSON.stringify({ documentControls: 'pass', ninetyDayPlan: plan }, null, 2));
} finally {
  await browser.close();
}
