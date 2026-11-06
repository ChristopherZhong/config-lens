import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
});

test('has title', async ({ page }) => {
  await expect(page).toHaveTitle(/ConfigLens/);
});

test('expanding and collapsing the compare panel', async ({ page }) => {
  const compareToggle = page.getByRole('button', { name: 'Expand compare panel' });
  const modifiedEditor = page.locator('diff-component .cm-merge-b .cm-content');

  await expect(modifiedEditor).not.toBeVisible();
  await compareToggle.click();
  await expect(modifiedEditor).toBeVisible();
  await expect(page.getByRole('button', { name: 'Collapse compare panel' })).toHaveAttribute('aria-expanded', 'true');
});

test('editor visibility', async ({ page }) => {
  const editor = page.locator('diff-component .cm-merge-a .cm-content');
  await expect(editor).toBeVisible();
});

test('formatting functionality', async ({ page }) => {
  const formatBtn = page.getByRole('button', { name: 'Format' });
  await expect(formatBtn).toBeVisible();
  await formatBtn.click();
});

test('persistence', async ({ page }) => {
  const persistedContent = '{"persisted": true}';
  await page.evaluate((content) => localStorage.setItem('config-lens-content-json', content), persistedContent);
  await page.reload();
  await expect(page.locator('diff-component .cm-merge-a .cm-content')).toContainText('persisted');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('config-lens-content-json'))).toBe(persistedContent);
});

test('favicons and manifest link tags exist', async ({ page }) => {
  const svgIcon = page.locator('link[rel="icon"][type="image/svg+xml"]');
  await expect(svgIcon).toHaveAttribute('href', './favicon.svg');

  const manifest = page.locator('link[rel="manifest"]');
  await expect(manifest).toHaveAttribute('href', './site.webmanifest');
});

test('editor scrolls when content exceeds screen height', async ({ page }) => {
  // Generate large JSON content (100 lines)
  const largeJson = JSON.stringify(
    Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` })),
    null,
    2
  );

  await page.evaluate((json) => {
    localStorage.setItem('config-lens-content-json', json);
  }, largeJson);

  await page.reload();

  const scroller = page.locator('diff-component .cm-merge-a .cm-scroller');
  await expect(scroller).toBeVisible();

  const metrics = await scroller.evaluate((element) => ({
    clientHeight: (element as HTMLElement).clientHeight,
    scrollHeight: (element as HTMLElement).scrollHeight
  }));

  expect(metrics.scrollHeight).toBeGreaterThan(metrics.clientHeight);
});

test('diff component scrolls when content exceeds screen height', async ({ page }) => {
  const largeJson = JSON.stringify(
    Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` })),
    null,
    2
  );

  await page.evaluate((json) => {
    localStorage.setItem('config-lens-content-json', json);
  }, largeJson);

  await page.reload();

  await page.getByRole('button', { name: 'Expand compare panel' }).click();

  const scroller = page.locator('diff-component .cm-merge-a .cm-scroller');
  const isScrollable = await scroller.evaluate((element) => {
    const scrollElement = element as HTMLElement;
    return scrollElement.scrollHeight > scrollElement.clientHeight;
  });

  expect(isScrollable).toBe(true);
});

test('diff component scroll is synchronized between side A and side B', async ({ page }) => {
  const largeJson = JSON.stringify(
    Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` })),
    null,
    2
  );

  await page.evaluate((json) => {
    localStorage.setItem('config-lens-content-json', json);
  }, largeJson);

  await page.reload();

  await page.getByRole('button', { name: 'Expand compare panel' }).click();

  const scrollerA = page.locator('diff-component .cm-merge-a .cm-scroller');
  const scrollerB = page.locator('diff-component .cm-merge-b .cm-scroller');
  await scrollerA.evaluate((element) => {
    const scroller = element as HTMLElement;
    scroller.scrollTop = 300;
    scroller.dispatchEvent(new Event('scroll'));
  });

  await expect.poll(() => scrollerB.evaluate((element) => (element as HTMLElement).scrollTop)).toBeCloseTo(300, -1);
  await page.waitForTimeout(60);

  await scrollerB.evaluate((element) => {
    const scroller = element as HTMLElement;
    scroller.scrollTop = 150;
    scroller.dispatchEvent(new Event('scroll'));
  });

  await expect.poll(() => scrollerA.evaluate((element) => (element as HTMLElement).scrollTop)).toBeCloseTo(150, -1);
});

test('theme toggle', async ({ page }) => {
  const themeToggle = page.locator('.theme-toggle');
  await expect(themeToggle).toBeVisible();

  const lightBtn = page.getByRole('radio', { name: 'Light Theme' });
  const darkBtn = page.getByRole('radio', { name: 'Dark Theme' });
  const systemBtn = page.getByRole('radio', { name: 'System Theme' });

  // Click Light
  await lightBtn.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  // Click Dark
  await darkBtn.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  // Click System
  await systemBtn.click();
  // Resolved theme for system might be light or dark, but data-theme attribute should reflect it.
  const theme = await page.locator('html').getAttribute('data-theme');
  expect(['light', 'dark']).toContain(theme);

  // Check persistence
  await darkBtn.click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('editing text in left view of compare window updates state and persists', async ({ page }) => {
  const originalEditor = page.locator('diff-component .cm-merge-a .cm-content');

  const editedText = '{"inserted": "left-side-test"}';
  await originalEditor.fill(editedText);

  const stored = await page.evaluate(() => localStorage.getItem('config-lens-content-json'));
  expect(stored).toBe(editedText);
  await expect(originalEditor).toContainText('left-side-test');
});

test('property annotations visible in compare view', async ({ page }) => {
  const annotationCount = await page.locator('diff-component .cm-property-annotation').count();

  expect(annotationCount).toBeGreaterThan(0);
});

test('fold all and expand all in lint editor', async ({ page }) => {
  const foldBtn = page.getByRole('button', { name: 'Fold All' });
  const expandBtn = page.getByRole('button', { name: 'Expand All' });

  await expect(foldBtn).toBeVisible();
  await expect(expandBtn).toBeVisible();

  // Click Fold All
  await foldBtn.click();
  await page.waitForTimeout(100);

  // Check if folded placeholders exist
  const foldPlaceholders = page.locator('diff-component .cm-foldPlaceholder');

  await expect(foldPlaceholders).not.toHaveCount(0);

  // Click Expand All
  await expandBtn.click();
  await page.waitForTimeout(100);

  await expect(foldPlaceholders).toHaveCount(0);
});

test('fold all and expand all in compare view', async ({ page }) => {
  await page.getByRole('button', { name: 'Expand compare panel' }).click();

  const foldBtn = page.getByRole('button', { name: 'Fold All' });
  const expandBtn = page.getByRole('button', { name: 'Expand All' });

  await expect(foldBtn).toBeVisible();
  await expect(expandBtn).toBeVisible();

  // Click Fold All
  await foldBtn.click();
  await page.waitForTimeout(100);

  const foldPlaceholders = page.locator('diff-component .cm-foldPlaceholder');

  await expect(foldPlaceholders).not.toHaveCount(0);

  // Click Expand All
  await expandBtn.click();
  await page.waitForTimeout(100);

  await expect(foldPlaceholders).toHaveCount(0);
});

test('schema validation highlights error at specific location', async ({ page }) => {
  const invalidJson = '{\n  "name": "config-lens",\n  "version":\n}';

  await page.evaluate((json) => {
    localStorage.setItem('config-lens-content-json', json);
  }, invalidJson);

  await page.reload();

  const lintMarkers = page.locator('diff-component .cm-gutter-lint .cm-lint-marker, diff-component .cm-lintRange-error');
  await expect(lintMarkers.first()).toBeVisible();
});

test('footer displays release version link', async ({ page }) => {
  const versionLink = page.getByRole('link', { name: /Version v\d+\.\d+\.\d+/ });
  await expect(versionLink).toBeVisible();
  await expect(versionLink).toHaveText(/^v\d+\.\d+\.\d+/);
  await expect(versionLink).toHaveAttribute('target', '_blank');
  await expect(versionLink).toHaveAttribute('rel', 'noopener noreferrer');
  const href = await versionLink.getAttribute('href');
  expect(href).toMatch(/^https:\/\/github\.com\/ChristopherZhong\/tools\/releases\/tag\/v/);
});
