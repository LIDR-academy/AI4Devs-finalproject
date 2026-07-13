import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../docs/screenshots');
const baseUrl = process.env.LMS_BASE_URL || 'http://127.0.0.1:8080';

const users = {
  teacher: { email: 'teacher@example.com', password: 'password123' },
  student: { email: 'student@example.com', password: 'password123' },
};

async function login(page, role) {
  const user = users[role];
  await page.goto(`${baseUrl}/login`);
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
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
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });

// Guest — login
await shot(desktop, 'login-moodle52.png', '/login');
await shot(desktop, 'login.png', '/login');

// Teacher
await login(desktop, 'teacher');
await shot(desktop, 'dashboard-teacher.png', '/dashboard');
await shot(desktop, 'dashboard-full-page.png', '/dashboard');
await shot(desktop, 'courses-teacher.png', '/courses');
await shot(desktop, 'calendar-teacher.png', '/calendar');
await shot(desktop, 'calendar-event-create.png', '/calendar/events/create');
await shot(desktop, 'gradebook-teacher.png', '/courses/1/grades');
await shot(desktop, 'comms-notifications.png', '/comms/notifications');
await shot(desktop, 'comms-messages.png', '/comms/messages');
await shot(desktop, 'comms-mail.png', '/comms/mail');

// Upgrade assistant requires admin
await desktop.context().clearCookies();
await desktop.evaluate(() => {
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch {
    /* ignore */
  }
});
await login(desktop, 'teacher');
await shot(desktop, 'upgrade-assistant.png', '/upgrade-assistant');

// AI / Grill me — student lesson view (enrolled)
await desktop.context().clearCookies();
await login(desktop, 'student');
await desktop.goto(`${baseUrl}/lessons/1`);
await desktop.waitForLoadState('networkidle');
const aiToggle = desktop.locator('#m52-ai-toggle');
if (await aiToggle.count()) {
  await aiToggle.click();
  const accept = desktop.locator('#m52-ai-accept');
  if (await accept.isVisible()) {
    await accept.click();
    await desktop.waitForTimeout(500);
  }
  const grillBtn = desktop.locator('[data-grill-open]');
  if (await grillBtn.count()) {
    await grillBtn.click();
    await desktop.waitForTimeout(300);
  }
}
await desktop.screenshot({
  path: path.join(outDir, 'ai-grill-me.png'),
  fullPage: true,
});
console.log('saved ai-grill-me.png');

// Student dashboards
await shot(desktop, 'dashboard-student.png', '/dashboard');
await shot(desktop, 'calendar-student.png', '/calendar');
await shot(desktop, 'playwright-calendar-student.png', '/calendar');

// Playwright CI alternates — teacher session
await desktop.context().clearCookies();
await login(desktop, 'teacher');
await shot(desktop, 'playwright-calendar-teacher.png', '/calendar');
await shot(desktop, 'playwright-calendar-event-create.png', '/calendar/events/create');

// Responsive samples (mobile viewport)
await mobile.context().clearCookies();
await login(mobile, 'teacher');
await shot(mobile, 'calendar-teacher-mobile.png', '/calendar');
await shot(mobile, 'dashboard-teacher-mobile.png', '/dashboard');

await browser.close();
