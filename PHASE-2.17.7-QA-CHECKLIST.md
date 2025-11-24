# Phase 2.17.7: Browser QA & Polish - Testing Checklist

## Overview
Comprehensive QA testing for Phase 2.17 collapsible property panel feature with responsive behavior.

## Testing Environment Setup

### 1. Start Development Server
```bash
cd /Users/cheuqarli/Projects/listez-chatbot-app
doppler run --config dev -- docker compose up --build
```

### 2. Access Smart Search
- URL: `http://localhost:3301/smart-search`
- Login: `cheuqar@gmail.com` / `123456`

### 3. Chrome DevTools Setup
- Open Chrome DevTools (F12)
- Click "Toggle device toolbar" (Ctrl+Shift+M)
- Select "Responsive" mode
- Enable "Show media queries" in DevTools settings

---

## Test Suite 1: Mobile Behavior (375px)

### Setup
- Set viewport: 375px × 667px (iPhone SE)
- Orientation: Portrait

### Test Cases

#### TC-M1: Collapse Button Hidden
- [ ] Collapse button (ChevronLeft icon) NOT visible in top controls
- [ ] Only "Filters" toggle button visible
- [ ] No tooltip appears (button completely hidden)

#### TC-M2: Panel Always Visible
- [ ] Property list panel always visible on left side
- [ ] Panel width: 350px
- [ ] Panel content scrollable
- [ ] Filters section collapsible (via "Filters" button)

#### TC-M3: Floating Controls Hidden
- [ ] No "X results >" button on map
- [ ] No "Filters" button on map
- [ ] Map fills remaining space
- [ ] Map controls (zoom, etc.) visible

#### TC-M4: Functionality Intact
- [ ] Filters work correctly
- [ ] Property list displays
- [ ] Map markers visible
- [ ] Property cards clickable
- [ ] Filter apply/clear buttons work

### Expected Behavior
✅ Panel locked open, no collapse functionality visible, full feature access.

---

## Test Suite 2: Tablet Behavior (768px)

### Setup
- Set viewport: 768px × 1024px (iPad)
- Orientation: Portrait

### Test Cases

#### TC-T1: Collapse Button Hidden
- [ ] Collapse button NOT visible in top controls
- [ ] Behavior identical to mobile (375px)

#### TC-T2: Panel Always Visible
- [ ] Property list panel always visible
- [ ] Panel width: 350px
- [ ] Layout appropriate for tablet size

#### TC-T3: Floating Controls Hidden
- [ ] No floating buttons visible on map
- [ ] Map layout adjusts to tablet size

#### TC-T4: Landscape Mode
- [ ] Rotate to landscape (1024px × 768px)
- [ ] Collapse button should appear (≥1024px)
- [ ] Floating controls functional when panel collapsed

### Expected Behavior
✅ Portrait: Same as mobile. Landscape (1024px): Desktop behavior.

---

## Test Suite 3: Breakpoint Boundary (1023px vs 1024px)

### Setup
- Precise viewport control via DevTools

### Test Cases

#### TC-B1: 1023px Width
- [ ] Set viewport: 1023px × 800px
- [ ] Collapse button NOT visible
- [ ] Floating controls NOT visible (even if panel "collapsed" in Redux)
- [ ] Panel always visible via CSS

#### TC-B2: 1024px Width
- [ ] Set viewport: 1024px × 800px
- [ ] Collapse button IS visible
- [ ] Click collapse button → panel slides out
- [ ] Floating controls appear on map

#### TC-B3: Smooth Transition
- [ ] Slowly resize from 1023px to 1024px
- [ ] Observe collapse button appear
- [ ] No layout jank or jumps
- [ ] Animations smooth

### Expected Behavior
✅ Clear visual breakpoint at exactly 1024px width.

---

## Test Suite 4: Desktop Behavior (1280px+)

### Setup
- Set viewport: 1280px × 720px (standard laptop)

### Test Cases

#### TC-D1: Collapse Button Visible
- [ ] Collapse button (ChevronLeft icon) visible in top controls
- [ ] Button positioned next to "Filters" toggle
- [ ] Tooltip shows "Hide panel (Esc)" on hover

#### TC-D2: Panel Collapse Animation
- [ ] Click collapse button
- [ ] Panel slides out smoothly (300ms transition)
- [ ] Transform: translateX(-100%)
- [ ] No layout shift in map area

#### TC-D3: Floating Controls Appear
- [ ] After panel collapses, two buttons appear at top-left of map:
  - "X results >" (FloatingResultsButton)
  - "Filters" (FloatingFiltersButton)
- [ ] Buttons positioned: top: 16px, left: 16px
- [ ] z-index: 1200 (above map controls)
- [ ] 8px gap between buttons

#### TC-D4: Panel Reopen
- [ ] Click "X results >" button
- [ ] Panel slides back in smoothly
- [ ] Floating controls disappear
- [ ] Panel state restored (filters, scroll position)

#### TC-D5: Keyboard Support
- [ ] Press Escape key when panel visible
- [ ] Panel collapses
- [ ] Floating controls appear
- [ ] Press Escape again (no effect - panel already hidden)

#### TC-D6: Map Expansion
- [ ] Collapse panel
- [ ] Map should expand to fill space
- [ ] Map markers remain visible
- [ ] Map controls functional

### Expected Behavior
✅ Full collapse/expand functionality, smooth animations, no layout issues.

---

## Test Suite 5: Ultrawide Desktop (1920px)

### Setup
- Set viewport: 1920px × 1080px (full HD)

### Test Cases

#### TC-U1: Layout Integrity
- [ ] Collapse button visible and functional
- [ ] Panel width remains 350px (not stretched)
- [ ] Map fills remaining space (1570px width when panel open)

#### TC-U2: Feature Parity
- [ ] All collapse functionality works
- [ ] Floating controls work
- [ ] No visual artifacts or layout issues
- [ ] Performance smooth (GPU-accelerated animations)

### Expected Behavior
✅ Desktop behavior maintained, no layout issues at large resolutions.

---

## Test Suite 6: Cross-Feature Integration

### Test Cases

#### TC-I1: Filters Integration
- [ ] Open/close filters section (existing feature)
- [ ] Collapse panel (new feature)
- [ ] Reopen panel
- [ ] Filters state preserved (open/closed)

#### TC-I2: Property Selection
- [ ] Select property from list
- [ ] Collapse panel
- [ ] Reopen panel
- [ ] Selected property still highlighted

#### TC-I3: Map Interactions
- [ ] Pan/zoom map
- [ ] Collapse panel
- [ ] Map viewport preserved
- [ ] Marker click opens property detail

#### TC-I4: Filter Overlay (Task 2.17.4)
- [ ] Collapse panel
- [ ] Click "Filters" floating button
- [ ] FilterDrawer overlay opens
- [ ] Apply filters → overlay closes
- [ ] Panel remains collapsed

#### TC-I5: Session State
- [ ] Apply filters, collapse panel
- [ ] Refresh page
- [ ] Panel state should be visible (default: true)
- [ ] Filters should persist

### Expected Behavior
✅ No regressions, all existing features work correctly with new collapse feature.

---

## Test Suite 7: Performance & Polish

### Test Cases

#### TC-P1: Animation Performance
- [ ] Open Chrome DevTools → Performance tab
- [ ] Record panel collapse/expand
- [ ] Check for:
  - 60fps smooth animation
  - No layout recalculation spikes
  - GPU-accelerated transform
  - willChange: transform applied

#### TC-P2: No Layout Shift
- [ ] Collapse panel
- [ ] Verify map doesn't "jump"
- [ ] Verify no content reflow
- [ ] Property cards stable

#### TC-P3: Accessibility
- [ ] Tab to collapse button
- [ ] Press Enter (should collapse panel)
- [ ] Tab to "X results >" button
- [ ] Press Enter (should reopen panel)
- [ ] Screen reader announces state changes

#### TC-P4: Touch Interactions (if testing on device)
- [ ] Tap collapse button
- [ ] Tap floating buttons
- [ ] Tap to reopen panel
- [ ] All touch targets 44px+ (accessibility guideline)

### Expected Behavior
✅ 60fps animations, no jank, accessible, touch-friendly.

---

## Test Suite 8: Edge Cases & Error Handling

### Test Cases

#### TC-E1: Rapid Toggle
- [ ] Rapidly click collapse button 10 times
- [ ] No animation jank
- [ ] Final state correct (last click determines state)
- [ ] No Redux state desync

#### TC-E2: Keyboard Spam
- [ ] Rapidly press Escape key 10 times
- [ ] Same as TC-E1 (stable behavior)

#### TC-E3: Resize During Animation
- [ ] Start panel collapse animation
- [ ] Immediately resize viewport
- [ ] Animation completes gracefully
- [ ] No visual artifacts

#### TC-E4: Panel Collapsed + Viewport Shrink
- [ ] Desktop (1280px): Collapse panel
- [ ] Resize viewport to 1023px (mobile)
- [ ] Panel should become visible (CSS override)
- [ ] Floating controls should disappear

#### TC-E5: Panel Collapsed + Page Reload
- [ ] Collapse panel
- [ ] Refresh page (F5)
- [ ] Panel should be visible (default: true)
- [ ] No broken state

### Expected Behavior
✅ Robust handling of edge cases, no crashes or visual glitches.

---

## Test Suite 9: Browser Compatibility

### Browsers to Test

#### Chrome (Primary)
- [ ] All test suites pass
- [ ] No console errors
- [ ] No console warnings

#### Safari
- [ ] Media queries work correctly
- [ ] Animations smooth (webkit prefixes not needed for transform)
- [ ] Floating buttons position correctly

#### Firefox
- [ ] Media queries work correctly
- [ ] Animations smooth
- [ ] No layout differences

#### Edge (Chromium)
- [ ] Same behavior as Chrome
- [ ] No compatibility issues

### Expected Behavior
✅ Consistent behavior across all major browsers.

---

## Console & Network Checks

### Console Verification
- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] No Redux state errors
- [ ] No ARIA/accessibility warnings

### Network Verification
- [ ] No failed API calls during collapse/expand
- [ ] No unnecessary re-renders
- [ ] Redux actions dispatch correctly:
  - `togglePropertyPanel` when button clicked
  - `togglePropertyPanel` when Escape pressed

---

## Final Verification Checklist

### Code Quality
- [x] TypeScript compilation passes
- [ ] No linting errors
- [ ] Code follows project standards
- [ ] Comments clear and accurate

### Functionality
- [ ] Mobile: Collapse hidden, panel locked visible
- [ ] Tablet: Same as mobile
- [ ] Desktop: Full collapse functionality
- [ ] Floating controls work correctly
- [ ] No regressions in existing features

### Performance
- [ ] 60fps animations
- [ ] No layout jank
- [ ] GPU-accelerated transforms
- [ ] Fast paint times

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] ARIA attributes correct
- [ ] Focus management proper

### Cross-Browser
- [ ] Chrome ✅
- [ ] Safari ✅
- [ ] Firefox ✅
- [ ] Edge ✅

---

## Bug Reporting Template

If issues found, use this template:

```markdown
### Bug: [Short description]

**Severity**: Critical / Major / Minor / Cosmetic

**Environment**:
- Browser: [Chrome/Safari/Firefox/Edge]
- Viewport: [width]px × [height]px
- Device: [Desktop/Tablet/Mobile]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshot**:
[Attach screenshot]

**Console Errors**:
```
[Paste console errors]
```

**Proposed Fix**:
[If known]
```

---

## Sign-Off

### QA Engineer
- [ ] All critical test cases pass
- [ ] No blocking bugs found
- [ ] Minor issues documented
- [ ] Ready for production

**Signature**: _________________
**Date**: _________________

### Tech Lead Review
- [ ] Code reviewed
- [ ] Architecture sound
- [ ] Performance acceptable
- [ ] Approved for merge

**Signature**: _________________
**Date**: _________________

---

## Next Steps After QA

1. Fix any bugs found during QA
2. Merge Phase 2.17 to main branch
3. Deploy to staging environment
4. Production smoke test
5. Release to production

**Phase 2.17 Complete**: All 7 tasks done ✅
