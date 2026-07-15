import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const viewports = [
  { width: 1280, height: 800, label: 'desktop' },
  { width: 968, height: 1180, label: 'reported-overlap' },
  { width: 390, height: 844, label: 'mobile' }
];

const intersects = (a, b) => !(
  a.right <= b.left ||
  a.left >= b.right ||
  a.bottom <= b.top ||
  a.top >= b.bottom
);

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);

    const geometry = await page.evaluate(() => {
      const box = (selector) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Missing layout target: ${selector}`);
        const rect = element.getBoundingClientRect();
        return {
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
          width: rect.width,
          height: rect.height
        };
      };

      return {
        documentCard: box('.title-document'),
        recoveryRow: box('.deed-row:last-of-type'),
        seal: box('.clear-seal'),
        caption: box('.scene-caption'),
        nextSection: box('.company-moment'),
        viewportWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth
      };
    });

    if (intersects(geometry.seal, geometry.recoveryRow)) {
      throw new Error(`${viewport.label}: clear-to-act seal overlaps the Recovery row`);
    }

    if (geometry.caption.top < geometry.documentCard.bottom - 1) {
      throw new Error(`${viewport.label}: caption overlaps the title document`);
    }

    if (geometry.caption.bottom > geometry.nextSection.top + 1) {
      throw new Error(`${viewport.label}: caption overlaps the next section`);
    }

    if (geometry.scrollWidth > geometry.viewportWidth + 1) {
      throw new Error(`${viewport.label}: horizontal overflow detected`);
    }

    console.log(`${viewport.label}: hero layout passed`);
    await context.close();
  }
} finally {
  await browser.close();
}
