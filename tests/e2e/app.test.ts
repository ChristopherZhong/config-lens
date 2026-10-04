import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
});

test('has title', async ({ page }) => {
  await expect(page).toHaveTitle(/ConfigLens/);
});

test('switching tabs', async ({ page }) => {
  const compareTab = page.locator('.tab', { hasText: 'Compare' });
  await compareTab.click();
  await expect(page.locator('diff-component')).toBeVisible();

  const lintTab = page.locator('.tab', { hasText: 'Lint' });
  await lintTab.click();
  await expect(page.locator('editor-component')).toBeVisible();
});

test('editor visibility', async ({ page }) => {
  const editor = page.locator('editor-component');
  await expect(editor).toBeVisible();
});

test('formatting functionality', async ({ page }) => {
  const formatBtn = page.getByRole('button', { name: 'Format' });
  await expect(formatBtn).toBeVisible();
  await formatBtn.click();
});

test('persistence', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('config-lens-content', '{"persisted": true}'));
  await page.reload();
  await expect(page.locator('editor-component')).toBeVisible();
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
    localStorage.setItem('config-lens-content', json);
  }, largeJson);

  await page.reload();

  const metrics = await page.evaluate(() => {
    const editorComp = document.querySelector('config-lens-app')?.shadowRoot?.querySelector('editor-component');
    const cmScroller = editorComp?.shadowRoot?.querySelector('.cm-scroller');
    const cmEditor = editorComp?.shadowRoot?.querySelector('.cm-editor');
    const app = document.querySelector('config-lens-app');
    return {
      appHeight: app?.clientHeight,
      editorCompHeight: editorComp?.clientHeight,
      cmEditorHeight: cmEditor?.clientHeight,
      scrollerHeight: cmScroller?.clientHeight,
      scrollerScrollHeight: cmScroller?.scrollHeight
    };
  });

  console.log('metrics:', metrics);

  expect(metrics.scrollerScrollHeight).toBeGreaterThan(metrics.scrollerHeight || 0);
});

test('diff component scrolls when content exceeds screen height', async ({ page }) => {
  const largeJson = JSON.stringify(
    Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` })),
    null,
    2
  );

  await page.evaluate((json) => {
    localStorage.setItem('config-lens-content', json);
  }, largeJson);

  await page.reload();

  const compareTab = page.locator('.tab', { hasText: 'Compare' });
  await compareTab.click();

  const isScrollable = await page.evaluate(() => {
    const diffComp = document.querySelector('config-lens-app')?.shadowRoot?.querySelector('diff-component');
    const cmScroller = diffComp?.shadowRoot?.querySelector('.cm-scroller');
    if (!cmScroller) return false;
    return cmScroller.scrollHeight > cmScroller.clientHeight;
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
    localStorage.setItem('config-lens-content', json);
  }, largeJson);

  await page.reload();

  const compareTab = page.locator('.tab', { hasText: 'Compare' });
  await compareTab.click();

  // Scroll side A
  await page.evaluate(() => {
    const diffComp = document.querySelector('config-lens-app')?.shadowRoot?.querySelector('diff-component');
    const scrollers = diffComp?.shadowRoot?.querySelectorAll('.cm-scroller');
    if (scrollers && scrollers.length >= 2) {
      scrollers[0].scrollTop = 300;
      scrollers[0].dispatchEvent(new Event('scroll'));
    }
  });

  // Wait briefly for scroll sync event handler
  await page.waitForTimeout(100);

  const scrollTopB = await page.evaluate(() => {
    const diffComp = document.querySelector('config-lens-app')?.shadowRoot?.querySelector('diff-component');
    const scrollers = diffComp?.shadowRoot?.querySelectorAll('.cm-scroller');
    return scrollers && scrollers.length >= 2 ? scrollers[1].scrollTop : 0;
  });

  expect(scrollTopB).toBeCloseTo(300, -1);

  // Scroll side B
  await page.evaluate(() => {
    const diffComp = document.querySelector('config-lens-app')?.shadowRoot?.querySelector('diff-component');
    const scrollers = diffComp?.shadowRoot?.querySelectorAll('.cm-scroller');
    if (scrollers && scrollers.length >= 2) {
      scrollers[1].scrollTop = 150;
      scrollers[1].dispatchEvent(new Event('scroll'));
    }
  });

  await page.waitForTimeout(100);

  const scrollTopA = await page.evaluate(() => {
    const diffComp = document.querySelector('config-lens-app')?.shadowRoot?.querySelector('diff-component');
    const scrollers = diffComp?.shadowRoot?.querySelectorAll('.cm-scroller');
    return scrollers && scrollers.length >= 2 ? scrollers[0].scrollTop : 0;
  });

  expect(scrollTopA).toBeCloseTo(150, -1);
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
  const compareTab = page.locator('.tab', { hasText: 'Compare' });
  await compareTab.click();

  // Focus and type text into left editor (side A)
  await page.evaluate(() => {
    const diffComp = document.querySelector('config-lens-app')?.shadowRoot?.querySelector('diff-component');
    const scrollers = diffComp?.shadowRoot?.querySelectorAll('.cm-content');
    if (scrollers && scrollers.length >= 1) {
      (scrollers[0] as HTMLElement).focus();
    }
  });

  const editedText = '{"inserted": "left-side-test"}';
  await page.evaluate((text) => {
    const diffComp = document.querySelector('config-lens-app')?.shadowRoot?.querySelector('diff-component');
    // Access CodeMirror view directly or dispatch doc change
    const mergeView = (diffComp as any)?.mergeView;
    if (mergeView?.a) {
      mergeView.a.dispatch({
        changes: { from: 0, to: mergeView.a.state.doc.length, insert: text }
      });
    }
  }, editedText);

  // Check localStorage was updated
  const stored = await page.evaluate(() => localStorage.getItem('config-lens-content'));
  expect(stored).toBe(editedText);

  // Switch back to Lint tab and verify editor content matches
  const lintTab = page.locator('.tab', { hasText: 'Lint' });
  await lintTab.click();

  const editorText = await page.evaluate(() => {
    const editorComp = document.querySelector('config-lens-app')?.shadowRoot?.querySelector('editor-component');
    const editorView = (editorComp as any)?.view;
    return editorView?.state.doc.toString();
  });

  expect(editorText).toBe(editedText);
});

test('property annotations visible in compare view', async ({ page }) => {
  const compareTab = page.locator('.tab', { hasText: 'Compare' });
  await compareTab.click();

  const annotationCount = await page.evaluate(() => {
    const diffComp = document.querySelector('config-lens-app')?.shadowRoot?.querySelector('diff-component');
    const annotations = diffComp?.shadowRoot?.querySelectorAll('.cm-property-annotation');
    return annotations ? annotations.length : 0;
  });

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
  const foldPlaceholdersCount = await page.evaluate(() => {
    const editorComp = document.querySelector('config-lens-app')?.shadowRoot?.querySelector('editor-component');
    return editorComp?.shadowRoot?.querySelectorAll('.cm-foldPlaceholder').length || 0;
  });

  expect(foldPlaceholdersCount).toBeGreaterThan(0);

  // Click Expand All
  await expandBtn.click();
  await page.waitForTimeout(100);

  const foldPlaceholdersCountAfterExpand = await page.evaluate(() => {
    const editorComp = document.querySelector('config-lens-app')?.shadowRoot?.querySelector('editor-component');
    return editorComp?.shadowRoot?.querySelectorAll('.cm-foldPlaceholder').length || 0;
  });

  expect(foldPlaceholdersCountAfterExpand).toBe(0);
});

test('fold all and expand all in compare view', async ({ page }) => {
  const compareTab = page.locator('.tab', { hasText: 'Compare' });
  await compareTab.click();

  const foldBtn = page.getByRole('button', { name: 'Fold All' });
  const expandBtn = page.getByRole('button', { name: 'Expand All' });

  await expect(foldBtn).toBeVisible();
  await expect(expandBtn).toBeVisible();

  // Click Fold All
  await foldBtn.click();
  await page.waitForTimeout(100);

  const foldPlaceholdersCount = await page.evaluate(() => {
    const diffComp = document.querySelector('config-lens-app')?.shadowRoot?.querySelector('diff-component');
    return diffComp?.shadowRoot?.querySelectorAll('.cm-foldPlaceholder').length || 0;
  });

  expect(foldPlaceholdersCount).toBeGreaterThan(0);

  // Click Expand All
  await expandBtn.click();
  await page.waitForTimeout(100);

  const foldPlaceholdersCountAfterExpand = await page.evaluate(() => {
    const diffComp = document.querySelector('config-lens-app')?.shadowRoot?.querySelector('diff-component');
    return diffComp?.shadowRoot?.querySelectorAll('.cm-foldPlaceholder').length || 0;
  });

  expect(foldPlaceholdersCountAfterExpand).toBe(0);
});

test('schema validation highlights error at specific location', async ({ page }) => {
  const jsonWithSchemaError = JSON.stringify(
    {
      $schema: 'https://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        port: { type: 'number' }
      },
      port: 'invalid-string'
    },
    null,
    2
  );

  await page.evaluate((json) => {
    localStorage.setItem('config-lens-content', json);
  }, jsonWithSchemaError);

  await page.reload();

  // Check that lint error marker or underline diagnostic is rendered in the editor
  const hasLintDiagnostics = await page.evaluate(() => {
    const editorComp = document.querySelector('config-lens-app')?.shadowRoot?.querySelector('editor-component');
    const lintMarkers = editorComp?.shadowRoot?.querySelectorAll('.cm-lintRange-error, .cm-lint-marker-error');
    return lintMarkers ? lintMarkers.length : 0;
  });

  expect(hasLintDiagnostics).toBeGreaterThan(0);
});

test('footer displays release version link', async ({ page }) => {
  const versionLink = page.locator('config-lens-app').locator('footer a');
  await expect(versionLink).toBeVisible();
  await expect(versionLink).toHaveText(/^v\d+\.\d+\.\d+/);
  await expect(versionLink).toHaveAttribute('target', '_blank');
  await expect(versionLink).toHaveAttribute('rel', 'noopener noreferrer');
  const href = await versionLink.getAttribute('href');
  expect(href).toMatch(/^https:\/\/github\.com\/ChristopherZhong\/config-lens\/releases\/tag\/v/);
});
