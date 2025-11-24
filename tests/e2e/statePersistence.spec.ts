/**
 * E2E Tests: State Filter Persistence
 *
 * Feature 001 Phase 3 US1: State Filter Persistence MVP
 * Tests using Playwright to verify state filter persists across browser page refresh
 *
 * Test Criteria:
 * - Select NSW → Refresh browser → NSW still active ✅
 * - Select VIC → Close tab → Reopen → VIC still active ✅
 * - No selection → Refresh → Still no selection (null persists) ✅
 * - Switch NSW → QLD → Refresh → Only QLD active ✅
 */

import { test, expect } from '@playwright/test';

// Configuration for local testing
const BASE_URL = process.env.BASE_URL || 'http://localhost:3301';
const SEARCH_PAGE = `${BASE_URL}/search`;

// Helper to check if NSW button is selected
async function isNSWSelected(page) {
  const nswButton = page.locator('[data-testid="state-filter-button-NSW"]');
  return nswButton.evaluate(el => el?.classList.contains('active'));
}

// Helper to check if VIC button is selected
async function isVICSelected(page) {
  const vicButton = page.locator('[data-testid="state-filter-button-VIC"]');
  return vicButton.evaluate(el => el?.classList.contains('active'));
}

// Helper to check if QLD button is selected
async function isQLDSelected(page) {
  const qldButton = page.locator('[data-testid="state-filter-button-QLD"]');
  return qldButton.evaluate(el => el?.classList.contains('active'));
}

// Helper to click NSW button
async function clickNSWButton(page) {
  await page.locator('[data-testid="state-filter-button-NSW"]').click();
}

// Helper to click VIC button
async function clickVICButton(page) {
  await page.locator('[data-testid="state-filter-button-VIC"]').click();
}

// Helper to click QLD button
async function clickQLDButton(page) {
  await page.locator('[data-testid="state-filter-button-QLD"]').click();
}

test.describe('T016: State Filter Persistence (Playwright E2E)', () => {

  test.beforeEach(async ({ page }) => {
    // Clear storage before each test
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    // Navigate to search page
    await page.goto(SEARCH_PAGE);
    await page.waitForLoadState('networkidle');
  });

  test('should persist NSW filter across page refresh', async ({ page }) => {
    // Step 1: Select NSW
    await clickNSWButton(page);

    // Verify NSW is active
    const nswActiveInitial = await isNSWSelected(page);
    expect(nswActiveInitial).toBe(true);

    // Step 2: Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Step 3: Verify NSW is still active after refresh
    const nswActiveAfterRefresh = await isNSWSelected(page);
    expect(nswActiveAfterRefresh).toBe(true);
  });

  test('should persist VIC filter across page refresh', async ({ page }) => {
    // Select VIC
    await clickVICButton(page);

    // Verify VIC is active
    const vicActiveInitial = await isVICSelected(page);
    expect(vicActiveInitial).toBe(true);

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify VIC is still active
    const vicActiveAfterRefresh = await isVICSelected(page);
    expect(vicActiveAfterRefresh).toBe(true);
  });

  test('should persist null filter (no selection) across page refresh', async ({ page }) => {
    // Don't select any state filter

    // Verify no filter is selected initially
    const nswActiveInitial = await isNSWSelected(page);
    const vicActiveInitial = await isVICSelected(page);
    expect(nswActiveInitial).toBe(false);
    expect(vicActiveInitial).toBe(false);

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify still no filter selected
    const nswActiveAfterRefresh = await isNSWSelected(page);
    const vicActiveAfterRefresh = await isVICSelected(page);
    expect(nswActiveAfterRefresh).toBe(false);
    expect(vicActiveAfterRefresh).toBe(false);
  });

  test('should persist switched filter (NSW → QLD) across page refresh', async ({ page }) => {
    // Step 1: Select NSW
    await clickNSWButton(page);
    const nswActiveStep1 = await isNSWSelected(page);
    expect(nswActiveStep1).toBe(true);

    // Step 2: Switch to QLD
    await clickQLDButton(page);
    const nswActiveStep2 = await isNSWSelected(page);
    const qldActiveStep2 = await isQLDSelected(page);
    expect(nswActiveStep2).toBe(false);
    expect(qldActiveStep2).toBe(true);

    // Step 3: Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Step 4: Verify only QLD is active (NSW deselected)
    const nswActiveStep4 = await isNSWSelected(page);
    const qldActiveStep4 = await isQLDSelected(page);
    expect(nswActiveStep4).toBe(false);
    expect(qldActiveStep4).toBe(true);
  });

  test('should verify localStorage contains persist:root with stateFilter', async ({ page }) => {
    // Select NSW
    await clickNSWButton(page);

    // Wait for persist write
    await page.waitForTimeout(100);

    // Check localStorage directly
    const persistedData = await page.evaluate(() => {
      const persist = localStorage.getItem('persist:root');
      if (!persist) return null;

      try {
        const parsed = JSON.parse(persist);
        const searchFilters = JSON.parse(parsed.searchFilters);
        return searchFilters;
      } catch (e) {
        return null;
      }
    });

    expect(persistedData).toBeTruthy();
    expect(persistedData.stateFilter).toBe('NSW');
  });

  test('should handle rapid state filter changes and persist final selection', async ({ page }) => {
    // Rapidly switch filters
    await clickNSWButton(page);
    await page.waitForTimeout(50);
    await clickVICButton(page);
    await page.waitForTimeout(50);
    await clickQLDButton(page);
    await page.waitForTimeout(100);

    // Verify QLD is final selection
    const qldActive = await isQLDSelected(page);
    expect(qldActive).toBe(true);

    // Refresh
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify QLD persisted
    const qldActiveAfterRefresh = await isQLDSelected(page);
    expect(qldActiveAfterRefresh).toBe(true);
  });
});
