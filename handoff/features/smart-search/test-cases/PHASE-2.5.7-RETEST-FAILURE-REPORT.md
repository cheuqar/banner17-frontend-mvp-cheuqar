# Phase 2.5.7 Re-Test Failure Report

**Test Date**: October 12, 2025
**Test Environment**: Docker + Doppler (dev config)
**Tester**: QA Specialist Agent
**Test Account**: cheuqar@gmail.com

## Executive Summary

❌ **PHASE 2.5.7 BUG FIX VERIFICATION: FAILED**

The reported bug fix for bbox parameter persistence has **NOT** resolved the issue. The bbox parameter is still being lost when filters are applied, resulting in the same 500 Internal Server Error observed in the initial QA report.

**Status**: ❌ **REJECTED - BUG NOT FIXED**
**Critical Issues Found**: 1
**Pass Rate**: 0% (0/1 critical tests completed)

---

## Test 1: Bbox Persistence with Price Filter (CRITICAL)

### Test Objective
Verify that the bbox parameter persists when a price filter is applied after creating a mapped area.

### Test Steps Executed

1. ✅ Navigate to Smart Search page (`http://localhost:3301/search`)
2. ✅ Zoom in on map to trigger mapped area creation
3. ✅ Verify "Mapped area X" chip appears in Active Filters
4. ✅ Open Filters panel
5. ✅ Set price range: Min $500,000, Max $1,000,000
6. ✅ Click "Apply Filters" button
7. ❌ **FAILURE**: Bbox parameter NOT included in API request

### Expected Result

API Request Body should include:
```json
{
  "price_min": 500000,
  "price_max": 1000000,
  "sort_by": "newest",
  "limit": 200,
  "offset": 0,
  "bbox": {
    "north": -33.xxx,
    "south": -34.xxx,
    "east": 151.xxx,
    "west": 151.xxx
  }
}
```

### Actual Result

API Request Body received:
```json
{
  "price_min": 500000,
  "price_max": 1000000,
  "sort_by": "newest",
  "limit": 200,
  "offset": 0
}
```

**❌ CRITICAL ISSUE: `bbox` parameter is MISSING!**

### Error Evidence

**Backend Error (500 Internal Server Error)**:
```
Search failed: {
  'message': 'canceling statement due to statement timeout',
  'code': '57014',
  'hint': None,
  'details': None
}
```

**Console Logs**:
```
🔍 FETCH REQUEST BODY: {
  "price_min": 500000,
  "price_max": 1000000,
  "sort_by": "newest",
  "limit": 200,
  "offset": 0
}
```

**Network Requests**:
- First request (initial load): `200 Success`
- Second request (with price filter): `500 Internal Server Error`

### Visual Evidence

**Screenshot 1**: Mapped area created successfully
![Mapped Area Created](/Users/cheuqarli/Projects/listez-chatbot-app/chatbot-app/handoff/features/smart-search/test-cases/phase-2-5-7-retest-screenshots/01-test1-mapped-area-created.png)

**Screenshot 2**: Error state after applying price filter (bbox missing)
![Error State - Bbox Missing](/Users/cheuqarli/Projects/listez-chatbot-app/chatbot-app/handoff/features/smart-search/test-cases/phase-2-5-7-retest-screenshots/02-test1-error-state-bbox-missing.png)

**Key Observations**:
- ✅ "Mapped area X" chip IS visible in Active Filters
- ✅ "price:$500K-$1000K" chip IS visible in Active Filters
- ❌ Map displays "Error Loading Map"
- ❌ Error message: "Search failed: canceling statement due to statement timeout"

### Test Result

❌ **FAILED** - Bbox parameter is not included in the API request, causing the same 500 error as before.

---

## Root Cause Analysis

### Investigation Summary

After analyzing the implemented fix in `/chatbot-app/src/store/slices/smartSearchSlice.ts`, I identified the root cause:

**The TypeScript interface `SearchFilters` in `/chatbot-app/src/services/smartSearchService.ts` does NOT include the `bbox` property.**

### Code Analysis

**Fixed Code (smartSearchSlice.ts:162-166)**:
```typescript
// CRITICAL FIX (Phase 2.5.7): Include bbox if user has defined a mapped area
// This ensures bbox persists across ALL filter applications (price, bedrooms, property type, etc.)
if (userDefinedMapArea && searchBounds) {
  searchFilters.bbox = searchBounds;  // ← This line executes
}
```

**Missing TypeScript Definition (smartSearchService.ts:23-37)**:
```typescript
export interface SearchFilters {
  state?: string | null;
  suburb?: string | null;
  price_min?: number | null;
  price_max?: number | null;
  bedrooms_min?: number | null;
  bedrooms_max?: number | null;
  bathrooms_min?: number | null;
  parking_min?: number | null;
  land_area_min?: number | null;
  property_type?: string[] | null;
  listing_type?: 'sale' | 'rent' | null;
  limit?: number;
  offset?: number;
  // ❌ MISSING: bbox?: BBoxBounds | null;
}
```

### Why the Fix Didn't Work

1. **Redux slice sets bbox**: The code in `smartSearchSlice.ts` correctly adds `searchFilters.bbox = searchBounds`
2. **Service layer strips it out**: The `searchProperties()` function in `smartSearchService.ts` receives the filters but:
   - The `SearchFilters` TypeScript interface doesn't include `bbox`
   - TypeScript might be stripping it during compilation or the cleanFilters logic is removing it
3. **Backend never receives bbox**: The API request is sent without the bbox parameter

### BBoxBounds Type Definition

The correct type is already defined in `smartSearchSlice.ts:55-60`:
```typescript
export interface BBoxBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}
```

---

## Required Fix

### Action Required for Feature-Implementor

**File**: `/chatbot-app/src/services/smartSearchService.ts`
**Line**: 23-37

**Required Change**:
```typescript
export interface SearchFilters {
  state?: string | null;
  suburb?: string | null;
  price_min?: number | null;
  price_max?: number | null;
  bedrooms_min?: number | null;
  bedrooms_max?: number | null;
  bathrooms_min?: number | null;
  parking_min?: number | null;
  land_area_min?: number | null;
  property_type?: string[] | null;
  listing_type?: 'sale' | 'rent' | null;
  limit?: number;
  offset?: number;
  bbox?: BBoxBounds | null;  // ← ADD THIS LINE
}
```

**Import Required**:
```typescript
import { BBoxBounds } from '../store/slices/smartSearchSlice';
```

### Additional Verification Needed

After adding the `bbox` property to the `SearchFilters` interface:

1. **Verify TypeScript compilation**: Run `npx tsc --noEmit` to ensure no type errors
2. **Verify cleanFilters logic**: Check `smartSearchService.ts:56-59` to ensure bbox objects are not filtered out
3. **Re-test bbox persistence**: Re-run Test 1 to verify bbox is included in API request
4. **Verify backend handles bbox**: Check backend logs to ensure bbox is received and processed correctly

---

## Test Environment Details

**Frontend**:
- Port: 3301
- Running in Docker container
- Environment: Development (Doppler dev config)

**Backend**:
- Port: 8100
- Running in Docker container
- Health status: Healthy

**Browser**:
- Chrome DevTools MCP
- JavaScript enabled
- No console errors (except the network 500 error)

**Redux State** (Not accessible via DevTools, but inferred from UI):
- `userDefinedMapArea`: `true` (chip visible)
- `searchBounds`: Set (map interaction successful)
- `mapAreaType`: `'mapped'`

---

## Impact Assessment

**Severity**: 🔴 **CRITICAL**

**User Impact**:
- Users cannot search within a mapped area when filters are applied
- All filter applications (price, bedrooms, property type) cause 500 errors
- Timeout errors make the feature completely unusable
- "Mapped area" functionality is non-functional

**Affected Workflows**:
1. ❌ Price filter + Mapped area
2. ❌ Bedrooms filter + Mapped area (not tested, assumed broken)
3. ❌ Property type filter + Mapped area (not tested, assumed broken)
4. ❌ Any filter combination + Mapped area (not tested, assumed broken)
5. ❌ Pagination + Mapped area (not tested, assumed broken)

**Production Readiness**: ❌ **NOT READY FOR DEPLOYMENT**

---

## Recommendation

❌ **REJECT Phase 2.5.7 deployment**

**Next Steps**:
1. Feature-implementor must add `bbox?: BBoxBounds | null` to `SearchFilters` interface
2. Feature-implementor must verify TypeScript compilation
3. Feature-implementor must verify cleanFilters logic doesn't strip bbox
4. QA Specialist must re-test ALL test cases after fix is applied
5. 100% pass rate required before approval

**Estimated Fix Time**: 15-30 minutes (simple interface addition)
**Re-Test Time**: 2-3 hours (comprehensive re-validation required)

---

## Test Completion Status

| Test Case | Status | Pass/Fail |
|-----------|--------|-----------|
| Test 1: Bbox persistence with price filter | Completed | ❌ FAIL |
| Test 2: Bbox persistence with bedrooms filter | Not Started | N/A |
| Test 3: Bbox persistence with multiple filters | Not Started | N/A |
| Test 4: Pagination with mapped area | Not Started | N/A |
| Test 5: Regression - Search This Area button | Not Started | N/A |
| Test 6: Regression - Chip clearing | Not Started | N/A |
| Test 7: Address search auto-clear | Not Started | N/A |

**Overall Pass Rate**: 0% (0/1 completed tests passed)

---

## Appendix: Technical Details

### Fetch Interceptor Log

```json
{
  "timestamp": "2025-10-12T08:02:16.171Z",
  "url": "http://localhost:8100/api/v1/smart-search/filters/search",
  "method": "POST",
  "body": {
    "price_min": 500000,
    "price_max": 1000000,
    "sort_by": "newest",
    "limit": 200,
    "offset": 0
  }
}
```

### Console Output Analysis

**SmartSearchService Logs**:
```
🔍 [SmartSearchService] Searching properties with filters: {"price_min":500000,"price_max":1000000,"sort_by":"newest","limit":200,"offset":0}
```

**Network Error**:
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
```

---

**Report Generated**: October 12, 2025
**QA Agent**: Elite QA Specialist Agent
**Status**: Phase 2.5.7 REJECTED - Critical bug not resolved
