# Phase 2: Auction Core Features - Testing Guide

## Overview
This document provides comprehensive testing procedures for all Phase 2 features implemented in the auction platform.

**Phase 2 Completion Date:** October 20, 2025  
**Total Tasks Completed:** 8 out of 10 (80%)  
**Remaining:** Real-time SignalR updates, end-to-end testing

---

## ✅ Completed Features

### 1. Image Ordering System
**Feature:** Auction images now have `IsPrimary` and `DisplayOrder` fields for proper gallery organization.

**Database Changes:**
- Migration: `20251020174022_AddImageOrderingFields`
- New columns: `IsPrimary` (bit), `DisplayOrder` (int)

**Backend Changes:**
- `AuctionImage.cs`: Added IsPrimary and DisplayOrder properties
- `AuctionService.cs`: Updated all image queries to order by IsPrimary first, then DisplayOrder

**Testing Steps:**
1. Create an auction with multiple images in admin dashboard
2. Verify first image is automatically set as primary (IsPrimary = true)
3. Upload additional images and verify DisplayOrder increments
4. Check auction detail page shows primary image first
5. Verify thumbnail gallery displays in correct order

---

### 2. Enhanced Auction Validation
**Feature:** Comprehensive validation rules for auction creation and updates.

**Validation Rules:**
- ✅ Title: 5-100 characters (required)
- ✅ Description: 20-1000 characters (required)
- ✅ StartPrice: Must be > $0
- ✅ StartTime: Must be in the future
- ✅ EndTime: Must be after StartTime
- ✅ Minimum Duration: 1 hour
- ✅ CategoryId: Optional

**Backend Changes:**
- `AuctionDtos.cs`: Added DataAnnotations validation attributes
- `AuctionService.CreateAsync`: Added time validation logic

**Testing Steps:**
1. **Valid Auction Creation:**
   ```
   Title: "Vintage Rolex Watch" (valid length)
   Description: "Beautiful vintage Rolex in excellent condition..." (20+ chars)
   StartPrice: $500 (> 0)
   StartTime: Tomorrow 10:00 AM (future)
   EndTime: Tomorrow 8:00 PM (10 hours duration)
   Category: Watches
   Expected: ✅ Success
   ```

2. **Invalid Title (too short):**
   ```
   Title: "Wat" (3 chars)
   Expected: ❌ "Title must be between 5 and 100 characters"
   ```

3. **Invalid Description (too short):**
   ```
   Description: "Nice watch" (10 chars)
   Expected: ❌ "Description must be between 20 and 1000 characters"
   ```

4. **Invalid StartTime (past):**
   ```
   StartTime: Yesterday
   Expected: ❌ "Start time must be in the future"
   ```

5. **Invalid Duration (too short):**
   ```
   StartTime: Tomorrow 10:00 AM
   EndTime: Tomorrow 10:30 AM (30 minutes)
   Expected: ❌ "Auction must run for at least 1 hour"
   ```

6. **Invalid EndTime (before StartTime):**
   ```
   StartTime: Tomorrow 10:00 AM
   EndTime: Today 5:00 PM
   Expected: ❌ "End time must be after start time"
   ```

---

### 3. Auction Image Management Endpoints
**Feature:** CRUD operations for managing auction images.

**New Endpoints:**
1. `POST /api/auctions/{id}/images` - Upload and link image
2. `DELETE /api/auctions/{id}/images/{imageId}` - Delete image
3. `PUT /api/auctions/{id}/images/{imageId}/primary` - Set primary image
4. `PUT /api/auctions/{id}/images/reorder` - Reorder images

**Authorization:** Admin or auction seller only

**Testing Steps:**

#### Test 1: Upload Image
```http
POST /api/auctions/5/images
Authorization: Bearer {admin_or_seller_token}
Content-Type: multipart/form-data

file: [image file]
```
**Expected Response:**
```json
{
  "id": 15,
  "url": "http://localhost:5021/uploads/abc123.jpg",
  "isPrimary": false,
  "displayOrder": 2
}
```

#### Test 2: Set Primary Image
```http
PUT /api/auctions/5/images/15/primary
Authorization: Bearer {admin_or_seller_token}
```
**Expected:** 
- Previous primary image: IsPrimary = false
- Image 15: IsPrimary = true
- Response: 200 OK

#### Test 3: Reorder Images
```http
PUT /api/auctions/5/images/reorder
Authorization: Bearer {admin_or_seller_token}
Content-Type: application/json

[
  { "imageId": 15, "displayOrder": 0 },
  { "imageId": 14, "displayOrder": 1 },
  { "imageId": 13, "displayOrder": 2 }
]
```
**Expected:** Images display in new order on auction detail page

#### Test 4: Delete Image
```http
DELETE /api/auctions/5/images/14
Authorization: Bearer {admin_or_seller_token}
```
**Expected:**
- Image file deleted from storage
- Image removed from database
- If deleted image was primary, first remaining image becomes primary

#### Test 5: Authorization Check
```http
POST /api/auctions/5/images
Authorization: Bearer {different_seller_token}

file: [image file]
```
**Expected:** 403 Forbidden (only auction owner or admin can manage images)

---

### 4. Enhanced Bidding Validation
**Feature:** Comprehensive bid validation to prevent invalid bids.

**Validation Rules:**
- ✅ Auction must exist
- ✅ Auction status must be "Open" or "Active"
- ✅ Current time must be between StartTime and EndTime
- ✅ Bidder cannot be the auction seller
- ✅ Bid amount must be > CurrentPrice + $1.00
- ✅ Anti-sniping: Extends auction by 15 seconds if bid placed in last 15 seconds

**Backend Changes:**
- `BidService.PlaceBidAsync`: Enhanced validation logic
- Added detailed error messages for each validation scenario

**Testing Steps:**

#### Test 1: Valid Bid
```json
POST /api/bids
Authorization: Bearer {buyer_token}
Content-Type: application/json

{
  "auctionId": 5,
  "amount": 550.00
}
```
**Given:** CurrentPrice = $500  
**Expected:** ✅ Success, CurrentPrice updated to $550

#### Test 2: Bid Too Low
```json
{
  "auctionId": 5,
  "amount": 500.50
}
```
**Given:** CurrentPrice = $500  
**Expected:** ❌ "Bid must be at least $501.00 (current price + $1.00)"

#### Test 3: Seller Bidding on Own Auction
```http
POST /api/bids
Authorization: Bearer {seller_token_for_auction_5}

{
  "auctionId": 5,
  "amount": 600.00
}
```
**Expected:** ❌ "You cannot bid on your own auction"

#### Test 4: Auction Not Started
```json
{
  "auctionId": 10,
  "amount": 100.00
}
```
**Given:** Auction StartTime = Tomorrow  
**Expected:** ❌ "Auction has not started yet"

#### Test 5: Auction Ended
```json
{
  "auctionId": 3,
  "amount": 200.00
}
```
**Given:** Auction EndTime = Yesterday  
**Expected:** ❌ "Auction has ended"

#### Test 6: Auction Not Open
```json
{
  "auctionId": 7,
  "amount": 300.00
}
```
**Given:** Auction Status = "Pending"  
**Expected:** ❌ "Auction is not open for bidding"

#### Test 7: Anti-Sniping Extension
```json
{
  "auctionId": 5,
  "amount": 600.00
}
```
**Given:** 
- Current time = 7:59:50 PM
- EndTime = 8:00:00 PM (10 seconds remaining)

**Expected:** 
- ✅ Bid accepted
- EndTime extended to 8:00:15 PM (15 seconds added)

---

### 5. Bid History with Privacy
**Feature:** Public bid history endpoint with username masking for privacy.

**Endpoint:** `GET /api/bids/auction/{auctionId}`  
**Authorization:** None required (public)  
**Username Masking:** Shows first and last character only (e.g., "j***n" for "john")

**Backend Changes:**
- `BidService.GetBidsForAuctionAsync`: Added MaskUsername helper method
- Usernames transformed to privacy-friendly format

**Testing Steps:**

#### Test 1: Fetch Bid History
```http
GET /api/bids/auction/5
```
**Expected Response:**
```json
[
  {
    "id": 45,
    "auctionId": 5,
    "auctionTitle": "Vintage Rolex Watch",
    "bidderId": 12,
    "bidderName": "j***n",
    "amount": 650.00,
    "timestamp": "2025-10-20T14:30:00Z",
    "isWinning": true
  },
  {
    "id": 44,
    "auctionId": 5,
    "bidderId": 8,
    "bidderName": "s***h",
    "amount": 600.00,
    "timestamp": "2025-10-20T14:15:00Z",
    "isWinning": false
  },
  {
    "id": 43,
    "auctionId": 5,
    "bidderId": 12,
    "bidderName": "j***n",
    "amount": 550.00,
    "timestamp": "2025-10-20T14:00:00Z",
    "isWinning": false
  }
]
```

**Verify:**
- ✅ Bids ordered by amount (highest first), then by timestamp
- ✅ Highest bid marked with `isWinning: true`
- ✅ Usernames masked (only first and last character visible)
- ✅ All bids for the auction returned

---

### 6. Frontend Bid Placement Integration
**Feature:** Connected bid form to backend API with proper error handling.

**Component:** `AuctionDetailsPage.tsx`  
**Changes:** Updated `handlePlaceBid` function

**Flow:**
1. User enters bid amount
2. Validates bid >= minBid on client side
3. Gets JWT token from localStorage
4. Calls `api.placeBid(auctionId, amount, token)`
5. On success: Clears form, refreshes auction data and bid history, shows success alert
6. On error: Shows error message with validation details

**Testing Steps:**

#### Test 1: Successful Bid (UI)
1. Navigate to auction detail page (auction must be Open/Active)
2. Enter bid amount >= minBid (e.g., $550 when minBid is $501)
3. Click "Place Bid" button
4. **Verify:**
   - ✅ Success alert displayed
   - ✅ Bid form cleared
   - ✅ Current price updated to $550
   - ✅ Bid count incremented
   - ✅ Bid history refreshed with new bid at top
   - ✅ Minimum bid updated to $551

#### Test 2: Invalid Bid Amount (UI)
1. Enter bid below minimum (e.g., $400 when minBid is $501)
2. Click "Place Bid" button
3. **Verify:**
   - ✅ Alert: "Bid must be at least $501"
   - ✅ Form not cleared
   - ✅ No API call made

#### Test 3: Not Logged In (UI)
1. Logout
2. Navigate to auction detail page
3. Enter bid amount
4. Click "Place Bid"
5. **Verify:**
   - ✅ Alert: "Please login to place a bid"
   - ✅ Bid not placed

#### Test 4: Seller Tries to Bid (UI)
1. Login as auction seller
2. Navigate to own auction
3. Enter bid amount
4. Click "Place Bid"
5. **Verify:**
   - ✅ Error alert: "You cannot bid on your own auction"
   - ✅ Bid not placed

#### Test 5: Admin View (UI)
1. Login as admin
2. Navigate to any auction
3. **Verify:**
   - ✅ Bid form replaced with admin notice
   - ✅ Message: "Admin View: Bidding is disabled for admin accounts"

---

## 🔄 SignalR Real-Time Updates (Pending - Task 9)

**Status:** Not yet implemented  
**Priority:** Medium  
**Estimated Time:** 2-3 hours

**Implementation Plan:**
1. Frontend: Add SignalR client connection in AuctionDetailsPage
2. Join auction-specific group when viewing auction
3. Listen for "BidPlaced" events
4. Update currentBid, bidCount, and bidHistory when event received
5. Show notification toast when outbid

**Backend:** Already configured! SignalR hub and broadcasting in BidsController works.

**Sample Code (for future implementation):**
```typescript
// In AuctionDetailsPage.tsx
useEffect(() => {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5021/auctionHub")
    .build();

  connection.start().then(() => {
    connection.invoke("JoinAuction", auctionId);
    
    connection.on("BidPlaced", (data) => {
      // Update auction state
      setAuction(prev => ({
        ...prev,
        currentBid: data.Amount,
        bids: prev.bids + 1,
        minBid: data.Amount + 50
      }));
      
      // Refresh bid history
      fetchBidHistory();
    });
  });

  return () => {
    connection.invoke("LeaveAuction", auctionId);
    connection.stop();
  };
}, [auctionId]);
```

---

## 🧪 End-to-End Testing Checklist (Task 10)

### Pre-Testing Setup
- [ ] Backend running on port 5021
- [ ] Frontend running on dev server
- [ ] Database has test data (users, categories, auctions)
- [ ] At least 2 test user accounts (1 admin, 1 regular user)

### Test Scenario 1: Admin Creates Auction with Images
- [ ] Login as admin
- [ ] Navigate to admin dashboard
- [ ] Click "Create Auction"
- [ ] Fill in valid auction details
- [ ] Upload 3 images
- [ ] Set second image as primary
- [ ] Reorder images (drag-drop if implemented)
- [ ] Save auction
- [ ] Verify auction appears in listings
- [ ] Navigate to auction detail page
- [ ] Verify primary image displays first
- [ ] Verify thumbnail gallery shows correct order

### Test Scenario 2: User Places Bids
- [ ] Logout admin
- [ ] Login as regular user
- [ ] Navigate to active auction (not own auction)
- [ ] Attempt to place bid below minimum → Verify error
- [ ] Place valid bid → Verify success
- [ ] Verify current price updated
- [ ] Verify bid appears in bid history (username masked)
- [ ] Verify bid count incremented
- [ ] Attempt to place another bid below new minimum → Verify error
- [ ] Place higher bid → Verify success

### Test Scenario 3: Validation Edge Cases
- [ ] Try to bid on own auction → Verify error
- [ ] Try to bid on closed auction → Verify error
- [ ] Try to bid on not-yet-started auction → Verify error
- [ ] Try to create auction with start time in past → Verify error
- [ ] Try to create auction with < 1 hour duration → Verify error

### Test Scenario 4: Image Management
- [ ] Login as auction owner
- [ ] Navigate to own auction
- [ ] Upload additional image
- [ ] Verify new image added to gallery
- [ ] Change primary image
- [ ] Verify gallery updates
- [ ] Delete an image
- [ ] Verify image removed from gallery
- [ ] If deleted primary, verify new primary selected

### Test Scenario 5: Bid History Privacy
- [ ] View bid history as anonymous user
- [ ] Verify all usernames are masked (e.g., "j***n")
- [ ] Verify bids ordered by amount (highest first)
- [ ] Verify winning bid highlighted

---

## 📊 Test Results Template

```markdown
## Test Execution Report
**Date:** [Date]  
**Tester:** [Name]  
**Environment:** Development

### Test Results Summary
| Test Case | Status | Notes |
|-----------|--------|-------|
| Image Ordering | ✅ Pass |  |
| Auction Validation | ✅ Pass |  |
| Image Management API | ✅ Pass |  |
| Bidding Validation | ✅ Pass |  |
| Bid History Privacy | ✅ Pass |  |
| Frontend Bid Placement | ✅ Pass |  |
| SignalR Real-time | ⏳ Pending |  |
| E2E Full Flow | ⏳ Pending |  |

### Issues Found
1. [Issue description]
   - **Severity:** High/Medium/Low
   - **Steps to Reproduce:**
   - **Expected vs Actual:**
   - **Status:** Open/Fixed

### Recommendations
1. [Recommendation]
```

---

## 🎯 Success Criteria
Phase 2 is considered complete when:
- ✅ All 8 backend tasks pass unit/integration tests
- ✅ All validation rules enforced correctly
- ✅ Image management works end-to-end
- ✅ Bidding flow works with proper error handling
- ✅ Bid history displays correctly with privacy
- ⏳ SignalR real-time updates work (Task 9)
- ⏳ Full end-to-end test passes (Task 10)

**Current Status:** 80% Complete (8/10 tasks done)
