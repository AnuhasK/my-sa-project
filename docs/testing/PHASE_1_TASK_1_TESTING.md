# Phase 1, Task 1.1: Auction CRUD Testing

**Date**: October 20, 2025  
**Feature**: Auction CRUD Operations  
**Endpoints**: PUT /api/auctions/{id}, DELETE /api/auctions/{id}, GET /api/auctions/my-auctions

---

## 📋 TEST SCENARIOS

### **Test 1: Update Auction (Owner)**
**Endpoint**: `PUT /api/auctions/{id}`  
**Expected**: ✅ Success (200 OK)

**Request**:
```http
PUT http://localhost:5021/api/auctions/1
Authorization: Bearer {seller_token}
Content-Type: application/json

{
  "title": "Updated Vintage Camera",
  "description": "Updated description with more details",
  "endTime": "2025-10-25T18:00:00Z",
  "categoryId": 1
}
```

**Expected Response**: 200 OK with updated auction details

---

### **Test 2: Update Auction (Non-Owner)**
**Endpoint**: `PUT /api/auctions/{id}`  
**Expected**: ❌ 403 Forbidden

**Request**:
```http
PUT http://localhost:5021/api/auctions/1
Authorization: Bearer {different_user_token}
Content-Type: application/json

{
  "title": "Trying to update someone else's auction",
  "description": "This should fail",
  "endTime": "2025-10-25T18:00:00Z",
  "categoryId": 1
}
```

**Expected Response**: 403 Forbidden

---

### **Test 3: Update Auction (Admin)**
**Endpoint**: `PUT /api/auctions/{id}`  
**Expected**: ✅ Success (200 OK)

**Request**:
```http
PUT http://localhost:5021/api/auctions/1
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Admin Updated Title",
  "description": "Admin can update any auction",
  "endTime": "2025-10-25T18:00:00Z",
  "categoryId": 1
}
```

**Expected Response**: 200 OK with updated auction details

---

### **Test 4: Update Auction with Bids**
**Endpoint**: `PUT /api/auctions/{id}`  
**Expected**: ❌ 400 Bad Request

**Prerequisite**: Auction must have at least one bid

**Request**:
```http
PUT http://localhost:5021/api/auctions/{auction_with_bids_id}
Authorization: Bearer {owner_token}
Content-Type: application/json

{
  "title": "Trying to update auction with bids",
  "description": "This should fail",
  "endTime": "2025-10-25T18:00:00Z",
  "categoryId": 1
}
```

**Expected Response**: 400 Bad Request - "Cannot update auction that has bids"

---

### **Test 5: Delete Auction (Owner, No Bids)**
**Endpoint**: `DELETE /api/auctions/{id}`  
**Expected**: ✅ Success (204 No Content)

**Request**:
```http
DELETE http://localhost:5021/api/auctions/2
Authorization: Bearer {seller_token}
```

**Expected Response**: 204 No Content  
**Verification**: Auction status should be "Deleted"

---

### **Test 6: Delete Auction (Non-Owner)**
**Endpoint**: `DELETE /api/auctions/{id}`  
**Expected**: ❌ 403 Forbidden

**Request**:
```http
DELETE http://localhost:5021/api/auctions/1
Authorization: Bearer {different_user_token}
```

**Expected Response**: 403 Forbidden

---

### **Test 7: Delete Auction with Bids**
**Endpoint**: `DELETE /api/auctions/{id}`  
**Expected**: ❌ 400 Bad Request

**Request**:
```http
DELETE http://localhost:5021/api/auctions/{auction_with_bids_id}
Authorization: Bearer {owner_token}
```

**Expected Response**: 400 Bad Request - "Cannot delete auction that has bids"

---

### **Test 8: Get My Auctions**
**Endpoint**: `GET /api/auctions/my-auctions`  
**Expected**: ✅ Success (200 OK)

**Request**:
```http
GET http://localhost:5021/api/auctions/my-auctions
Authorization: Bearer {seller_token}
```

**Expected Response**: 200 OK with array of user's auctions (excluding deleted ones)

---

### **Test 9: Get My Auctions (No Auth)**
**Endpoint**: `GET /api/auctions/my-auctions`  
**Expected**: ❌ 401 Unauthorized

**Request**:
```http
GET http://localhost:5021/api/auctions/my-auctions
```

**Expected Response**: 401 Unauthorized

---

## 🧪 MANUAL TESTING STEPS

### **Step 1: Get Authentication Tokens**

1. **Register/Login as Seller**:
```http
POST http://localhost:5021/api/auth/login
Content-Type: application/json

{
  "email": "seller@test.com",
  "password": "Test123!"
}
```

Save the token as `seller_token`

2. **Register/Login as Another User**:
```http
POST http://localhost:5021/api/auth/login
Content-Type: application/json

{
  "email": "buyer@test.com",
  "password": "Test123!"
}
```

Save the token as `buyer_token`

3. **Login as Admin**:
```http
POST http://localhost:5021/api/auth/login
Content-Type: application/json

{
  "email": "admin@auctionhouse.com",
  "password": "Admin123!"
}
```

Save the token as `admin_token`

---

### **Step 2: Create Test Auction**

```http
POST http://localhost:5021/api/auctions
Authorization: Bearer {seller_token}
Content-Type: application/json

{
  "title": "Test Vintage Camera",
  "description": "A beautiful vintage camera from the 1960s",
  "startPrice": 50.00,
  "startTime": "2025-10-20T10:00:00Z",
  "endTime": "2025-10-27T18:00:00Z",
  "categoryId": 1
}
```

Note the auction ID from the response.

---

### **Step 3: Test Update Endpoint**

**Test 3a: Update as Owner (Should Succeed)**
```http
PUT http://localhost:5021/api/auctions/{auction_id}
Authorization: Bearer {seller_token}
Content-Type: application/json

{
  "title": "Updated Vintage Camera - Now with Leather Case",
  "description": "Updated: Includes original leather case in excellent condition",
  "endTime": "2025-10-28T18:00:00Z",
  "categoryId": 1
}
```

✅ Should return 200 OK with updated auction

**Test 3b: Update as Different User (Should Fail)**
```http
PUT http://localhost:5021/api/auctions/{auction_id}
Authorization: Bearer {buyer_token}
Content-Type: application/json

{
  "title": "Hacked Title",
  "description": "This should not work",
  "endTime": "2025-10-28T18:00:00Z",
  "categoryId": 1
}
```

❌ Should return 403 Forbidden

**Test 3c: Update as Admin (Should Succeed)**
```http
PUT http://localhost:5021/api/auctions/{auction_id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "title": "Admin Moderated Title",
  "description": "Admin can update any auction",
  "endTime": "2025-10-28T18:00:00Z",
  "categoryId": 1
}
```

✅ Should return 200 OK with updated auction

---

### **Step 4: Test Update with Bids**

**Step 4a: Place a Bid**
```http
POST http://localhost:5021/api/bids
Authorization: Bearer {buyer_token}
Content-Type: application/json

{
  "auctionId": {auction_id},
  "amount": 60.00
}
```

**Step 4b: Try to Update (Should Fail)**
```http
PUT http://localhost:5021/api/auctions/{auction_id}
Authorization: Bearer {seller_token}
Content-Type: application/json

{
  "title": "Cannot Update With Bids",
  "description": "This should fail because auction has bids",
  "endTime": "2025-10-28T18:00:00Z",
  "categoryId": 1
}
```

❌ Should return 400 Bad Request with message "Cannot update auction that has bids"

---

### **Step 5: Test Delete Endpoint**

**Step 5a: Create New Auction (No Bids)**
```http
POST http://localhost:5021/api/auctions
Authorization: Bearer {seller_token}
Content-Type: application/json

{
  "title": "Test Auction for Deletion",
  "description": "This auction will be deleted",
  "startPrice": 25.00,
  "startTime": "2025-10-20T10:00:00Z",
  "endTime": "2025-10-27T18:00:00Z",
  "categoryId": 1
}
```

Note the new auction ID.

**Step 5b: Delete as Owner (Should Succeed)**
```http
DELETE http://localhost:5021/api/auctions/{new_auction_id}
Authorization: Bearer {seller_token}
```

✅ Should return 204 No Content

**Step 5c: Verify Deletion**
```http
GET http://localhost:5021/api/auctions/{new_auction_id}
```

✅ Auction should still exist but status should be "Deleted"

**Step 5d: Try to Delete Auction with Bids (Should Fail)**
```http
DELETE http://localhost:5021/api/auctions/{auction_with_bids_id}
Authorization: Bearer {seller_token}
```

❌ Should return 400 Bad Request with message "Cannot delete auction that has bids"

---

### **Step 6: Test Get My Auctions**

**Test 6a: Get Seller's Auctions**
```http
GET http://localhost:5021/api/auctions/my-auctions
Authorization: Bearer {seller_token}
```

✅ Should return array of auctions created by this seller (excluding deleted ones)

**Test 6b: Get Buyer's Auctions (Empty)**
```http
GET http://localhost:5021/api/auctions/my-auctions
Authorization: Bearer {buyer_token}
```

✅ Should return empty array (buyer hasn't created any auctions)

**Test 6c: Get Without Auth (Should Fail)**
```http
GET http://localhost:5021/api/auctions/my-auctions
```

❌ Should return 401 Unauthorized

---

## ✅ TEST RESULTS CHECKLIST

### **Update Endpoint Tests**
- [ ] ✅ Owner can update their auction (no bids)
- [ ] ❌ Non-owner cannot update auction (403)
- [ ] ✅ Admin can update any auction
- [ ] ❌ Cannot update auction with bids (400)
- [ ] ❌ Cannot update closed auction (400)
- [ ] ❌ Cannot update without auth (401)

### **Delete Endpoint Tests**
- [ ] ✅ Owner can delete their auction (no bids)
- [ ] ❌ Non-owner cannot delete auction (403)
- [ ] ✅ Admin can delete any auction
- [ ] ❌ Cannot delete auction with bids (400)
- [ ] ❌ Cannot delete without auth (401)
- [ ] ✅ Deleted auctions have status "Deleted"
- [ ] ✅ Deleted auctions don't appear in "my-auctions"

### **Get My Auctions Tests**
- [ ] ✅ Returns user's auctions only
- [ ] ✅ Excludes deleted auctions
- [ ] ✅ Includes auction details (images, bids count, category)
- [ ] ✅ Ordered by start time (newest first)
- [ ] ❌ Fails without auth (401)

---

## 🔍 VALIDATION QUERIES

### **Check Auction Status in Database**
```sql
SELECT Id, Title, Status, SellerId FROM Auctions WHERE Id = {auction_id};
```

### **Check Bid Count for Auction**
```sql
SELECT COUNT(*) FROM Bids WHERE AuctionId = {auction_id};
```

### **List All User's Auctions**
```sql
SELECT Id, Title, Status, SellerId FROM Auctions WHERE SellerId = {user_id};
```

---

## 📊 EXPECTED OUTCOMES

### **Phase 1, Task 1.1 Complete When:**
- ✅ All endpoints compile and run
- ✅ Update endpoint works with proper authorization
- ✅ Delete endpoint implements soft delete
- ✅ Get my auctions returns filtered results
- ✅ Business rules enforced (can't update/delete with bids)
- ✅ Authorization checks work (owner/admin only)
- ✅ No compilation errors or warnings
- ✅ Frontend api.js methods will now work (updateAuction, deleteAuction, getUserAuctions)

---

## 🚀 NEXT STEPS

After Phase 1.1 completion:
1. ✅ Test with frontend integration
2. ✅ Update Work Plan progress
3. ✅ Commit changes to git
4. ✅ Move to Phase 1, Task 1.2: Bid History Endpoints

---

**Test Document Created**: October 20, 2025  
**Backend Running**: http://localhost:5021  
**Status**: Ready for Testing
