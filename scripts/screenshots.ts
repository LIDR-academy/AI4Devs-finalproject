import { chromium } from 'playwright';

const BASE = 'https://realista.up.railway.app';
const pages = [
  { path: '/', name: '01-landing', label: 'Landing page' },
  { path: '/listing-lens', name: '02-listing-lens', label: 'Listing Lens' },
  { path: '/mi-proceso', name: '03-dashboard', label: 'Dashboard' },
  { path: '/mortgage-compass', name: '04-mortgage-compass', label: 'Perfil hipotecario' },
  { path: '/timeline', name: '05-proceso-compra', label: 'Proceso de compra' },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });

  for (const page of pages) {
    console.log(`Taking screenshot: ${page.label}...`);
    const p = await context.newPage();
    await p.goto(`${BASE}${page.path}`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1000);
    await p.screenshot({
      path: `screenshots/${page.name}.png`,
      fullPage: true,
    });
    await p.close();
    console.log(`  ✓ screenshots/${page.name}.png`);
  }

  await browser.close();
  console.log('\nDone. 5 screenshots saved to screenshots/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
