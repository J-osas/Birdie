import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.QA_BASE_URL || 'http://127.0.0.1:3000';
const OUT = path.resolve('docs/qa-hire-lifecycle');
const PRO_ID = '40e657f4-3d17-4acb-b2e3-015dc0d7a1fa';

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(20000);

async function shot(name) {
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
  console.log('saved', name);
}

try {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await shot('01-home');

  await page.goto(`${BASE}/professionals`, { waitUntil: 'networkidle' });
  await shot('02-professionals');

  await page.goto(`${BASE}/professionals/${PRO_ID}`, { waitUntil: 'networkidle' });
  await shot('03-public-profile');

  await page.goto(`${BASE}/hire?pro=${PRO_ID}`, { waitUntil: 'networkidle' });
  await shot('04-hire-start');
  const keepGoing = page.getByRole('button', { name: /sign in to keep going/i });
  if (await keepGoing.count()) {
    await keepGoing.click();
    await page.waitForLoadState('networkidle');
    await shot('04b-hire-redirects-to-login');
  }

  await page.goto(`${BASE}/login?next=/hire`, { waitUntil: 'networkidle' });
  await shot('05-login');

  await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
  await shot('06-register');

  await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' });
  await shot('07-contact');

  await page.goto(`${BASE}/app/hires`, { waitUntil: 'networkidle' });
  await shot('08-app-hires-requires-login');
} finally {
  await browser.close();
}
