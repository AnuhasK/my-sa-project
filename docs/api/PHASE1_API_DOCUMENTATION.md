# Phase 1 API Documentation
## Backend/Frontend Gap Closure - New Endpoints

This document describes all new endpoints implemented in Phase 1 to fix the backend/frontend integration gaps.

---

## 📋 Table of Contents
1. [Auction CRUD Endpoints](#auction-crud-endpoints)
2. [Bid History Endpoints](#bid-history-endpoints)
3. [User Profile Endpoints](#user-profile-endpoints)
4. [Logout Endpoint](#logout-endpoint)
5. [Authentication & Authorization](#authentication--authorization)

---

## 🏠 Auction CRUD Endpoints

### 1. Update Auction
**Endpoint:** `PUT /api/auctions/{id}`  
**Auth Required:** Yes (JWT Bearer Token)  
**Description:** Update an existing auction. Only the auction creator can update it. Cannot update if bids exist.

**Request Body:**
```json
{
  "title": "string",
  "description": "string", 
  "endTime": "2025-12-31T23:59:59Z",
  "categoryId": 1
}
```

**Success Response (200):**
```json
{
  "id": 1,
  "title": "Updated Auction Title",
  "description": "Updated description",
  "startPrice": 100.00,
  "currentPrice": 100.00,
  "endTime": "2025-12-31T23:59:59Z",
  "status": "Active",
  "sellerId": 1,
  "categoryId": 1
}
```

**Error Responses:**
- `401 Unauthorized` - No valid token provided
- `403 Forbidden` - User is not the auction creator
- `404 Not Found` - Auction not found
- `400 Bad Request` - Cannot update auction with existing bids

**Business Rules:**
- Only auction creator can update
- Cannot update if auction has bids
- Cannot update `startPrice` (immutable)
- `endTime` must be in the future

---

### 2. Delete Auction
**Endpoint:** `DELETE /api/auctions/{id}`  
**Auth Required:** Yes (JWT Bearer Token)  
**Description:** Soft delete an auction by setting status to "Deleted". Only creator can delete. Cannot delete if bids exist.

**Success Response (204):** No content

**Error Responses:**
- `401 Unauthorized` - No valid token provided
- `403 Forbidden` - User is not the auction creator
- `404 Not Found` - Auction not found
- `400 Bad Request` - Cannot delete auction with existing bids

**Business Rules:**
- Only auction creator can delete
- Cannot delete if auction has bids
- Soft delete (sets status = "Deleted")
- Auction remains in database for audit trail

---

### 3. Get My Auctions
**Endpoint:** `GET /api/auctions/my-auctions`  
**Auth Required:** Yes (JWT Bearer Token)  
**Description:** Get all auctions created by the authenticated user.

**Success Response (200):**
```json
[
  {
    "id": 1,
    "title": "Auction Title",
    "description": "Auction description",
    "startPrice": 100.00,
    "currentPrice": 150.00,
    "endTime": "2025-12-31T23:59:59Z",
    "status": "Active",
    "sellerId": 1,
    "categoryId": 1
  }
]
```

**Error Responses:**
- `401 Unauthorized` - No valid token provided

**Notes:**
- Returns empty array if user has no auctions
- Includes all statuses (Active, Closed, Deleted)
- Ordered by creation date (newest first)

---

## 📊 Bid History Endpoints

### 4. Get Bids for Auction
**Endpoint:** `GET /api/bids/auction/{auctionId}`  
**Auth Required:** No (Public endpoint)  
**Description:** Get all bids for a specific auction with winning status indicator.

**Success Response (200):**
```json
[
  {
    "id": 1,
    "amount": 150.00,
    "bidTime": "2025-10-20T10:30:00Z",
    "auctionId": 1,
    "auctionTitle": "Auction Title",
    "bidderId": 2,
    "bidderUsername": "john_doe",
    "isWinning": true
  },
  {
    "id": 2,
    "amount": 120.00,
    "bidTime": "2025-10-20T09:15:00Z",
    "auctionId": 1,
    "auctionTitle": "Auction Title",
    "bidderId": 3,
    "bidderUsername": "jane_smith",
    "isWinning": false
  }
]
```

**Error Responses:**
- `404 Not Found` - Auction not found

**Notes:**
- Returns empty array if no bids exist
- `isWinning` flag = true for highest bid
- Ordered by amount (highest first)
- Public endpoint - no authentication required

---

### 5. Get User Bids
**Endpoint:** `GET /api/bids/my-bids`  
**Auth Required:** Yes (JWT Bearer Token)  
**Description:** Get all bids placed by the authenticated user, grouped by auction.

**Success Response (200):**
```json
[
  {
    "id": 1,
    "amount": 150.00,
    "bidTime": "2025-10-20T10:30:00Z",
    "auctionId": 1,
    "auctionTitle": "Auction Title",
    "bidderId": 2,
    "bidderUsername": "john_doe",
    "isWinning": true
  },
  {
    "id": 3,
    "amount": 80.00,
    "bidTime": "2025-10-19T14:20:00Z",
    "auctionId": 2,
    "auctionTitle": "Another Auction",
    "bidderId": 2,
    "bidderUsername": "john_doe",
    "isWinning": false
  }
]
```

**Error Responses:**
- `401 Unauthorized` - No valid token provided

**Notes:**
- Returns empty array if user has no bids
- `isWinning` indicates if user's bid is currently winning for that auction
- Groups by auction and determines winning status per auction
- Ordered by bid time (newest first)

---

## 👤 User Profile Endpoints

### 6. Get Current User
**Endpoint:** `GET /api/auth/me`  
**Auth Required:** Yes (JWT Bearer Token)  
**Description:** Get the profile of the currently authenticated user.

**Success Response (200):**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@local",
  "role": "Admin"
}
```

**Error Responses:**
- `401 Unauthorized` - No valid token or invalid token
- `404 Not Found` - User not found in database

**Security Notes:**
- `passwordHash` is **never** included in response
- Token must be valid and not revoked
- User ID extracted from JWT claims

---

## 🔒 Logout Endpoint

### 7. Logout
**Endpoint:** `POST /api/auth/logout`  
**Auth Required:** Yes (JWT Bearer Token)  
**Description:** Logout the current user by revoking their JWT token.

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - No valid token provided

**How It Works:**
1. Token is extracted from Authorization header
2. Token is decoded to get expiration time
3. Token is added to `RevokedTokens` table with:
   - Token string
   - Revoked timestamp
   - Expiration timestamp
   - User ID
   - Reason: "User logout"
4. `TokenRevocationMiddleware` checks all requests against revoked tokens
5. Revoked tokens return 401 Unauthorized

**Notes:**
- Token becomes immediately invalid after logout
- Token remains in revocation list until natural expiration
- New login generates new valid token
- Middleware checks revocation before authorization

---

## 🔐 Authentication & Authorization

### JWT Bearer Authentication
All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Token Structure
JWT contains the following claims:
- `ClaimTypes.NameIdentifier` - User ID
- `ClaimTypes.Name` - Username
- `ClaimTypes.Email` - User email
- `ClaimTypes.Role` - User role (Admin/User)

### Token Revocation Middleware
The `TokenRevocationMiddleware` runs after authentication and:
1. Extracts token from Authorization header
2. Checks if token exists in `RevokedTokens` table
3. Verifies token hasn't expired naturally
4. Returns 401 if token is revoked

### Authentication Flow
1. **Login** → `POST /api/auth/login` → Receive JWT token
2. **Use Token** → Include in Authorization header for protected endpoints
3. **Logout** → `POST /api/auth/logout` → Token revoked
4. **Access After Logout** → Any request with revoked token → 401 Unauthorized

---

## 📝 Testing

All endpoints have been tested with automated PowerShell scripts:
- `test-auction-crud.ps1` - Tests auction CRUD operations
- `test-bid-history.ps1` - Tests bid history endpoints
- `test-user-profile.ps1` - Tests user profile endpoint
- `test-logout.ps1` - Tests logout and token revocation
- `run-all-phase1-tests.ps1` - Master test runner

**Overall Test Results:** 100% pass rate across all endpoints

---

## 🎯 Frontend Integration

These endpoints fix the following frontend methods in `api.js`:

| Frontend Method | Backend Endpoint | Status |
|----------------|------------------|--------|
| `api.updateAuction()` | `PUT /api/auctions/{id}` | ✅ Fixed |
| `api.deleteAuction()` | `DELETE /api/auctions/{id}` | ✅ Fixed |
| `api.getUserAuctions()` | `GET /api/auctions/my-auctions` | ✅ Fixed |
| `api.getBidsForAuction()` | `GET /api/bids/auction/{id}` | ✅ Fixed |
| `api.getUserBids()` | `GET /api/bids/my-bids` | ✅ Fixed |
| `api.getCurrentUser()` | `GET /api/auth/me` | ✅ Fixed |
| `api.logout()` | `POST /api/auth/logout` | ✅ Fixed |

**Progress:** 7/11 frontend methods fixed (63.6%)

---

## 🔄 Database Schema Changes

### New Table: RevokedTokens
```sql
CREATE TABLE RevokedTokens (
    Id INT PRIMARY KEY IDENTITY,
    Token NVARCHAR(MAX) NOT NULL,
    RevokedAt DATETIME2 NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    UserId INT NOT NULL,
    Reason NVARCHAR(500) NULL
);
```

**Migration:** `AddRevokedTokens`

---

## 📚 Additional Resources

- **Work Plan:** `docs/project-management/IMPLEMENTATION_WORK_PLAN.md`
- **Gap Analysis:** `docs/project-management/backend-frontend-gap-analysis.md`
- **Seed Data:** Users: admin@local, john@local, jane@local (password format: `User@123`)

---

**Last Updated:** October 20, 2025  
**Phase:** Phase 1 - Critical Fixes  
**Status:** ✅ Complete
