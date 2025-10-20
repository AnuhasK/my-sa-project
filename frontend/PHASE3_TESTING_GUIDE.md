# Phase 3: Search & Filter Frontend - Testing Guide

**Date**: October 20, 2025  
**Frontend URL**: http://localhost:5173  
**Backend URL**: http://localhost:5021

---

## 🚀 GETTING STARTED

### Prerequisites
- ✅ Backend is running on port 5021
- ✅ Frontend is running on port 5173

### Access the Application
1. Open browser: http://localhost:5173
2. Navigate to auction listing page

---

## 🧪 TEST PLAN

### Test 1: Search Functionality ⌨️

**Objective**: Test real-time search with debounce

**Steps**:
1. Go to Auction Listing page
2. Type "guitar" in the search box
3. Wait 500ms (search auto-applies)
4. **Expected**: Should show 1 auction (Vintage Gibson Les Paul)
5. Clear search and type "test"
6. **Expected**: Should show multiple test auctions
7. Type "xyznonexistent"
8. **Expected**: Should show "No results" message

**Success Criteria**:
- ✅ Search auto-applies after typing stops
- ✅ Results update without clicking button
- ✅ Case-insensitive search works
- ✅ Empty results show helpful message

---

### Test 2: Category Filter 📂

**Objective**: Filter auctions by category

**Steps**:
1. Click the Category dropdown
2. Select "Electronics"
3. Click "Apply Filters"
4. **Expected**: Should show 18 Electronics auctions
5. Change to "Musical Instruments"
6. Click "Apply Filters"
7. **Expected**: Should show only musical instruments
8. Select "All Categories"
9. **Expected**: Should show all auctions

**Success Criteria**:
- ✅ Category dropdown populated from backend
- ✅ Filtering works correctly
- ✅ Results update after applying

---

### Test 3: Status Filter 🔴🟢

**Objective**: Filter by auction status

**Steps**:
1. Select "Open" radio button
2. Click "Apply Filters"
3. **Expected**: Should show only 4 open auctions
4. Verify all results have "Open" status
5. Select "Closed" radio button
6. Click "Apply Filters"
7. **Expected**: Should show closed auctions
8. Select "All" radio button
9. **Expected**: Should show all auctions (23 total)

**Success Criteria**:
- ✅ Radio buttons work correctly
- ✅ Only matching status shown
- ✅ Status badge visible on cards

---

### Test 4: Price Range Filter 💰

**Objective**: Filter by price range

**Steps**:
1. Enter Min Price: 100
2. Enter Max Price: 1000
3. Click "Apply Filters"
4. **Expected**: Should show 14 auctions between $100-$1000
5. Check some auction prices to verify
6. Change to Min: 1000, Max: 5000
7. **Expected**: Should show higher-priced items
8. Clear price fields
9. **Expected**: All auctions shown

**Success Criteria**:
- ✅ Price filtering works correctly
- ✅ All results within range
- ✅ Empty fields = no filter applied

---

### Test 5: Sort Options 🔀

**Objective**: Test all sorting options

**Steps**:
1. **Sort: "Newest First"**
   - Click "Apply Filters"
   - **Expected**: Latest auctions first
   
2. **Sort: "Ending Soon"**
   - Select from dropdown
   - Click "Apply Filters"
   - **Expected**: Auctions ending soonest at top
   
3. **Sort: "Price: Low to High"**
   - Select from dropdown
   - Click "Apply Filters"
   - **Expected**: First auction ~$25, last ~$9500
   
4. **Sort: "Price: High to Low"**
   - Select from dropdown
   - Click "Apply Filters"
   - **Expected**: First auction ~$9500, last ~$25

**Success Criteria**:
- ✅ All sort options work
- ✅ Results in correct order
- ✅ Visual order matches prices

---

### Test 6: Combined Filters 🎯

**Objective**: Test multiple filters together

**Steps**:
1. Enter search: "test"
2. Select Category: "Electronics"
3. Select Status: "Open"
4. Enter Min Price: 50
5. Enter Max Price: 500
6. Select Sort: "Price: Low to High"
7. Click "Apply Filters"
8. **Expected**: Shows only open electronics with "test" in title/description, priced $50-$500, sorted by price

**Success Criteria**:
- ✅ All filters combine with AND logic
- ✅ Results match all criteria
- ✅ No errors or crashes

---

### Test 7: Clear Filters 🔄

**Objective**: Reset all filters to default

**Steps**:
1. Apply several filters (search, category, status, price)
2. Click "Clear All" button
3. **Expected**:
   - Search box cleared
   - Category reset to "All Categories"
   - Status reset to "All"
   - Price fields cleared
   - Sort reset to "Newest"
   - All 23 auctions displayed

**Success Criteria**:
- ✅ All fields reset to default
- ✅ Results show all auctions
- ✅ No filters remain active

---

### Test 8: Responsive Design 📱

**Objective**: Test mobile/tablet layouts

**Steps**:
1. **Desktop View** (> 1024px)
   - **Expected**: Filters in horizontal grid layout
   - 6 filter fields visible in one row
   
2. **Tablet View** (768px - 1024px)
   - Resize browser window
   - **Expected**: Filters in 2-column layout
   
3. **Mobile View** (< 768px)
   - Resize to phone width
   - **Expected**: 
     - Single column layout
     - Filters stack vertically
     - Buttons full width
     - Easy to tap/interact

**Success Criteria**:
- ✅ Layout adapts to screen size
- ✅ No horizontal scrolling
- ✅ All elements accessible
- ✅ Touch-friendly on mobile

---

### Test 9: Loading States ⏳

**Objective**: Verify loading indicators

**Steps**:
1. Apply a filter
2. **During loading**:
   - **Expected**: Spinning loader visible
   - "Loading auctions..." message shown
3. **After loading**:
   - **Expected**: Loader disappears
   - Results displayed

**Success Criteria**:
- ✅ Loading spinner shows
- ✅ User knows data is loading
- ✅ Smooth transition to results

---

### Test 10: Error Handling ❌

**Objective**: Test error states

**Steps**:
1. Stop the backend server
2. Apply a filter
3. **Expected**: 
   - Error message displayed
   - "Failed to load auctions" message
   - No crash or blank page
4. Restart backend
5. Try again
6. **Expected**: Works normally

**Success Criteria**:
- ✅ Graceful error handling
- ✅ User-friendly error message
- ✅ Can recover when backend returns

---

## 📊 EXPECTED DATA

Based on backend tests, you should see:

- **Total Auctions**: 23
- **Open Auctions**: 4
- **Closed Auctions**: ~15
- **Electronics Category**: 18 auctions
- **Price Range $100-$1000**: 14 auctions
- **Search "guitar"**: 1 auction

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: "Cannot connect to backend"
**Solution**: Ensure backend is running on port 5021
```powershell
cd backend
dotnet run --project AuctionHouse.Api
```

### Issue 2: "No auctions showing"
**Solution**: 
- Check browser console for errors (F12)
- Verify backend URL in api.js is correct
- Try "Clear All" filters button

### Issue 3: "Search not working"
**Solution**:
- Wait 500ms after typing (debounce delay)
- Or click "Apply Filters" manually
- Check for JavaScript errors in console

### Issue 4: "Categories dropdown empty"
**Solution**:
- Backend may not have returned categories
- Check `/api/categories` endpoint is working
- Verify database has category data

### Issue 5: "Filters not applying"
**Solution**:
- Click "Apply Filters" button
- Check network tab in browser (F12)
- Verify API call is being made

---

## 🎯 SUCCESS CHECKLIST

After testing, verify:

- [ ] Search works with debounce
- [ ] All 6 filters functional
- [ ] Sort options work correctly
- [ ] Combined filters work
- [ ] Clear filters resets everything
- [ ] Loading states show properly
- [ ] Error handling works
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] Performance is good (< 1s load)

---

## 📸 WHAT TO LOOK FOR

### Visual Indicators
- **Filter Component**: Clean white card above auction listings
- **Category Dropdown**: Shows all backend categories
- **Status Radio Buttons**: Three options (All/Open/Closed)
- **Price Inputs**: Two number fields with $ placeholder
- **Sort Dropdown**: Four sort options
- **Action Buttons**: Blue "Apply Filters", Gray "Clear All"

### Auction Cards
- **Image**: Auction photo or placeholder
- **Title**: Auction name
- **Price**: Current bid/price with $ formatting
- **Time Left**: Human-readable format (2d 14h, 5h 42m, etc.)
- **Category Badge**: Category name
- **Status**: Visual indicator if ending soon

---

## 🚀 NEXT STEPS AFTER TESTING

If all tests pass:
1. ✅ Mark Phase 3 as 100% complete
2. 🎉 Celebrate! Major milestone achieved
3. 📝 Document any issues found
4. 🔄 Move to Phase 4 or fix Phase 2 bid issue

If issues found:
1. 📋 List all problems discovered
2. 🔧 Prioritize fixes (critical vs. nice-to-have)
3. 🛠️ Implement fixes
4. 🧪 Re-test

---

## 💡 TESTING TIPS

1. **Use Browser DevTools**:
   - F12 to open console
   - Check Network tab for API calls
   - Look for red errors in console

2. **Test Systematically**:
   - One filter at a time first
   - Then combine filters
   - Always try "Clear All" between tests

3. **Check Data Consistency**:
   - Count results vs. expected
   - Verify prices are in range
   - Confirm status matches filter

4. **Test Edge Cases**:
   - Empty search
   - Very high/low prices
   - No results scenarios
   - All filters at once

---

## 📞 SUPPORT

If you encounter issues:
1. Check browser console for errors
2. Verify both backend and frontend are running
3. Try clearing browser cache
4. Restart both servers if needed

**Happy Testing! 🎉**
