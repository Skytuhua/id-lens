import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = process.env.URL ?? 'http://localhost:4173/';
const OUT = process.env.OUT ?? 'review/screenshots';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });

const desktopCtx = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
});

const mobileCtx = await browser.newContext({
  viewport: { width: 390, height: 800 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
});

async function shot(name, page) {
  const file = join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log('wrote', file);
}

async function clearInput(page) {
  // Click the CLEAR button or empty the input directly via JS.
  await page.evaluate(() => {
    const input = document.querySelector('#id-input, input[aria-label="Identifier input"]');
    if (input) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, '');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
}

async function fillInput(page, value) {
  await page.evaluate((v) => {
    const input = document.querySelector('input[aria-label="Identifier input"]');
    if (input) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, v);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, value);
}

async function flow(ctx, label) {
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForSelector('.titlebar', { timeout: 8000 });
  await page.waitForTimeout(200);

  // Empty inspector
  await shot(`${label}-01-inspector-empty`, page);

  // UUID v1
  await fillInput(page, '6ba7b810-9dad-11d1-80b4-00c04fd430c8');
  await page.waitForTimeout(250);
  await shot(`${label}-02-inspector-uuid-v1`, page);

  // ULID
  await fillInput(page, '01ARZ3NDEKTSV4RRFFQ69G5FAV');
  await page.waitForTimeout(250);
  await shot(`${label}-03-inspector-ulid`, page);

  // Ambiguous snowflake
  await fillInput(page, '1541815603606036480');
  await page.waitForTimeout(250);
  await shot(`${label}-04-inspector-snowflake-ambiguous`, page);

  // Stripe test key (synthetic)
  await fillInput(page, 'sk_test_FAKEexample00000000000000');
  await page.waitForTimeout(250);
  await shot(`${label}-05-inspector-stripe-test-key`, page);

  // No match
  await fillInput(page, 'this is not an id at all !!');
  await page.waitForTimeout(250);
  await shot(`${label}-06-inspector-no-match`, page);

  // Examples tab
  await page.click('button[role="tab"]:has-text("examples")');
  await page.waitForTimeout(250);
  await shot(`${label}-07-examples`, page);

  // Batch tab
  await page.click('button[role="tab"]:has-text("batch")');
  await page.waitForTimeout(300);
  await shot(`${label}-08-batch`, page);

  // Generators tab
  await page.click('button[role="tab"]:has-text("generators")');
  await page.waitForTimeout(250);
  await shot(`${label}-09-generators`, page);

  // About tab
  await page.click('button[role="tab"]:has-text("about")');
  await page.waitForTimeout(250);
  await shot(`${label}-10-about`, page);

  // Help overlay
  await page.click('button[role="tab"]:has-text("inspector")');
  await page.waitForTimeout(150);
  await page.keyboard.press('?');
  await page.waitForTimeout(250);
  await shot(`${label}-11-help-overlay`, page);
  await page.keyboard.press('Escape');

  await page.close();
}

console.log('=== Desktop ===');
await flow(desktopCtx, 'desktop');
console.log('=== Mobile ===');
await flow(mobileCtx, 'mobile');

await browser.close();
console.log('Done.');
