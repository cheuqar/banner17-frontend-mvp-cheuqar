# Phase 2.18.4: Manual Testing Quick Start

**Estimated Time**: 90 minutes
**Browser**: Google Chrome
**URL**: http://localhost:3301/search
**Test Account**: cheuqar@gmail.com / 123456

---

## Quick Setup (5 minutes)

1. **Start services** (if not already running):
   ```bash
   doppler run --config dev -- docker compose up --build
   ```

2. **Open browser**:
   - Navigate to: `http://localhost:3301/search`
   - Sign in with test account (cheuqar@gmail.com / 123456)

3. **Open DevTools**:
   - Press `F12` (Windows/Linux) or `Cmd+Option+I` (Mac)
   - Click **Console** tab
   - Click **Network** tab (keep both visible)

4. **Create screenshots directory**:
   ```bash
   mkdir -p ./screenshots
   ```

---

## Critical Path Tests (20 minutes)

### Test 1: Initial Load (ZERO ERRORS REQUIRED)
1. Check **Console tab** → Should show 0 red error messages
2. Check **Network tab** → All requests should have 2xx status
3. Take screenshot: `phase-2.18.4-initial-state.png`

✅ **PASS if**: Console clean, Network green, page renders correctly

### Test 2: Inline Filters Button
1. Look at **LeftPanel** (left side)
2. Find "Filters" button at the top (with FilterList icon)
3. Click the "Filters" button
4. Dialog should **pop up in center of screen**
5. Take screenshot: `phase-2.18.4-inline-button-dialog-open.png`

✅ **PASS if**: Dialog opens immediately, centered, shows all 7 filters

### Test 3: Floating Filters Button
1. Click collapse button (ChevronLeft icon) in LeftPanel top-right
2. Panel slides off-screen to the left
3. Look at **top-left corner** of map
4. Should see two white buttons: "42 results >" and "Filters"
5. Click the "Filters" button
6. Same dialog should open
7. Take screenshot: `phase-2.18.4-floating-button-dialog-open.png`

✅ **PASS if**: Floating button opens same FilterDialog

### Test 4: Close Handlers
1. Dialog is still open
2. Press **Escape key** on keyboard
3. Dialog should close immediately
4. Reopen dialog (click Filters button again)
5. Click **X button** in top-right corner
6. Dialog should close immediately

✅ **PASS if**: All close methods work (Escape, X button, backdrop click)

### Test 5: Apply Filters
1. Open dialog (click Filters button)
2. Change a filter (e.g., set bedrooms to "3")
3. Click "Apply Filters" button at bottom
4. Dialog closes, search executes
5. Check **Network tab** → Search API request should show 200 status

✅ **PASS if**: Dialog closes, search runs, no console errors

---

## Extended Tests (40 minutes)

### Test 6: Phase 2.17 Regression Check
1. With panel expanded, click collapse button
2. Animation should be smooth (transform property, no jank)
3. Press Escape key
4. Panel should reopen smoothly
5. Collapse button should still work correctly

✅ **PASS if**: No breaking changes to Phase 2.17 functionality

### Test 7: Responsive Design
1. Press `Cmd+Shift+M` (Mac) or `Ctrl+Shift+M` (Windows) to toggle device toolbar
2. Select "iPhone SE" (375px width)
3. Click Filters button
4. Dialog should fill entire screen (fullScreen mode)
5. Take screenshot: `phase-2.18.4-mobile-375px.png`
6. Set viewport to 1280px (desktop)
7. Click Filters button again
8. Dialog should be centered with maxWidth (not full screen)
9. Take screenshot: `phase-2.18.4-desktop-1280px.png`

✅ **PASS if**: Mobile = fullScreen, Desktop = centered with max width

### Test 8: Console Check
1. Perform all above tests
2. Check **Console tab** one final time
3. Should show **0 red error messages**
4. Warnings (yellow) are acceptable if non-blocking

✅ **PASS if**: Total console errors = 0

### Test 9: Badge Display
1. Apply filters to have active filters
2. Check inline Filters button → should show badge with count
3. Collapse panel
4. Check floating Filters button → should show same badge count
5. Clear filters (open dialog, click "Clear All Filters")
6. Badges should hide

✅ **PASS if**: Badge displays count correctly on both buttons

---

## Edge Cases (Optional, 10 minutes)

### Test 10: Rapid Open/Close
1. Click Filters button 5 times rapidly
2. Open and close dialog quickly 10 times
3. Check Console → 0 errors should still be present
4. Dialog should remain responsive

✅ **PASS if**: No slowdown, no errors

### Test 11: Switch Between Buttons
1. Open dialog from inline button
2. Close dialog
3. Collapse panel
4. Open dialog from floating button
5. Close dialog
6. Expand panel (Escape key)
7. Open dialog from inline button again
8. Check Console → 0 errors

✅ **PASS if**: Both buttons consistently open same dialog

---

## Final Verdict

### PASS Criteria (ALL must be true)
- [ ] Console: 0 red errors
- [ ] Network: All 2xx status codes
- [ ] Inline button opens FilterDialog
- [ ] Floating button opens FilterDialog
- [ ] Both open SAME dialog
- [ ] All 7 filters visible
- [ ] Close handlers work
- [ ] Apply Filters works
- [ ] Responsive: mobile fullScreen, desktop centered
- [ ] Phase 2.17: No regressions
- [ ] Badge displays correctly

### FAIL Criteria (ANY = FAIL)
- [ ] Console has errors
- [ ] Dialog won't open from either button
- [ ] Filters missing or broken
- [ ] Phase 2.17 broken (can't collapse panel)
- [ ] Network has 5xx errors

---

## If You Find Errors

**Format for Documenting Issues**:

```
### Issue #1: Dialog doesn't close on Escape
- **Severity**: Critical
- **Steps to Reproduce**:
  1. Open Filters dialog
  2. Press Escape key
  3. Dialog remains open
- **Expected**: Dialog should close
- **Actual**: Dialog stays open
- **Console Error**: [paste exact error from console]
- **Screenshot**: [filename].png
```

Update: `handoff/features/smart-search/test-cases/phase-2.18.4-qa-report.md`

---

## After Testing Complete

1. **Update QA Report**:
   - Fill in all checkboxes in manual testing checklist
   - List any issues found (expected: 0 issues)
   - Document final verdict (PASS or FAIL)

2. **Commit Documentation**:
   ```bash
   git add screenshots/ handoff/features/smart-search/test-cases/ PHASE-2.18-IMPLEMENTATION-COMPLETE.md
   git commit -m "docs: Phase 2.18.4 - Manual testing complete and passed"
   ```

3. **Final Status**:
   - ✅ PASS: Phase 2.18 ready for production deployment
   - ❌ FAIL: Create bug fixes, retest, then redeploy

---

## Timeline

- **Test 1-5** (Critical Path): 20 minutes
- **Test 6-9** (Extended): 40 minutes
- **Test 10-11** (Edge Cases): 10 minutes
- **Documentation**: 20 minutes
- **Total**: ~90 minutes

**Done?** Phase 2.18 is production-ready! 🚀
