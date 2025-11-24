# Phase 2.5.8: Pre-Deploy Checklist

## Quick 10-Minute Verification Before Production

### ✅ Automated Checks (Already Completed)
- [x] TypeScript compilation: 0 errors ✅
- [x] No console errors on page load ✅
- [x] Bottom floating controls positioned correctly ✅
- [x] Bottom-right controls positioned correctly ✅
- [x] Zoom In/Out functionality working ✅
- [x] Default Leaflet controls disabled ✅

---

### ⚠️ Manual Checks Required (10 minutes)

#### 1. Mobile Device Test (5 minutes)

**iPhone Test (375px)**:
- [ ] Open http://localhost:3301/search on iPhone or Chrome DevTools mobile emulation
- [ ] Verify bottom floating controls visible and centered
- [ ] Verify bottom-right controls visible in vertical stack
- [ ] Verify controls don't overlap
- [ ] Verify "Show More" button text readable (not truncated)
- [ ] Take screenshot for documentation

**iPad Test (768px)**:
- [ ] Open on iPad or resize browser to 768px
- [ ] Verify controls adapt correctly
- [ ] Verify no horizontal scroll

**Pass Criteria**: Controls visible, no overlap, buttons functional

---

#### 2. "Show More" Button Test (2 minutes)

- [ ] Load http://localhost:3301/search
- [ ] Note current property count (should show ~200)
- [ ] Click "Show More (200)" button
- [ ] Wait for loading indicator
- [ ] Verify property count increases (e.g., 200 → 250 or 200 → 400)
- [ ] Verify button text updates with new remaining count
- [ ] Verify button disappears when all properties loaded

**Pass Criteria**: Button click loads more properties, count updates correctly

---

#### 3. "Search This Area" Workflow Test (3 minutes)

- [ ] Load http://localhost:3301/search
- [ ] Verify "Search This Area" button NOT visible initially
- [ ] Pan map to different location (drag map)
- [ ] Verify "Search This Area" button APPEARS in bottom floating controls
- [ ] Click "Search This Area" button
- [ ] Verify "Mapped area" chip appears in active filters (or similar indicator)
- [ ] Verify property list updates to show only properties in viewport
- [ ] Verify "Search This Area" button DISAPPEARS after click

**Pass Criteria**: Button appears on pan, click applies bbox filter, properties update

---

#### 4. Draw Mode Test (Optional - 2 minutes)

- [ ] Click "Draw Area" button (pencil icon) in bottom-right controls
- [ ] Verify button background changes to blue/teal (active state)
- [ ] Verify tooltip changes to "Exit Draw Mode"
- [ ] Click "Draw Area" button again
- [ ] Verify button returns to white background (inactive)
- [ ] Verify tooltip changes back to "Draw Area"

**Pass Criteria**: Button toggles active state, visual feedback correct

---

### 📸 Screenshot Documentation

**Required Screenshots**:
1. Desktop view (1512px or similar) - both control groups visible
2. Mobile view (375px) - controls adapt correctly
3. "Show More" after click - property count increased
4. "Search This Area" appeared after pan

**Save to**: `/handoff/features/smart-search/test-cases/phase-2.5.8-map-controls/screenshots/`

---

## Issue Reporting Template

If you find issues during manual testing, document here:

### Issue #1: [Title]
**Severity**: [Critical/High/Medium/Low]
**Component**: [BottomFloatingControls/BottomRightControls]
**Description**: [What's wrong]
**Steps to Reproduce**:
1.
2.
3.

**Expected**: [What should happen]
**Actual**: [What happened]
**Screenshot**: [Path to screenshot]

---

## Deployment Decision

### ✅ APPROVED FOR DEPLOY
- [ ] All automated checks passed
- [ ] All 3 manual tests passed (mobile, show more, search area)
- [ ] No critical issues found
- [ ] Screenshots documented
- [ ] Ready to merge and deploy

**Approved by**: ___________________
**Date**: ___________________

### ❌ NEEDS FIXES
- [ ] Critical issues found (list in Issue Reporting section above)
- [ ] Manual tests failed
- [ ] Return to feature-implementor for fixes

**Issues Count**: ___
**Estimated Fix Time**: ___

---

## Post-Deploy Monitoring (48 hours)

After deploying to production, monitor these metrics:

### User Interactions
- [ ] "Show More" button click rate (target: >10% of sessions)
- [ ] "Search This Area" usage (target: >5% of sessions)
- [ ] Draw mode activation (target: track baseline)

### Performance
- [ ] Page load time (should be unchanged)
- [ ] Zoom animation smoothness (user feedback)
- [ ] Mobile rendering issues (bug reports)

### Error Tracking
- [ ] Console errors related to map controls (should be 0)
- [ ] Failed property loads after "Show More" click (should be <1%)
- [ ] Mobile rendering complaints (should be 0)

---

## Rollback Plan

If critical issues arise in production:

### Step 1: Immediate Rollback (5 minutes)
```bash
git revert [commit-hash-phase-2.5.8]
git push origin main
./deploy-to-flyio.sh  # Or your deployment command
```

### Step 2: Verify Rollback
- [ ] Check http://[production-url]/search loads correctly
- [ ] Verify old controls still work (if any)
- [ ] Monitor error logs for 10 minutes

### Step 3: Notify Stakeholders
- [ ] Update Linear issue with rollback reason
- [ ] Notify team in Slack/Discord
- [ ] Document issue for future fix

---

## Success Metrics

**Definition of Success**:
- ✅ Controls positioned correctly on all devices
- ✅ All button clicks work as expected
- ✅ No console errors
- ✅ No user complaints within 48 hours
- ✅ Mobile rendering perfect
- ✅ Performance unchanged

**Deployment Confidence**: 90%

---

**Checklist Created by**: QA Specialist Agent
**Date**: October 12, 2025
**Status**: ✅ Ready for Manual Verification
