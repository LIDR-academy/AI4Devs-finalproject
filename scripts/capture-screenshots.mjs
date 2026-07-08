import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../docs/screenshots');
const baseUrl = process.env.LMS_BASE_URL || 'http://localhost:8080';

const teacher = {
  email: 'teacher@example.com',
  password: 'password123',
};

async function login(page) {
  await page.goto(`${baseUrl}/login`);
  await page.fill('input[name="email"]', teacher.email);
  await page.fill('input[name="password"]', teacher.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard');
}

async function shot(page, filename, url, setup) {
  if (url) {
    await page.goto(`${baseUrl}${url}`);
    await page.waitForLoadState('networkidle');
  }
  if (setup) {
    await setup(page);
  }
  await page.screenshot({
    path: path.join(outDir, filename),
    fullPage: true,
  });
  console.log(`saved ${filename}`);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await shot(page, 'login-moodle52.png', '/login');

await login(page);
await shot(page, 'upgrade-assistant.png', '/upgrade-assistant');
await shot(page, 'comms-notifications.png', '/comms/notifications');
await shot(page, 'comms-messages.png', '/comms/messages');
await shot(page, 'comms-mail.png', '/comms/mail');
await shot(page, 'gradebook-teacher.png', '/courses/1/grades');

await page.goto(`${baseUrl}/lessons/1`);
await page.waitForLoadState('networkidle');
const aiToggle = page.locator('#m52-ai-toggle');
if (await aiToggle.count()) {
  await aiToggle.click();
  const accept = page.locator('#m52-ai-accept');
  if (await accept.isVisible()) {
    await accept.click();
    await page.waitForTimeout(500);
  }
  const grillBtn = page.locator('[data-grill-open]');
  if (await grillBtn.count()) {
    await grillBtn.click();
    await page.waitForTimeout(300);
  }
}
await page.screenshot({
  path: path.join(outDir, 'ai-grill-me.png'),
  fullPage: true,
});
console.log('saved ai-grill-me.png');

await browser.close();
