# Phase 2.18.4 Manual Browser QA Instructions

**⚠️ IMPORTANT: Chrome DevTools MCP Not Available**

Since automated browser testing via Chrome DevTools MCP is not currently available, this QA test requires **manual browser testing** with careful documentation.

## Quick Start

1. **Open Testing Checklist**: `/Users/cheuqarli/Projects/listez-chatbot-app/chatbot-app/handoff/features/smart-search/test-cases/phase-2.18.4-manual-testing-checklist.md`

2. **Open Chrome Browser**: http://localhost:3301/search

3. **Open DevTools**: Press F12 (Windows/Linux) or Cmd+Option+I (Mac)

4. **Follow Checklist**: Execute all tests in order, checking boxes as you complete each item

5. **Take Screenshots**: Save screenshots to `./screenshots/` directory with exact filenames from checklist

6. **Document Issues**: Add any issues found to the "Issues Found" section of checklist

---

## Testing Workflow

### Step 1: Pre-Testing Setup (5 minutes)

```bash
# Verify Docker services are running
docker ps | grep chatbot-app

# If not running, start services
doppler run --config dev -- docker compose up

# Create screenshots directory
mkdir -p /Users/cheuqarli/Projects/listez-chatbot-app/chatbot-app/screenshots
```

### Step 2: Open Browser & DevTools (2 minutes)

1. Open Google Chrome
2. Navigate to: http://localhost:3301/search
3. Open DevTools:
   - Mac: `Cmd + Option + I`
   - Windows/Linux: `F12`
4. Click "Console" tab
5. Click "Network" tab (have both visible)

### Step 3: Execute Test Checklist (60 minutes)

Open the checklist file and work through it systematically:
```bash
# Open in your text editor
code /Users/cheuqarli/Projects/listez-chatbot-app/chatbot-app/handoff/features/smart-search/test-cases/phase-2.18.4-manual-testing-checklist.md
```

**Execute in order**:
1. Test 1: Initial Page Load & Console Check
2. Test 2: Inline Filters Button (LeftPanel)
3. Test 3: Close Handlers
4. Test 4: FloatingFiltersButton (Panel Collapsed)
5. Test 5: Filter Interactions
6. Test 6: Responsive Testing
7. Test 7: Phase 2.17 Regression Testing
8. Test 8: Console & Network Final Check
9. Test 9: Edge Cases & Stress Testing

### Step 4: Screenshot Capture (Throughout Testing)

**How to Take Screenshots**:

**Mac**:
- Full screen: `Cmd + Shift + 3`
- Selection: `Cmd + Shift + 4`
- Screenshots save to Desktop by default

**Windows**:
- Full screen: `PrtScn` (Print Screen)
- Selection: `Win + Shift + S` (Snipping Tool)

**Save screenshots to**: `./screenshots/` with exact filenames from checklist

**Required Screenshots** (14 minimum):
1. `phase-2.18.4-initial-state.png`
2. `phase-2.18.4-inline-button-visible.png`
3. `phase-2.18.4-inline-button-dialog-open.png`
4. `phase-2.18.4-dialog-content-detailed.png`
5. `phase-2.18.4-close-button-test.png`
6. `phase-2.18.4-backdrop-click-test.png`
7. `phase-2.18.4-panel-collapsed.png`
8. `phase-2.18.4-floating-button-appearance.png`
9. `phase-2.18.4-floating-button-dialog-open.png`
10. `phase-2.18.4-filter-changed-bedrooms.png`
11. `phase-2.18.4-after-apply.png`
12. `phase-2.18.4-after-clear.png`
13. `phase-2.18.4-mobile-375px.png`
14. `phase-2.18.4-mobile-dialog-fullscreen.png`
15. `phase-2.18.4-tablet-768px.png`
16. `phase-2.18.4-desktop-1280px.png`
17. `phase-2.18.4-panel-collapse-animation.png`
18. `phase-2.18.4-floating-buttons-together.png`
19. `phase-2.18.4-escape-key-panel-reopen.png`
20. `phase-2.18.4-final-state.png`

### Step 5: Document Issues (As Found)

**If you find an issue**:

1. Add it to the "Issues Found" section of checklist
2. Include:
   - Severity (Critical/High/Medium/Low)
   - Component name
   - Detailed description
   - Reproduction steps (numbered)
   - Screenshot filename
   - Expected vs actual behavior
   - Console error (if applicable)

**Issue Template**:
```markdown
### Issue #1: [Title]
- **Severity**: [Critical/High/Medium/Low]
- **Component**: [FilterDialog/LeftPanel/FloatingFiltersButton]
- **Description**: [Detailed description]
- **Reproduction Steps**:
  1. [Step 1]
  2. [Step 2]
  3. [Step 3]
- **Screenshot**: `phase-2.18.4-issue-1.png`
- **Expected**: [Expected behavior]
- **Actual**: [Actual behavior]
- **Console Error**: [Exact error message if applicable]
- **Fix Required**: [Suggested fix or next steps]
```

### Step 6: Create Final QA Report (20 minutes)

After completing all tests, create the final QA report:

```bash
# Create QA report from template
cp /Users/cheuqarli/Projects/listez-chatbot-app/chatbot-app/handoff/features/smart-search/test-cases/phase-2.18.4-manual-testing-checklist.md \
   /Users/cheuqarli/Projects/listez-chatbot-app/chatbot-app/handoff/features/smart-search/test-cases/phase-2.18.4-qa-report.md
```

**Update QA report with**:
1. Fill in all checkboxes (✅ or ❌)
2. Add all issue descriptions
3. Add test execution log (start/end times)
4. Add final verdict (PASS/FAIL/PARTIAL PASS)
5. Add next steps

---

## Critical Success Criteria

### ✅ PASS if ALL of these are true:

- **Console**: 0 errors (warnings acceptable if non-blocking)
- **Network**: All 2xx status codes (no 5xx errors)
- **Inline Button**: Opens FilterDialog correctly
- **Floating Button**: Opens FilterDialog correctly (when panel collapsed)
- **Same Dialog**: Both buttons open identical dialog
- **All Filters**: 7 filters render correctly in dialog
- **Close Handlers**: Button, backdrop, and Escape key all close dialog
- **Apply Filters**: Executes search and closes dialog
- **Clear All**: Resets filters correctly
- **Responsive**: fullScreen on mobile (<600px), centered on desktop (≥600px)
- **Phase 2.17**: No regressions (panel collapse, floating buttons, Escape key)

### ❌ FAIL if ANY of these are true:

- Console has JavaScript errors (excluding warnings)
- Network has 5xx server errors
- Dialog doesn't open from either button
- Filters don't work correctly
- Phase 2.17 functionality broken
- Visual rendering broken

---

## Common Issues to Watch For

### Console Errors
- React warnings about missing keys or props
- Redux state update warnings
- Hook dependency warnings
- Uncaught errors in event handlers

### Visual Issues
- Dialog not centered on desktop
- Dialog not fullScreen on mobile
- Filters not aligned or styled correctly
- Buttons missing icons or text
- Badge not displaying correctly

### Interaction Issues
- Dialog doesn't close on backdrop click
- Escape key doesn't work
- Apply button doesn't execute search
- Clear All doesn't reset filters
- Panel collapse animation janky or broken

### Responsive Issues
- Dialog too wide on mobile
- Collapse button visible on mobile/tablet (<1024px)
- FloatingFiltersButton visible when panel is visible
- Layout breaks at specific viewport sizes

---

## Tips for Effective Manual Testing

1. **Test Systematically**: Don't skip steps, follow checklist order
2. **Check Console After Every Interaction**: Errors may appear after clicks
3. **Take Screenshots Immediately**: Don't wait until end of testing
4. **Document Everything**: If you see something weird, document it
5. **Test Edge Cases**: Rapid clicks, multiple opens/closes, etc.
6. **Use Multiple Viewport Sizes**: 375px, 768px, 1280px minimum
7. **Clear Browser Cache**: If behavior seems inconsistent
8. **Reload Page Between Major Tests**: Ensures clean state

---

## Responsive Testing Setup

### Using Chrome DevTools Device Toolbar

1. Open DevTools (F12 or Cmd+Option+I)
2. Click "Toggle Device Toolbar" icon (or Cmd+Shift+M / Ctrl+Shift+M)
3. Select device from dropdown or enter custom dimensions:
   - **Mobile**: 375 x 667 (iPhone SE)
   - **Tablet**: 768 x 1024 (iPad)
   - **Desktop**: 1280 x 720 (standard laptop)
4. Take screenshots at each size

### Manual Resize (Alternative)

1. Open browser window
2. Resize window by dragging edges
3. Use DevTools to see current viewport size (shows in device toolbar)

---

## Post-Testing Actions

After completing all tests:

1. **Update Checklist**: Ensure all checkboxes are marked
2. **Create QA Report**: Copy checklist to `phase-2.18.4-qa-report.md`
3. **Organize Screenshots**: Verify all screenshots saved correctly
4. **Update qa.MD**: Add Phase 2.18.4 entry to main QA dashboard
5. **Commit Documentation**:
   ```bash
   git add handoff/features/smart-search/test-cases/
   git add screenshots/
   git commit -m "qa: phase-2.18.4 - manual browser testing complete"
   ```

---

## Need Help?

**If you encounter issues**:

1. Check Docker logs: `docker compose logs chatbot-app`
2. Verify services running: `docker ps`
3. Check browser console for detailed error messages
4. Try clearing browser cache: Chrome → Settings → Privacy → Clear browsing data
5. Restart Docker services: `docker compose down && doppler run --config dev -- docker compose up`

**If testing cannot be completed**:

Document why in the QA report under "Blockers" section and mark status as "BLOCKED"

---

## Time Estimate

- **Setup**: 5 minutes
- **Test Execution**: 60 minutes
- **Screenshot Review**: 10 minutes
- **Report Creation**: 20 minutes
- **Total**: ~90 minutes

---

**Good luck with testing! Follow the checklist systematically and document everything.** 🚀
