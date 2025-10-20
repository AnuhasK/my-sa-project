# Watchlist Feature - Known Issues

## Issue #1: Heart Icon Click Not Working on AuctionCard
**Date:** October 20, 2025
**Status:** IN PROGRESS - Needs Further Investigation

### Symptoms:
- Heart icon button renders correctly on auction cards
- Hover events work (onMouseEnter detected once)
- Click events seem to reach the handler but console logs don't appear
- Alert popup shows "Please login to add items to your watchlist" even when user is authenticated
- Component render logs show `isAuthenticated: true`

### Investigation Done:
1. ✅ Verified AuthContext is working (isAuthenticated: true in render logs)
2. ✅ Verified token exists in localStorage
3. ✅ Added stopPropagation to prevent parent card onClick interference
4. ✅ Added z-index and pointer-events CSS
5. ✅ Added type="button" to prevent form submission
6. ✅ Moved event.preventDefault() to top of handler
7. ⚠️ Console logs in click handler not appearing despite alert showing

### Suspected Causes:
1. **Closure issue**: Click handler may have stale values from initial render
2. **Event bubbling**: Parent card onClick may still be interfering
3. **React strict mode**: Double rendering causing state sync issues
4. **Browser console filtering**: Logs may be hidden/cleared
5. **Async timing**: Token check happening before context updates

### Attempted Fixes:
- Changed from `token` (context) to `localStorage.getItem('token')` for fresh value
- Added extensive console logging
- Added pointer-events CSS
- Increased z-index to 20
- Added stopPropagation on parent div

### Next Steps:
1. Test watchlist functionality on AuctionDetailsPage (different component structure)
2. Compare behavior between HomePage and AuctionListingPage
3. Check if React DevTools shows correct auth state at click time
4. Consider using useCallback for click handler
5. Test with React strict mode disabled
6. Try removing all parent onClick handlers temporarily

### Workaround:
Implement watchlist toggle on AuctionDetailsPage first, which has a different component structure and may not have the same issues.

---

## Components Status:
- ✅ Backend API: All 5 endpoints working (WatchlistService, WatchlistController)
- ✅ Frontend API: All 5 methods implemented (api.js)
- ⚠️ AuctionCard: Heart icon renders but click handler issues
- ✅ WatchlistPage: Component created and ready
- ✅ Header: Navigation link with count badge added
- ⏳ AuctionDetailsPage: Watchlist feature not yet implemented
