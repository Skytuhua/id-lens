import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = process.env.URL ?? 'http://localhost:4173/';
const OUT = process.env.OUT ?? 'review/screenshots';
const THEME = process.env.THEME ?? 'dark';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });

const desktopCtx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: THEME === 'dark' ? 'dark' : 'light',
});

const mobileCtx = await browser.newContext({
  viewport: { width: 390, height: 800 },
  deviceScaleFactor: 2,
  colorScheme: THEME === 'dark' ? 'dark' : 'light',
});

async function applyTheme(page, theme) {
  await page.evaluate((t) => localStorage.setItem('id-lens.theme', t), theme);
}

async function shot(name, page) {
  const file = join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log('wrote', file);
}

async function flow(ctx, label) {
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'load' });
  await applyTheme(page, THEME);
  await page.reload({ waitUntil: 'load' });

  await page.waitForSelector('.app-header', { timeout: 5000 });

  // Empty inspector
  await shot(`${label}-01-inspector-empty`, page);

  // Inspector with UUID v1 result
  await page.fill('#id-input', '6ba7b810-9dad-11d1-80b4-00c04fd430c8');
  await page.waitForTimeout(200);
  await shot(`${label}-02-inspector-uuid-v1`, page);

  // ULID
  await page.fill('#id-input', '');
  await page.fill('#id-input', '01ARZ3NDEKTSV4RRFFQ69G5FAV');
  await page.waitForTimeout(200);
  await shot(`${label}-03-inspector-ulid`, page);

  // Snowflake (ambiguous — multiple candidates)
  await page.fill('#id-input', '');
  await page.fill('#id-input', '1541815603606036480');
  await page.waitForTimeout(200);
  await shot(`${label}-04-inspector-snowflake-ambiguous`, page);

  // Stripe
  await page.fill('#id-input', '');
  await page.fill('#id-input', 'sk_test_FAKEexample00000000000000');
  await page.waitForTimeout(200);
  await shot(`${label}-05-inspector-stripe-test-key`, page);

  // No match
  await page.fill('#id-input', '');
  await page.fill('#id-input', 'this is not an id at all !!');
  await page.waitForTimeout(200);
  await shot(`${label}-06-inspector-no-match`, page);

  // Examples tab
  await page.click('button[role="tab"]:has-text("Examples")');
  await page.waitForTimeout(200);
  await shot(`${label}-07-examples`, page);

  // Batch tab
  await page.click('button[role="tab"]:has-text("Batch")');
  await page.waitForTimeout(200);
  await page.click('button.btn:has-text("Load sample")');
  await page.waitForTimeout(200);
  await shot(`${label}-08-batch`, page);

  // Generators tab
  await page.click('button[role="tab"]:has-text("Generators")');
  await page.waitForTimeout(200);
  await shot(`${label}-09-generators`, page);

  // About tab
  await page.click('button[role="tab"]:has-text("About")');
  await page.waitForTimeout(200);
  await shot(`${label}-10-about`, page);

  await page.close();
}

console.log('=== Desktop ===');
await flow(desktopCtx, 'desktop');
console.log('=== Mobile ===');
await flow(mobileCtx, 'mobile');

await browser.close();
console.log('Done.');
