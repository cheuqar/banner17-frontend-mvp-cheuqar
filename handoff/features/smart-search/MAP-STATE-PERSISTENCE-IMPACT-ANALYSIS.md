# Map State Persistence & Filter Conflict Resolution - Impact Analysis

**Date**: 2025-10-12
**Feature**: Smart Search
**Analysis Type**: New Feature Requirement Impact Assessment
**Analyst**: Elite Feature Plan Refiner

---

## Executive Summary

### Requirement Overview
User has identified a critical UX issue where applying filters resets the map viewport, losing the user's manually selected viewing area. This analysis addresses three interconnected requirements:

1. **Map State Persistence**: Preserve user's zoom/pan across filter changes
2. **Active Filter Display**: Show "Mapped area" and "Drawn Area" as filter chips
3. **Filter Conflict Resolution**: Handle conflicts between location filters and map-defined areas

### Strategic Assessment

| Aspect | Current State | Desired State | Complexity |
|--------|---------------|---------------|------------|
| Map Persistence | Resets on filter apply | Preserves user viewport | MEDIUM |
| Filter Display | Location only | +Mapped/Drawn area | LOW |
| Conflict Resolution | None | Popup dialog with choice | MEDIUM |
| Implementation Risk | N/A | LOW (isolated changes) | - |

### Impact Classification

- **High Priority**: Critical UX issue affecting user workflow
- **Low Regression Risk**: Changes are isolated to map/filter interaction
- **Implementation Estimate**: 7-10 hours across 2 new phases
- **Dependencies**: None (self-contained enhancement)

---

## 1. Technical Impact Analysis

### 1.1 Affected Components

#### Redux State Changes (smartSearchSlice.ts)

**Current State**:
```typescript
export interface SmartSearchState {
  mapBounds: BBoxBounds | null;        // Current viewport bounds
  searchBounds: BBoxBounds | null;     // Bounds used for search
  manualMapMove: boolean;              // User moved map flag
  mapCenter: MapCenter | null;         // Address search center
}
```

**Required Changes**:
```typescript
export interface SmartSearchState {
  // EXISTING
  mapBounds: BBoxBounds | null;
  searchBounds: BBoxBounds | null;
  manualMapMove: boolean;
  mapCenter: MapCenter | null;

  // NEW FIELDS
  mapAreaType: 'none' | 'mapped' | 'drawn';  // Track area source
  userDefinedMapArea: boolean;               // User intentionally defined area
  preservedMapState: {                       // State to restore after filter apply
    center: [number, number];
    zoom: number;
  } | null;
  pendingConflict: {                         // Conflict detection state
    hasLocationFilter: boolean;
    hasMapArea: boolean;
    requiresResolution: boolean;
  } | null;
}
```

**New Actions Required**:
```typescript
// Map area tracking
setMapAreaType(state, action: PayloadAction<'none' | 'mapped' | 'drawn'>)
setUserDefinedMapArea(state, action: PayloadAction<boolean>)
preserveMapState(state, action: PayloadAction<{center: [number, number]; zoom: number}>)
restoreMapState(state)

// Conflict resolution
detectFilterConflict(state): boolean
resolveConflictKeepMapArea(state)  // Remove location filters
resolveConflictKeepLocation(state)  // Remove map area
dismissConflict(state)
```

#### Component Changes

**MapView.tsx** (MEDIUM CHANGES)
- Add map state preservation logic
- Prevent reset when `userDefinedMapArea === true`
- Update `MapBoundsTracker` to set `mapAreaType = 'mapped'` on manual pan/zoom
- Integrate with restored map state after filter apply

**FilterPanel.tsx** (MAJOR CHANGES)
- Add conflict detection before `performSearch()`
- Show `ConfirmationDialog` when conflict detected
- Handle user choice (keep area vs keep location)
- Update `handleApply()` to check for conflicts

**ActiveFiltersPanel.tsx** (NEW COMPONENT or ENHANCEMENT)
- Display "Mapped area" chip when `mapAreaType === 'mapped'`
- Display "Drawn Area" chip when `mapAreaType === 'drawn'`
- Allow clearing map area filter (remove chip → reset map)

**ConfirmationDialog.tsx** (NEW COMPONENT)
- Material-UI Dialog component
- Display warning message with area type
- Two action buttons: "Stay with [Area]" and "Confirm"
- Dispatch appropriate action based on choice

### 1.2 Backend Integration

**No Backend Changes Required** ✅

The backend already supports:
- `bbox` parameter for map-bounded searches
- `state` and `suburb` filters
- Both can be sent independently

**Current API Behavior**:
```python
# Backend logic (already working)
if bbox and (state or suburb):
    # bbox takes precedence
    use_bbox_for_spatial_filter()
    ignore_state_suburb()  # This is the conflict!
```

**Recommendation**: Keep backend unchanged. Handle conflict in frontend before API call.

### 1.3 Integration Points

**Phase 2.5.5: "Search This Area" Button** ✅
- Already sets `manualMapMove = true`
- **NEW**: Also set `mapAreaType = 'mapped'` and `userDefinedMapArea = true`
- **NEW**: Add "Mapped area" chip to active filters

**Phase 2.6: Draw on Map** (FUTURE)
- When user draws polygon, set `mapAreaType = 'drawn'`
- Store polygon coordinates in Redux
- Display "Drawn Area" chip
- Integrate with conflict resolution

**Address Search Panel** ⚠️
- **Behavior Change Required**: Address search should OVERRIDE map area
- Logic: Address search is explicit intent, clear `userDefinedMapArea`
- Do NOT show conflict dialog for address search

---

## 2. User Experience Flow Analysis

### Scenario 1: User Pans/Zooms, Then Applies Filters

**Current Behavior** ❌:
```
1. User loads /search → Map centered on Sydney
2. User pans to Parramatta → manualMapMove = true
3. User sets filters (price: $500K-$1M, bedrooms: 3) → Clicks "Apply Filters"
4. Map resets to Sydney → Parramatta area lost ❌
```

**Desired Behavior** ✅:
```
1. User loads /search → Map centered on Sydney
2. User pans to Parramatta
   → manualMapMove = true
   → userDefinedMapArea = true
   → mapAreaType = 'mapped'
   → Active filters: ["Mapped area"]
3. User sets filters (price: $500K-$1M, bedrooms: 3) → Clicks "Apply Filters"
4. Map stays at Parramatta ✅
   → Search uses bbox (Parramatta bounds) + price + bedrooms
   → Results show properties in Parramatta with filters
```

**Implementation Keys**:
- Preserve map state before `performSearch()`
- After search completes, restore map state if `userDefinedMapArea === true`
- Do NOT call `map.setView()` in `MapCenterController` when preserving state

### Scenario 2: User Draws Area, Then Selects State Filter

**Desired Behavior** ✅:
```
1. User draws custom polygon on map
   → mapAreaType = 'drawn'
   → Active filters: ["Drawn Area", "Price: $500K-$1M"]
2. User selects "State: NSW" → Clicks "Apply Filters"
3. Conflict detected → Popup appears:

   ┌─────────────────────────────────────────┐
   │ ⚠️  Filter Conflict Detected            │
   ├─────────────────────────────────────────┤
   │ Selecting State will replace your       │
   │ Drawn Area. Do you want to continue?    │
   │                                         │
   │ [Stay with Drawn Area] [Confirm]       │
   └─────────────────────────────────────────┘

4a. User clicks "Stay with Drawn Area"
    → State filter removed from filters
    → Search uses drawn area bbox + other filters
    → Active filters: ["Drawn Area", "Price: $500K-$1M"]

4b. User clicks "Confirm"
    → Drawn area cleared
    → mapAreaType = 'none'
    → userDefinedMapArea = false
    → Search uses state=NSW + other filters
    → Active filters: ["State: NSW", "Price: $500K-$1M"]
```

**Implementation Keys**:
- Detect conflict in `FilterPanel.handleApply()` BEFORE dispatch
- Check: `(state.filters.location.state || state.filters.location.suburb) && state.mapAreaType !== 'none'`
- Show modal, pause filter application until user chooses
- Dispatch resolution action based on choice

### Scenario 3: User Has Mapped Area, Clears All Filters

**Desired Behavior** ✅:
```
1. User has active "Mapped area" filter
2. User clicks "Clear All Filters"
3. Expected behavior:
   - Map resets to default Sydney view ✅
   - userDefinedMapArea = false ✅
   - mapAreaType = 'none' ✅
   - All filters cleared ✅
```

**Implementation**:
```typescript
clearAllFilters: (state) => {
  // Clear all filters (existing)
  state.filters = { ...initialState.filters };
  state.activeFilters = [];

  // NEW: Also clear map area state
  state.mapAreaType = 'none';
  state.userDefinedMapArea = false;
  state.preservedMapState = null;
  state.searchBounds = null;
  // Map will reset to default center on next render
}
```

### Scenario 4: Address Search vs Mapped Area

**Question for User**: Should address search override mapped area or show conflict?

**Recommended Behavior** ✅:
```
1. User pans manually → "Mapped area" active
2. User searches address "123 Main St, Sydney"
3. Address search overrides (no conflict dialog):
   → mapAreaType = 'none'
   → userDefinedMapArea = false
   → Map centers on address
   → No "Mapped area" chip shown
```

**Rationale**: Address search is explicit user intent with higher priority than passive map panning.

**Alternative Behavior** (if user prefers):
```
1. User pans manually → "Mapped area" active
2. User searches address → Conflict dialog shown
3. User chooses to keep mapped area or switch to address
```

---

## 3. Implementation Complexity Assessment

### Phase 2.5.7 (Enhanced): Map State Persistence + Active Filter Display

**Original Estimate**: 2-3 hours
**Revised Estimate**: 4-6 hours
**Complexity**: MEDIUM

**Tasks**:
1. ✅ Add `mapAreaType`, `userDefinedMapArea`, `preservedMapState` to Redux (30 min)
2. ✅ Update `MapBoundsTracker` to set `mapAreaType = 'mapped'` on manual pan/zoom (45 min)
3. ✅ Add map state preservation logic in `MapView.tsx` (1 hour)
4. ✅ Update `ActiveFiltersPanel` to display "Mapped area" chip (1 hour)
5. ✅ Modify `clearAllFilters` to reset map state (15 min)
6. ✅ Test map preservation across multiple filter applications (1 hour)
7. ✅ Test "Clear All Filters" resets map correctly (30 min)

**Risk Level**: LOW
- No backend changes required
- Redux state additions are additive (no breaking changes)
- Map preservation is opt-in based on `userDefinedMapArea` flag

### Phase 2.5.10 (NEW): Filter Conflict Resolution

**Estimate**: 3-4 hours
**Complexity**: MEDIUM

**Tasks**:
1. ✅ Create `ConfirmationDialog.tsx` component (1 hour)
2. ✅ Add conflict detection logic in `FilterPanel.tsx` (45 min)
3. ✅ Add `resolveConflictKeepMapArea` action (30 min)
4. ✅ Add `resolveConflictKeepLocation` action (30 min)
5. ✅ Test conflict dialog triggers correctly (30 min)
6. ✅ Test both resolution paths (keep area vs keep location) (45 min)

**Risk Level**: LOW
- Component is self-contained (new file)
- Conflict detection happens before API call (safe to add)
- User has full control over resolution

### Phase 2.6 (Updated): Draw on Map + "Drawn Area" Integration

**Original Estimate**: 10-12 hours
**Revised Estimate**: 10-12 hours (unchanged)
**Complexity**: HIGH (unchanged)

**Additional Tasks** (absorbed into existing estimate):
- Display "Drawn Area" chip in active filters (included in UI work)
- Set `mapAreaType = 'drawn'` when drawing completes (minor addition)
- Integrate with conflict resolution dialog (reuse Phase 2.5.10 logic)

**Note**: Draw on Map is a future phase. Conflict resolution built in Phase 2.5.10 will support it automatically.

---

## 4. Edge Cases & Validation Rules

### Edge Case 1: User Has Mapped Area + Suburb Filter Already Set

**Scenario**:
```
1. User pans to Parramatta → "Mapped area" active
2. User also selects "State: NSW, Suburb: Parramatta"
3. User clicks "Apply Filters"
```

**Question**: If bbox and suburb both point to same area, show conflict or allow both?

**Recommended Behavior**:
```
Allow both, bbox takes precedence:
- Active filters: ["Mapped area", "State: NSW, Suburb: Parramatta"]
- API call: bbox=(Parramatta bounds) + other filters
- Backend: bbox takes precedence, state/suburb ignored
- Result: Works correctly, no conflict needed
```

**Alternative Behavior** (stricter):
```
Show conflict dialog even if they match:
- "You have both location filter and mapped area. Choose one."
- Forces user to pick single source of truth
```

**Recommendation**: Use lenient approach (allow both). Only show conflict if user CHANGES location filter while map area exists.

### Edge Case 2: User Draws Area Outside Selected State

**Scenario**:
```
1. User selects "State: NSW"
2. User draws polygon in VIC
3. User clicks "Apply Filters"
```

**Recommended Behavior**:
```
Conflict dialog:
- "Your drawn area is outside NSW. Do you want to:"
- [Stay with NSW] → Clear drawn area
- [Use Drawn Area] → Clear state filter
```

**Note**: Detection requires checking if drawn polygon intersects with state boundaries (complex).

**Simpler Approach**:
```
Always show conflict when both exist:
- Don't validate geographic overlap
- Let backend handle the logic (bbox takes precedence)
- User can verify results after search
```

### Edge Case 3: Address Search Behavior

**Current Behavior**:
- Address search calls `centerMapAtLocation()`
- Sets `mapCenter` and `selectedAddress`
- Does NOT trigger search automatically

**New Behavior Options**:

**Option A**: Address search clears map area (RECOMMENDED)
```typescript
// In AddressSearchPanel.tsx
const handleAddressSelect = (address) => {
  dispatch(centerMapAtLocation({...address}));

  // NEW: Clear map area state
  dispatch(setMapAreaType('none'));
  dispatch(setUserDefinedMapArea(false));
}
```

**Option B**: Address search triggers conflict dialog
```typescript
const handleAddressSelect = (address) => {
  if (mapAreaType !== 'none') {
    showConflictDialog({
      type: 'address_vs_maparea',
      choice1: 'Use Address',
      choice2: 'Keep Map Area'
    });
  } else {
    dispatch(centerMapAtLocation({...address}));
  }
}
```

**Recommendation**: Use Option A. Address search is explicit intent, should override passive map area.

### Edge Case 4: "Search This Area" Button

**Current Behavior**:
- Button appears when `manualMapMove === true`
- Clicking triggers `searchByBounds(mapBounds)`
- Sets `searchBounds = mapBounds` after successful search

**New Behavior**:
```typescript
// In SearchThisAreaButton.tsx
const handleSearchThisArea = () => {
  // NEW: Mark as user-defined map area
  dispatch(setMapAreaType('mapped'));
  dispatch(setUserDefinedMapArea(true));

  // EXISTING: Trigger bounds search
  dispatch(searchByBounds(mapBounds));
}
```

**Active Filters**:
- After clicking "Search This Area", show "Mapped area" chip
- Chip should be clearable (clicking X resets map area)

---

## 5. Regression Risk Analysis

### High Risk Areas

**Area 1: Phase 2.5.5 "Search This Area" Button**

**Risk**: New map persistence logic might conflict with bounds search
**Mitigation**:
- Thoroughly test "Search This Area" → Apply Filters → "Search This Area" flow
- Ensure bounds are preserved correctly between searches
- Verify "Mapped area" chip appears after first "Search This Area" click

**Area 2: Phase 2.5.4 Active Filters Panel**

**Risk**: Adding "Mapped area" chip might break existing filter display logic
**Mitigation**:
- Existing `updateActiveFilters()` is pure function, safe to extend
- Add "Mapped area" separately (not part of `updateActiveFilters()`)
- Test all existing filter chips still display correctly

**Area 3: Phase 2.4 Filter Application**

**Risk**: Conflict detection logic might delay or block legitimate searches
**Mitigation**:
- Conflict detection is opt-in (only triggers if both location + map area exist)
- User can always choose to proceed
- Add feature flag `ENABLE_MAP_CONFLICT_DETECTION` for emergency disable

### Medium Risk Areas

**Area 4: Map Centering Logic**

**Risk**: Address search might not center map if preservation logic interferes
**Mitigation**:
- `MapCenterController` should always respect `mapCenter` prop
- Only skip reset if `mapCenter === null` and `userDefinedMapArea === true`
- Test address search → map centers correctly

### Low Risk Areas

**Area 5: Redux State Management**

**Risk**: New state fields might cause undefined errors in existing code
**Mitigation**:
- All new fields have default values in `initialState`
- Existing code doesn't access new fields (no breaking changes)
- TypeScript will catch any type mismatches at compile time

---

## 6. Alternative Implementation Approaches

### Approach A: Explicit User Intent Tracking (RECOMMENDED)

**Concept**: Track `mapAreaSource` to distinguish intentional vs accidental map movements

```typescript
export type MapAreaSource =
  | 'default'          // Initial page load
  | 'user_pan'         // User manually panned
  | 'search_area'      // User clicked "Search This Area"
  | 'drawn'            // User drew polygon
  | 'address';         // Address search

export interface SmartSearchState {
  mapAreaSource: MapAreaSource;
  userDefinedMapArea: boolean;
  // ...
}
```

**Preservation Logic**:
```typescript
const shouldPreserveMapState = (source: MapAreaSource): boolean => {
  return ['user_pan', 'search_area', 'drawn'].includes(source);
}
```

**Pros**:
- Clear intent tracking
- Easy to reason about preservation rules
- Future-proof for new map interaction types

**Cons**:
- More complex state management
- Requires updating `mapAreaSource` in multiple places

### Approach B: Always Preserve Map State (SIMPLE)

**Concept**: Never reset map unless user explicitly clears filters

```typescript
// Simple logic
const shouldResetMap = filters.length === 0; // Only reset on "Clear All"
```

**Pros**:
- Simplest implementation
- No complex tracking required
- Works for 90% of use cases

**Cons**:
- Might surprise users who expect reset after address search
- No distinction between intentional and accidental map movements
- Harder to add conflict resolution later

### Approach C: Setting-Based Toggle

**Concept**: Add user preference toggle

```typescript
// User settings
export interface UserPreferences {
  lockMapPositionOnFilterApply: boolean; // Default: true
}
```

**Pros**:
- User has full control
- Can satisfy different user preferences
- Easy to A/B test

**Cons**:
- Adds UI complexity (settings page)
- Most users won't change defaults
- More code to maintain

### Recommendation

**Use Approach A (Explicit Intent Tracking)** with simplified implementation:
- Track `mapAreaType: 'none' | 'mapped' | 'drawn'`
- Track `userDefinedMapArea: boolean`
- Simple preservation rule: preserve if `userDefinedMapArea === true`

This balances clarity, maintainability, and future extensibility.

---

## 7. Documentation Updates Required

### plan.MD Updates

**Add New Phases**:
```markdown
## Phase 2.5.7 (Enhanced): Map State Persistence
- Add Redux state for map persistence
- Prevent map reset when user has defined viewport
- Display "Mapped area" active filter chip
- Test map preservation across filter applications

## Phase 2.5.10 (NEW): Filter Conflict Resolution
- Create ConfirmationDialog component
- Add conflict detection logic
- Implement resolution actions (keep area vs keep location)
- Test conflict dialog triggers and resolution paths

## Phase 2.6 (Updated): Draw on Map + Drawn Area Integration
- Implement polygon drawing on map
- Display "Drawn Area" active filter chip
- Integrate with conflict resolution
- Test drawing + filter interaction
```

### technical-specs.MD Updates

**Add Redux Schema Section**:
```markdown
## Redux State Schema Changes

### Map Persistence State
```typescript
export interface SmartSearchState {
  // Map area tracking
  mapAreaType: 'none' | 'mapped' | 'drawn';
  userDefinedMapArea: boolean;
  preservedMapState: {
    center: [number, number];
    zoom: number;
  } | null;

  // Conflict resolution
  pendingConflict: {
    hasLocationFilter: boolean;
    hasMapArea: boolean;
    requiresResolution: boolean;
  } | null;
}
```

### Component Modifications

#### MapView.tsx
- Update MapBoundsTracker to set mapAreaType
- Add map state preservation before search
- Restore map state after search if userDefinedMapArea
- Prevent MapCenterController reset when preserving

#### FilterPanel.tsx
- Add conflict detection in handleApply()
- Show ConfirmationDialog when conflict detected
- Dispatch resolution action based on user choice

#### ConfirmationDialog.tsx (NEW)
- Material-UI Dialog component
- Props: open, areaType, onKeepArea, onKeepLocation, onClose
- Display conflict message with area type
- Action buttons for resolution
```
```

### qa.MD Updates

**Add Test Cases Section**:
```markdown
## Phase 2.5.7: Map State Persistence Test Cases

### Test Suite A: Map Preservation (7 test cases)
1. ✅ Manual Pan → Apply Filters → Map stays at panned location
2. ✅ Manual Zoom → Apply Filters → Zoom level preserved
3. ✅ "Search This Area" → Apply Filters → Bounds preserved
4. ✅ "Mapped area" chip appears after manual pan/zoom
5. ✅ Clearing "Mapped area" chip resets map to default
6. ✅ "Clear All Filters" resets map to default view
7. ✅ Address search clears "Mapped area" and centers on address

### Test Suite B: Filter Conflict Resolution (5 test cases)
1. ✅ State filter + Mapped area → Conflict dialog appears
2. ✅ Suburb filter + Mapped area → Conflict dialog appears
3. ✅ User chooses "Keep Area" → Location filters removed
4. ✅ User chooses "Confirm" → Map area cleared
5. ✅ No conflict when only non-location filters applied

### Test Suite C: Integration Tests (3 test cases)
1. ✅ End-to-end: Pan → Filter → Apply → Verify preserved
2. ✅ End-to-end: Draw → State filter → Resolve → Verify
3. ✅ Regression: Existing filters still work correctly
```

### progress.MD Creation

**NEW FILE**: Create progress.MD with:
```markdown
# Smart Search Progress Tracking

## Current Status
- Phase: 2.5.10 of 12
- Completion: 42% (5 of 12 phases)
- Last Updated: 2025-10-12
- Linear Project: [Smart Search](linear.app/team/project/smart-search)

## Task Tracking
| Task ID | Linear Issue | Description | Est. Hours | Actual | Status | Completed |
|---------|--------------|-------------|------------|--------|--------|-----------|
| 2.5.7 | TBD | Map State Persistence | 4-6 | - | 📋 Planned | - |
| 2.5.10 | TBD | Filter Conflict Resolution | 3-4 | - | 📋 Planned | - |
| 2.6 | TBD | Draw on Map | 10-12 | - | 📋 Planned | - |

## Daily Progress Log
### 2025-10-12
- 📝 [DOC] Created impact analysis for map persistence
- 💡 [IDEA] Identified need for conflict resolution dialog
- ⚠️ [RISK] Potential regression in Phase 2.5.5 "Search This Area"
```

---

## 8. Implementation Roadmap

### Week 1: Phase 2.5.7 - Map State Persistence

**Day 1-2** (4-6 hours):
- Add Redux state fields
- Update MapBoundsTracker
- Implement preservation logic
- Add "Mapped area" chip

**Testing**:
- Manual pan/zoom preservation
- Filter application with preserved map
- "Clear All" resets map correctly

### Week 2: Phase 2.5.10 - Conflict Resolution

**Day 3-4** (3-4 hours):
- Create ConfirmationDialog component
- Add conflict detection
- Implement resolution actions
- Integration testing

**Testing**:
- Conflict triggers correctly
- Both resolution paths work
- No false positives

### Week 3-4: Phase 2.6 - Draw on Map

**Day 5-10** (10-12 hours):
- Implement drawing UI
- Integrate with map persistence
- Add "Drawn Area" chip
- Full integration testing

**Testing**:
- Drawing functionality
- Conflict resolution with drawn areas
- Performance with large polygons

---

## 9. Key Questions for User

### Q1: Address Search Behavior

**Question**: Should address search clear "Mapped area" or show conflict dialog?

**Option A (Recommended)**: Auto-clear map area
- Pro: Faster workflow, address search is explicit intent
- Con: User might lose accidentally

**Option B**: Show conflict dialog
- Pro: User never loses work without confirmation
- Con: Extra click for common operation

**Recommended**: Option A (auto-clear)

### Q2: Implementation Priority

**Question**: Should map persistence be implemented before Phase 2.5.7 (Map Controls Repositioning) or after?

**Option A**: Before (insert as Phase 2.5.7)
- Pro: Fixes user-reported issue immediately
- Con: Delays other features

**Option B**: After (becomes Phase 2.5.8)
- Pro: Maintains current roadmap order
- Con: User continues to experience frustration

**Recommended**: Option A (high priority UX fix)

### Q3: Default Map Behavior on Page Load

**Question**: Should "Mapped area" be active by default when page loads, or only after user interaction?

**Option A (Recommended)**: Only after interaction
- Default view shows no "Mapped area" chip
- Chip appears after user pans/zooms/clicks "Search This Area"

**Option B**: Active by default
- Shows "Mapped area: Sydney" on page load
- User must clear to search other areas

**Recommended**: Option A (only after interaction)

### Q4: Conflict Dialog Wording

**Current Proposal**:
```
⚠️ Filter Conflict Detected

Selecting State will replace your Mapped Area.
Do you want to continue?

[Stay with Mapped Area]  [Confirm]
```

**Alternative**:
```
⚠️ Choose Your Search Area

You have both a State filter and a Mapped Area selected.
Which would you like to use?

[Use Mapped Area]  [Use State Filter]
```

**Recommended**: Alternative (more positive framing)

---

## 10. Risk Mitigation Strategies

### Strategy 1: Feature Flag

Add environment variable for gradual rollout:
```typescript
const ENABLE_MAP_PERSISTENCE = process.env.REACT_APP_ENABLE_MAP_PERSISTENCE === 'true';

// In MapView.tsx
if (ENABLE_MAP_PERSISTENCE && userDefinedMapArea) {
  preserveMapState();
}
```

### Strategy 2: Comprehensive Testing

Create test matrix:
```markdown
| Scenario | Location Filter | Map Area | Expected Behavior |
|----------|----------------|----------|-------------------|
| 1 | None | None | Default behavior |
| 2 | State: NSW | None | State filter applies |
| 3 | None | Mapped | Mapped area applies |
| 4 | State: NSW | Mapped | Conflict dialog |
| 5 | Suburb: Syd | Drawn | Conflict dialog |
| 6 | After "Clear All" | - | Map resets |
```

### Strategy 3: Gradual Rollout

1. **Phase 1**: Map persistence only (no conflict resolution)
2. **Phase 2**: Add conflict detection (show warning, auto-resolve)
3. **Phase 3**: Add full conflict resolution dialog
4. **Phase 4**: Enable for all users

### Strategy 4: User Feedback Loop

- Add telemetry to track:
  - How often conflicts occur
  - Which resolution option users choose
  - Map reset complaints (should decrease to zero)
- Adjust implementation based on data

---

## 11. Success Metrics

### Quantitative Metrics

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Map Reset Complaints | High | 0 | User feedback |
| Conflict Dialog Triggers | - | <10% of searches | Telemetry |
| "Keep Map Area" Choice | - | >70% | User behavior tracking |
| Feature Adoption (Mapped Area) | 0% | >40% of sessions | Active filter analytics |

### Qualitative Metrics

- ✅ Users report map stays where they position it
- ✅ No confusion about which area is being searched
- ✅ Conflict dialog is clear and helpful
- ✅ Zero regression in existing filter functionality

---

## 12. Conclusion

### Summary

This feature enhancement addresses a critical UX issue with **LOW implementation risk** and **HIGH user value**. The proposed solution:

1. ✅ Preserves user's map viewport across filter changes
2. ✅ Clearly displays which area is being searched (filter chips)
3. ✅ Handles filter conflicts gracefully with user choice
4. ✅ Maintains backward compatibility (no breaking changes)
5. ✅ Requires no backend changes (frontend-only)

### Recommended Implementation Order

1. **Phase 2.5.7**: Map State Persistence (4-6 hours)
2. **Phase 2.5.10**: Filter Conflict Resolution (3-4 hours)
3. **Phase 2.6**: Draw on Map (10-12 hours)

**Total Estimated Time**: 17-22 hours across 3 phases

### Next Steps

1. User confirms key decisions (Q1-Q4 above)
2. Create Linear issues for Phase 2.5.7 and 2.5.10
3. Update all documentation (plan.MD, technical-specs.MD, qa.MD)
4. Begin implementation with comprehensive testing
5. Deploy Phase 2.5.7 first, validate with users
6. Deploy Phase 2.5.10 after 2.5.7 is stable
7. Continue with Phase 2.6 as originally planned

---

**End of Impact Analysis**
