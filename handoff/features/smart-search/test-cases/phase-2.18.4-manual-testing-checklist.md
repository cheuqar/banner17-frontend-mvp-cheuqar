# Phase 2.18.4 Manual Testing Checklist

**Date**: 2025-10-30
**Browser**: Google Chrome
**URL**: http://localhost:3301/search
**Test Account**: cheuqar@gmail.com / 123456
**Status**: IN PROGRESS

## Pre-Testing Setup

- [x] Docker services running: `doppler run --config dev -- docker compose up`
- [x] Browser: Chrome opened at http://localhost:3301/search
- [ ] DevTools opened (F12 or Cmd+Option+I)
- [ ] Console tab visible
- [ ] Network tab visible
- [ ] Screenshots directory created: `./screenshots/`

---

## Test 1: Initial Page Load & Console Check (CRITICAL)

### 1.1 Visual Inspection
- [ ] Page loads successfully
- [ ] LeftPanel visible on left side (350px width)
- [ ] Property panel visible (desktop view)
- [ ] Map visible on right side
- [ ] No blank screens or broken layouts

**Screenshot**: `phase-2.18.4-initial-state.png`

### 1.2 Console Check (CRITICAL - 0 ERRORS REQUIRED)
**DevTools → Console Tab**
- [ ] Zero JavaScript errors (red messages)
- [ ] Document any warnings (yellow messages) - acceptable if non-blocking
- [ ] No React warnings about hooks or props

**If errors found**: Document exact error messages with stack traces

### 1.3 Network Check
**DevTools → Network Tab**
- [ ] All API requests return 2xx status codes
- [ ] No 5xx server errors
- [ ] No 404 not found errors
- [ ] Document any failed requests with status codes

---

## Test 2: Inline Filters Button (LeftPanel)

### 2.1 Locate Button
**Visual Check**:
- [ ] Button visible in top section of LeftPanel
- [ ] Button text: "Filters"
- [ ] FilterList icon visible (three horizontal lines icon)
- [ ] Button styled with outlined variant (border visible)
- [ ] If active filters exist, badge shows count (e.g., "3")

**Screenshot**: `phase-2.18.4-inline-button-visible.png`

### 2.2 Click Inline Filters Button
**Action**: Click the "Filters" button in LeftPanel

**Verify**:
- [ ] FilterDialog opens immediately (no delay)
- [ ] Dialog appears centered on screen
- [ ] Dialog has white background (#fff)
- [ ] Dialog title shows "Filters"
- [ ] Property count displayed (e.g., "42 properties found")
- [ ] Close button (X icon) visible in top-right corner

**Screenshot**: `phase-2.18.4-inline-button-dialog-open.png`

### 2.3 Verify Dialog Content
**Check all 7 filters are visible**:
- [ ] LocationFilter (suburb/state inputs)
- [ ] PriceRangeFilter (price range slider or inputs)
- [ ] BedroomsFilter (bedrooms input/selector)
- [ ] BathroomsFilter (bathrooms input/selector)
- [ ] ParkingFilter (parking input/selector)
- [ ] PropertyTypeFilter (property type checkboxes/chips)
- [ ] ListingTypeFilter (listing type radio/chips)

**Verify Dividers**:
- [ ] Gray dividers (#e5e5e5) between each filter section

**Verify Action Buttons**:
- [ ] "Apply Filters" button visible (black background, white text)
- [ ] Button shows count: "Apply Filters (42)" or similar
- [ ] "Clear All Filters" button visible (if active filters exist)
- [ ] Clear All styled with outlined variant

**Screenshot**: `phase-2.18.4-dialog-content-detailed.png`

### 2.4 Console Check After Dialog Open
**DevTools → Console**
- [ ] Still 0 errors after dialog interaction
- [ ] No new warnings or errors

---

## Test 3: Close Handlers

### 3.1 Test Close Button (X Icon)
**Action**: Click the X icon in dialog title

**Verify**:
- [ ] Dialog closes immediately
- [ ] Returns to normal search page
- [ ] No console errors

**Screenshot**: `phase-2.18.4-close-button-test.png`

### 3.2 Test Backdrop Click
**Action**:
1. Reopen dialog (click "Filters" button again)
2. Click on darkened area outside dialog (backdrop)

**Verify**:
- [ ] Dialog closes on backdrop click
- [ ] Returns to normal search page
- [ ] No console errors

**Screenshot**: `phase-2.18.4-backdrop-click-test.png`

### 3.3 Test Escape Key
**Action**:
1. Reopen dialog (click "Filters" button again)
2. Press Escape key on keyboard

**Verify**:
- [ ] Dialog closes on Escape key press
- [ ] Returns to normal search page
- [ ] No console errors

---

## Test 4: FloatingFiltersButton (Panel Collapsed)

### 4.1 Collapse Property Panel
**Action**: Click the collapse button (ChevronLeft icon) in LeftPanel top-right

**Verify**:
- [ ] Panel slides off-screen to the left (translateX(-100%))
- [ ] Animation is smooth (300ms cubic-bezier transition)
- [ ] Map expands to full width
- [ ] FloatingResultsButton appears at top-left (white button with "{count} results >")
- [ ] FloatingFiltersButton appears at top-left (white button with "Filters")
- [ ] Both buttons have 8px gap between them

**Screenshot**: `phase-2.18.4-panel-collapsed.png`

### 4.2 Verify FloatingFiltersButton Appearance
**Visual Check**:
- [ ] Button visible at top-left corner
- [ ] White background (#fff)
- [ ] Black text (#000)
- [ ] FilterList icon visible
- [ ] Text: "Filters"
- [ ] If active filters exist, badge shows count next to text
- [ ] Subtle shadow visible (0 2px 8px rgba(0,0,0,0.15))

**Screenshot**: `phase-2.18.4-floating-button-appearance.png`

### 4.3 Click FloatingFiltersButton
**Action**: Click the floating "Filters" button at top-left

**Verify**:
- [ ] Same FilterDialog opens (identical to inline button dialog)
- [ ] Dialog centered on screen
- [ ] All 7 filters visible
- [ ] Action buttons visible
- [ ] No console errors

**Screenshot**: `phase-2.18.4-floating-button-dialog-open.png`

### 4.4 Verify Badge Display (If Active Filters)
**If active filters exist**:
- [ ] Badge shows correct count (e.g., "3" for 3 active filters)
- [ ] Badge styled with primary color background
- [ ] Badge positioned next to "Filters" text (inline)

---

## Test 5: Filter Interactions

### 5.1 Change a Filter (Bedrooms Example)
**Action**:
1. Open FilterDialog (any method)
2. Locate BedroomsFilter
3. Change bedrooms value (e.g., set to "3")

**Verify**:
- [ ] Filter input updates correctly
- [ ] No console errors during interaction
- [ ] Dialog remains open

**Screenshot**: `phase-2.18.4-filter-changed-bedrooms.png`

### 5.2 Click Apply Filters Button
**Action**: Click "Apply Filters" button at bottom of dialog

**Verify**:
- [ ] Dialog closes immediately
- [ ] Search executes (loading state may appear briefly)
- [ ] Property list updates (if panel visible)
- [ ] Map updates (if properties visible)
- [ ] Console still has 0 errors
- [ ] Network tab shows search API request (200 status)

**Screenshot**: `phase-2.18.4-after-apply.png`

### 5.3 Verify Active Filter Badge Updates
**After applying filters**:
- [ ] Inline button badge shows updated count
- [ ] Floating button badge shows updated count (if panel collapsed)

### 5.4 Test Clear All Filters
**Action**:
1. Reopen FilterDialog
2. Click "Clear All Filters" button

**Verify**:
- [ ] All filters reset to default values (empty/zero)
- [ ] "Clear All Filters" button hides (no active filters)
- [ ] Apply Filters button still visible
- [ ] Badge on buttons updates/hides
- [ ] No console errors

**Screenshot**: `phase-2.18.4-after-clear.png`

---

## Test 6: Responsive Testing

### 6.1 Test Mobile (375px width)
**Action**:
1. Open DevTools
2. Toggle device toolbar (Cmd+Shift+M or Ctrl+Shift+M)
3. Select "iPhone SE" or set custom 375x667

**Verify Initial State**:
- [ ] Property panel always visible (cannot collapse on mobile)
- [ ] Inline "Filters" button visible in LeftPanel
- [ ] FloatingFiltersButton NOT visible (panel always visible)
- [ ] Collapse button (ChevronLeft) hidden
- [ ] Map may be hidden or minimized (acceptable)

**Screenshot**: `phase-2.18.4-mobile-375px.png`

### 6.2 Open Dialog on Mobile
**Action**: Click inline "Filters" button

**Verify**:
- [ ] Dialog opens in fullScreen mode (100% width, 100% height)
- [ ] Dialog covers entire screen
- [ ] All 7 filters visible and scrollable
- [ ] Action buttons visible at bottom
- [ ] Close button visible at top-right
- [ ] Dialog is vertically scrollable if content exceeds viewport

**Screenshot**: `phase-2.18.4-mobile-dialog-fullscreen.png`

### 6.3 Test Tablet (768px width)
**Action**: Set viewport to 768x1024 (iPad)

**Verify**:
- [ ] Same behavior as mobile (panel always visible)
- [ ] Dialog fullScreen on mobile/tablet
- [ ] Collapse button hidden (<1024px)

**Screenshot**: `phase-2.18.4-tablet-768px.png`

### 6.4 Test Desktop (1280px width)
**Action**: Set viewport to 1280x720 (desktop)

**Verify**:
- [ ] Panel collapsible (collapse button visible)
- [ ] Dialog centered with maxWidth="sm" (600px max)
- [ ] Dialog does NOT fill entire screen
- [ ] FloatingFiltersButton appears when panel collapsed
- [ ] Collapse button visible in LeftPanel

**Screenshot**: `phase-2.18.4-desktop-1280px.png`

---

## Test 7: Phase 2.17 Regression Testing

### 7.1 Test Panel Collapse Animation
**Action**:
1. Desktop viewport (1280px)
2. Click collapse button (ChevronLeft icon)
3. Observe animation

**Verify**:
- [ ] Panel slides off-screen smoothly (no jank)
- [ ] Animation duration: ~300ms
- [ ] Map expands smoothly to fill space
- [ ] No visual glitches or jumping
- [ ] GPU-accelerated (transform property, not left/margin)

**Screenshot**: `phase-2.18.4-panel-collapse-animation.png`

### 7.2 Test FloatingResultsButton + FloatingFiltersButton Together
**Action**: With panel collapsed, observe both buttons

**Verify**:
- [ ] Both buttons appear at top-left corner
- [ ] 8px gap between buttons (flexbox gap: 1)
- [ ] Results button shows "{count} results >"
- [ ] Filters button shows "Filters" (with badge if filters exist)
- [ ] Both buttons have same styling (white background, shadow)
- [ ] No overlap or layout issues

**Screenshot**: `phase-2.18.4-floating-buttons-together.png`

### 7.3 Test Escape Key Panel Close
**Action**:
1. Desktop viewport with panel collapsed
2. Press Escape key

**Verify**:
- [ ] Panel reopens (slides back in from left)
- [ ] Animation smooth
- [ ] FloatingFiltersButton hides
- [ ] FloatingResultsButton hides
- [ ] No console errors

**Screenshot**: `phase-2.18.4-escape-key-panel-reopen.png`

### 7.4 Verify No Phase 2.17 Regressions
**Check Phase 2.17 features still work**:
- [ ] Panel collapse/expand works correctly
- [ ] FloatingResultsButton still appears when panel collapsed
- [ ] Escape key still reopens panel
- [ ] Panel slide animation still smooth
- [ ] No layout shifts or broken styles

---

## Test 8: Console & Network Final Check

### 8.1 Final Console Check
**DevTools → Console**
- [ ] Total errors: 0 (CRITICAL REQUIREMENT)
- [ ] Warnings: [list any warnings, acceptable if non-blocking]
- [ ] No React warnings about hooks, props, or memory leaks

**If errors found**: Document exact error messages

### 8.2 Final Network Check
**DevTools → Network Tab**
- [ ] All requests return 2xx status (200, 201, 204)
- [ ] No 5xx server errors (500, 502, 503)
- [ ] No 4xx client errors (404, 403) except expected auth checks
- [ ] Search API requests complete successfully

**If errors found**: Document failed requests with status codes

### 8.3 Final Screenshot
**Action**: Take final screenshot of working state

**Screenshot**: `phase-2.18.4-final-state.png`

---

## Test 9: Edge Cases & Stress Testing

### 9.1 Rapid Dialog Open/Close
**Action**:
1. Rapidly click "Filters" button multiple times
2. Open and close dialog 5-10 times quickly

**Verify**:
- [ ] Dialog opens/closes consistently
- [ ] No memory leaks or slowdown
- [ ] No console errors
- [ ] Animation remains smooth

### 9.2 Switch Between Inline and Floating Buttons
**Action**:
1. Open dialog from inline button → close
2. Collapse panel
3. Open dialog from floating button → close
4. Expand panel (Escape key)
5. Open dialog from inline button again

**Verify**:
- [ ] Both buttons open same dialog consistently
- [ ] No state inconsistencies
- [ ] No console errors

### 9.3 Apply Filters Without Changes
**Action**:
1. Open dialog
2. Don't change any filters
3. Click "Apply Filters"

**Verify**:
- [ ] Dialog closes
- [ ] No unnecessary API calls (check Network tab)
- [ ] No console errors

### 9.4 Clear Filters When Already Clear
**Action**:
1. Clear all filters
2. Reopen dialog
3. Click "Clear All Filters" again

**Verify**:
- [ ] "Clear All Filters" button should be hidden (no active filters)
- [ ] If visible and clicked, no errors occur

---

## Summary Checklist

### PASS Criteria (ALL must be true)
- [ ] Console: 0 errors (warnings acceptable)
- [ ] Network: All 2xx status (no 5xx errors)
- [ ] Inline button opens FilterDialog correctly
- [ ] Floating button opens FilterDialog correctly
- [ ] Both buttons open SAME dialog (verified visually)
- [ ] All 7 filters render in dialog
- [ ] Close handlers work (button, backdrop, Escape)
- [ ] Apply Filters executes search and closes dialog
- [ ] Clear All Filters resets filters
- [ ] Responsive: fullScreen on mobile, centered on desktop
- [ ] Phase 2.17 regression: Panel collapse works, no breaking changes

### FAIL Criteria (ANY of these = FAIL)
- [ ] Console has errors (excluding warnings)
- [ ] Network has 5xx errors
- [ ] Dialog doesn't open from either button
- [ ] Filters don't work correctly
- [ ] Phase 2.17 functionality broken
- [ ] Visual rendering broken

---

## Issues Found

_Document any issues discovered during testing with severity ratings:_

### Issue Format:
```
### Issue #1: [Title]
- **Severity**: [Critical/High/Medium/Low]
- **Component**: [FilterDialog/LeftPanel/FloatingFiltersButton]
- **Description**: [Detailed description]
- **Reproduction Steps**:
  1. [Step 1]
  2. [Step 2]
  3. [Step 3]
- **Screenshot**: [filename]
- **Expected**: [Expected behavior]
- **Actual**: [Actual behavior]
- **Console Error**: [Exact error message if applicable]
- **Fix Required**: [Suggested fix or next steps]
```

---

## Test Execution Log

**Start Time**: [HH:MM]
**End Time**: [HH:MM]
**Total Duration**: [X minutes]
**Tester**: QA Specialist Agent
**Browser**: Chrome [version]
**Viewport Sizes Tested**: 375px, 768px, 1280px
**Total Screenshots**: [count]

---

## Final Verdict

**Status**: [✅ PASS / ❌ FAIL / ⚠️ PARTIAL PASS]

**Reasoning**: [Detailed explanation]

**Phase 2.18 Status**: [100% COMPLETE / BLOCKED / NEEDS FIXES]

**Next Steps**:
1. [Next step 1]
2. [Next step 2]
3. [Next step 3]
