# Phase 3: Search and Filter System - Implementation Plan

**Date**: October 20, 2025  
**Status**: 🚀 IN PROGRESS  
**Duration**: 4-5 hours  
**Priority**: 🟡 HIGH

---

## 📋 OVERVIEW

Implement comprehensive search and filtering capabilities for auction discovery. This will enhance user experience by allowing buyers to quickly find relevant auctions.

**Key Features**:
- Full-text search (title + description)
- Category filtering
- Price range filtering
- Status filtering (Open, Closed, All)
- Sort options (newest, ending soon, price: low-high, price: high-low)
- Efficient query optimization

---

## 🎯 TASKS

### **Task 3.1: Backend - Enhanced GetAll Endpoint** (2 hours)

**Files to Modify**:
- `backend/AuctionHouse.Api/Controllers/AuctionsController.cs`
- `backend/AuctionHouse.Infrastructure/Services/AuctionService.cs`
- `backend/AuctionHouse.Core/Interfaces/IAuctionService.cs`

**Implementation Steps**:

1. **Update IAuctionService Interface**
   ```csharp
   Task<IEnumerable<AuctionDto>> GetAllAsync(
       string? search = null,
       int? categoryId = null,
       string? status = null,
       decimal? minPrice = null,
       decimal? maxPrice = null,
       string? sortBy = null
   );
   ```

2. **Implement Filtering Logic in AuctionService**
   - Add LINQ query building
   - Search: `title.Contains(search) || description.Contains(search)`
   - Category: `categoryId == auction.CategoryId`
   - Status: `status == auction.Status`
   - Price range: `startPrice >= minPrice && startPrice <= maxPrice`
   - Sort options:
     - "newest": `OrderByDescending(a => a.CreatedAt)`
     - "ending-soon": `OrderBy(a => a.EndTime)`
     - "price-low": `OrderBy(a => a.StartPrice)`
     - "price-high": `OrderByDescending(a => a.StartPrice)`
   - Default: Order by CreatedAt descending

3. **Update AuctionsController GetAll Endpoint**
   ```csharp
   [HttpGet]
   public async Task<IActionResult> GetAll(
       [FromQuery] string? search,
       [FromQuery] int? categoryId,
       [FromQuery] string? status,
       [FromQuery] decimal? minPrice,
       [FromQuery] decimal? maxPrice,
       [FromQuery] string? sortBy)
   {
       var auctions = await _auctionService.GetAllAsync(
           search, categoryId, status, minPrice, maxPrice, sortBy
       );
       return Ok(auctions);
   }
   ```

**Acceptance Criteria**:
- ✅ Search by title works
- ✅ Search by description works
- ✅ Filter by category works
- ✅ Filter by status works
- ✅ Filter by price range works
- ✅ Sort options work correctly
- ✅ Multiple filters can be combined
- ✅ Query performance is optimized

---

### **Task 3.2: Frontend - Search & Filter UI** (2 hours)

**Files to Create/Modify**:
- `frontend/src/pages/AuctionsPage.tsx` (add search/filter UI)
- `frontend/src/components/AuctionFilters.tsx` (create new component)
- `frontend/src/utils/api.js` (update getAllAuctions method)

**Implementation Steps**:

1. **Create AuctionFilters Component**
   ```typescript
   interface FilterState {
     search: string;
     categoryId: number | null;
     status: string;
     minPrice: number | null;
     maxPrice: number | null;
     sortBy: string;
   }
   ```

   **UI Elements**:
   - Search input with icon
   - Category dropdown (fetch from `/api/categories`)
   - Status radio buttons (All, Open, Closed)
   - Price range inputs (min/max)
   - Sort dropdown
   - "Apply Filters" button
   - "Clear Filters" button

2. **Update api.js**
   ```javascript
   export const getAllAuctions = async (filters = {}) => {
     const params = new URLSearchParams();
     
     if (filters.search) params.append('search', filters.search);
     if (filters.categoryId) params.append('categoryId', filters.categoryId);
     if (filters.status) params.append('status', filters.status);
     if (filters.minPrice) params.append('minPrice', filters.minPrice);
     if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
     if (filters.sortBy) params.append('sortBy', filters.sortBy);
     
     const response = await api.get(`/auctions?${params.toString()}`);
     return response.data;
   };
   ```

3. **Update AuctionsPage**
   - Add state for filter values
   - Add `AuctionFilters` component above auction grid
   - Call `getAllAuctions(filters)` when filters change
   - Show loading state during filtering
   - Show "No results" message if empty

4. **Styling**
   - Responsive filter panel
   - Mobile: Collapsible filter drawer
   - Desktop: Side panel or top bar
   - Clean, intuitive UI

**Acceptance Criteria**:
- ✅ Search input updates results in real-time (debounced)
- ✅ Category filter works
- ✅ Status filter works
- ✅ Price range filter works
- ✅ Sort dropdown works
- ✅ Multiple filters combine correctly
- ✅ Clear filters resets to all auctions
- ✅ Filter state persists during navigation
- ✅ Mobile-friendly UI

---

### **Task 3.3: Testing** (1 hour)

**Test Cases**:

1. **Search Functionality**
   - Search by title
   - Search by description
   - Search with special characters
   - Empty search returns all

2. **Category Filtering**
   - Filter by each category
   - Switch between categories
   - "All Categories" shows all

3. **Status Filtering**
   - Show only open auctions
   - Show only closed auctions
   - Show all statuses

4. **Price Range Filtering**
   - Min price only
   - Max price only
   - Both min and max
   - Invalid ranges (min > max)

5. **Sorting**
   - Sort by newest
   - Sort by ending soon
   - Sort by price (low to high)
   - Sort by price (high to low)

6. **Combined Filters**
   - Search + Category
   - Category + Price Range
   - All filters together

7. **Edge Cases**
   - No results found
   - Invalid filter values
   - SQL injection attempts (sanitize inputs)

**Test Script**: `backend/test-search-filter.ps1`

---

## 📊 EXPECTED OUTCOMES

### Backend Enhancements
- Enhanced `GetAllAsync` method with 6 parameters
- Optimized LINQ queries
- Query performance < 200ms for 1000+ auctions

### Frontend Features
- `AuctionFilters` component (~150 lines)
- Updated `AuctionsPage` with filter integration
- Updated `api.js` with filter parameters
- Responsive filter UI

### User Experience
- Users can find auctions quickly
- Multiple search strategies available
- Intuitive filter interface
- Real-time results

---

## 🚀 IMPLEMENTATION APPROACH

### Step 1: Backend First (1.5 hours)
1. Update `IAuctionService` interface
2. Implement filtering logic in `AuctionService`
3. Update `AuctionsController` endpoint
4. Test with Postman/curl

### Step 2: Frontend Implementation (2 hours)
1. Create `AuctionFilters` component
2. Update `api.js` method
3. Integrate into `AuctionsPage`
4. Add styling

### Step 3: Testing & Refinement (30 minutes)
1. Run test script
2. Fix any bugs
3. Optimize performance
4. Document API changes

---

## 📝 SUCCESS CRITERIA

- ✅ Backend endpoint accepts 6 filter parameters
- ✅ Filtering logic correctly combines multiple criteria
- ✅ Query performance is acceptable
- ✅ Frontend UI is intuitive and responsive
- ✅ All test cases pass
- ✅ No errors in console
- ✅ Mobile-friendly interface

---

## 🔄 NEXT PHASE

After Phase 3 completion, we'll have:
- **Phase 1**: ✅ Critical fixes (100%)
- **Phase 2**: ✅ Transaction system (90%)
- **Phase 3**: ✅ Search & Filter (100%)
- **Phase 4**: User notifications, admin panel, advanced features

Let's implement Phase 3 step by step!
