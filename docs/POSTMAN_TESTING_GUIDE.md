# Auction House - Postman API Testing Guide

## Table of Contents
1. [Setup](#setup)
2. [Environment Variables](#environment-variables)
3. [Authentication Flow](#authentication-flow)
4. [User Management](#user-management)
5. [Auction Operations](#auction-operations)
6. [Bidding Operations](#bidding-operations)
7. [Transaction Management](#transaction-management)
8. [Payment Operations](#payment-operations)
9. [Watchlist Operations](#watchlist-operations)
10. [Admin Operations](#admin-operations)
11. [Complete Test Scenarios](#complete-test-scenarios)

---

## Setup

### 1. Install Postman
Download and install Postman from: https://www.postman.com/downloads/

### 2. Import Collection
You can create a new collection called "Auction House API" or import this guide's requests manually.

### 3. Base URL
All requests will use the base URL: `http://localhost:5021/api`

---

## Environment Variables

Create a Postman environment called "Auction House - Local" with these variables:

| Variable Name | Initial Value | Current Value |
|--------------|---------------|---------------|
| `base_url` | `http://localhost:5021/api` | `http://localhost:5021/api` |
| `auth_token` | (empty) | (set after login) |
| `admin_token` | (empty) | (set after admin login) |
| `user_id` | (empty) | (set after login) |
| `auction_id` | (empty) | (set after creating auction) |
| `transaction_id` | (empty) | (set after transaction created) |

---

## Authentication Flow

### 1. Register New User

**Request:**
```
POST {{base_url}}/auth/register
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "testuser",
  "email": "testuser@example.com",
  "password": "Test@123",
  "confirmPassword": "Test@123"
}
```

**Expected Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 6,
    "username": "testuser",
    "email": "testuser@example.com",
    "role": "User"
  }
}
```

**Tests Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has token", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('token');
    pm.environment.set("auth_token", jsonData.token);
    pm.environment.set("user_id", jsonData.user.id);
});
```

---

### 2. Login (Regular User)

**Request:**
```
POST {{base_url}}/auth/login
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "john.doe@gmail.com",
  "password": "User@123"
}
```

**Expected Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 3,
    "username": "john_doe",
    "email": "john.doe@gmail.com",
    "role": "User"
  }
}
```

**Tests Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has token and userId", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('token');
    pm.expect(jsonData).to.have.property('userId');
    pm.expect(jsonData).to.have.property('username');
    pm.environment.set("auth_token", jsonData.token);
    pm.environment.set("user_id", jsonData.userId);
});
```

---

### 3. Login (Admin)

**Request:**
```
POST {{base_url}}/auth/login
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "admin@auctionhouse.com",
  "password": "Admin@123"
}
```

**Expected Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@auctionhouse.com",
    "role": "Admin"
  }
}
```

**Tests Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("User is admin", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.user.role).to.equal("Admin");
    pm.environment.set("admin_token", jsonData.token);
});
```

---

### 4. Logout

**Request:**
```
POST {{base_url}}/auth/logout
Authorization: Bearer {{auth_token}}
```

**Expected Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Tests Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

// Clear the token
pm.environment.set("auth_token", "");
```

---

## User Management


### 5. Get Current User Profile

**Request:**
```
GET {{base_url}}/auth/me
Authorization: Bearer {{auth_token}}
```

**Expected Response (200 OK):**
```json
{
  "id": 3,
  "username": "john_doe",
  "email": "john.doe@gmail.com",
  "role": "User",
  "createdAt": "2025-10-21T10:30:00Z",
  "isActive": true
}
```

---


### 6. Update User Profile

**Request:**
```
PUT {{base_url}}/auth/profile
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "bio": "Passionate collector of vintage items",
  "phoneNumber": "+1-555-0123",
  "address": "123 Main St, New York, NY 10001"
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Profile updated successfully"
}
```

---

### 7. Get User Dashboard Stats

**Request:**
```
GET {{base_url}}/users/dashboard-stats
Authorization: Bearer {{auth_token}}
```

**Expected Response (200 OK):**
```json
{
  "activeBids": 5,
  "wonAuctions": 2,
  "activeAuctions": 3,
  "totalSpent": 1250.00,
  "watchlistCount": 7
}
```

---

## Auction Operations

### 8. Get All Auctions

**Request:**
```
GET {{base_url}}/auctions
```

**Query Parameters:**
- `status` (optional): "Open", "Closed", "Scheduled"
- `categoryId` (optional): Filter by category
- `search` (optional): Search by title/description

**Example:**
```
GET {{base_url}}/auctions?status=Open&search=guitar
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Vintage 1967 Gibson Les Paul Guitar",
    "description": "Rare vintage Gibson Les Paul...",
    "currentPrice": 3200.00,
    "startPrice": 2500.00,
    "startTime": "2025-10-18T10:00:00Z",
    "endTime": "2025-10-23T10:00:00Z",
    "status": "Open",
    "categoryName": "Musical Instruments",
    "categoryId": 2,
    "primaryImageUrl": "/img/products/guitar.jpg",
    "bidCount": 8
  }
]
```

**Tests Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});

// Save first auction ID for later use
if (pm.response.json().length > 0) {
    pm.environment.set("auction_id", pm.response.json()[0].id);
}
```

---

### 9. Get Auction Details

**Request:**
```
GET {{base_url}}/auctions/{{auction_id}}
Authorization: Bearer {{auth_token}}
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "title": "Vintage 1967 Gibson Les Paul Guitar",
  "description": "Rare vintage Gibson Les Paul Standard in excellent condition...",
  "currentPrice": 3200.00,
  "startPrice": 2500.00,
  "startTime": "2025-10-18T10:00:00Z",
  "endTime": "2025-10-23T10:00:00Z",
  "status": "Open",
  "categoryId": 2,
  "categoryName": "Musical Instruments",
  "seller": {
    "id": 1,
    "username": "admin",
    "email": "admin@auctionhouse.com"
  },
  "images": [
    {
      "id": 1,
      "url": "/img/products/guitar.jpg",
      "isPrimary": true,
      "displayOrder": 0
    }
  ],
  "bids": [
    {
      "id": 15,
      "amount": 3200.00,
      "bidder": {
        "id": 3,
        "username": "john_doe"
      },
      "timestamp": "2025-10-21T09:30:00Z"
    }
  ],
  "bidCount": 8,
  "highestBid": 3200.00,
  "isInWatchlist": false
}
```

---

### 10. Create Auction (User/Admin)

**Request:**
```
POST {{base_url}}/auctions
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "title": "Antique Pocket Watch Collection",
  "description": "Beautiful collection of 5 antique pocket watches from the early 1900s. All in working condition with original cases.",
  "startPrice": 500.00,
  "categoryId": 7,
  "startTime": "2025-10-21T15:00:00Z",
  "endTime": "2025-10-28T15:00:00Z",
  "imageUrls": [
    "/img/products/watch1.jpg",
    "/img/products/watch2.jpg"
  ]
}
```

**Expected Response (201 Created):**
```json
{
  "id": 7,
  "title": "Antique Pocket Watch Collection",
  "message": "Auction created successfully"
}
```

**Tests Script:**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Auction ID is returned", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.environment.set("auction_id", jsonData.id);
});
```

---

### 11. Update Auction

**Request:**
```
PUT {{base_url}}/auctions/{{auction_id}}
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "title": "Antique Pocket Watch Collection - UPDATED",
  "description": "Updated description with more details...",
  "startPrice": 550.00
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Auction updated successfully"
}
```

---

### 12. Delete Auction

**Request:**
```
DELETE {{base_url}}/auctions/{{auction_id}}
Authorization: Bearer {{auth_token}}
```

**Expected Response (200 OK):**
```json
{
  "message": "Auction deleted successfully"
}
```

---

### 13. Close Auction Manually (Admin Only)

**Request:**
```
POST {{base_url}}/auctions/{{auction_id}}/close
Authorization: Bearer {{admin_token}}
```

**Expected Response (204 No Content)**

**Tests Script:**
```javascript
pm.test("Status code is 204", function () {
    pm.response.to.have.status(204);
});
```

---

## Bidding Operations

### 14. Get Auction Bids

**Request:**
```
GET {{base_url}}/bids/auction/{{auction_id}}
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 15,
    "amount": 3200.00,
    "bidderUsername": "john_doe",
    "timestamp": "2025-10-21T09:30:00Z"
  },
  {
    "id": 14,
    "amount": 3000.00,
    "bidderUsername": "jane_smith",
    "timestamp": "2025-10-21T08:15:00Z"
  }
]
```

---

### 15. Place a Bid

**Request:**
```
POST {{base_url}}/bids
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "auctionId": 1,
  "amount": 3300.00
}
```

**Expected Response (201 Created):**
```json
{
  "id": 16,
  "amount": 3300.00,
  "timestamp": "2025-10-21T10:45:00Z",
  "message": "Bid placed successfully"
}
```

**Tests Script:**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Bid amount is correct", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.amount).to.equal(3300.00);
});
```

**Common Errors:**
- `400 Bad Request`: "Bid amount must be higher than current price"
- `400 Bad Request`: "Cannot bid on your own auction"
- `400 Bad Request`: "Auction is not open for bidding"

---

### 16. Get User's Active Bids

**Request:**
```
GET {{base_url}}/bids/user/active
Authorization: Bearer {{auth_token}}
```

**Expected Response (200 OK):**
```json
[
  {
    "auctionId": 1,
    "title": "Vintage 1967 Gibson Les Paul Guitar",
    "currentBid": 3300.00,
    "myBid": 3300.00,
    "timeLeft": "2025-10-23T10:00:00Z",
    "status": "winning"
  },
  {
    "auctionId": 2,
    "title": "MacBook Pro 16-inch M3 Max",
    "currentBid": 2600.00,
    "myBid": 2400.00,
    "timeLeft": "2025-10-24T10:00:00Z",
    "status": "outbid"
  }
]
```

---

## Transaction Management

### 17. Get All Transactions (Admin Only)

**Request:**
```
GET {{base_url}}/transactions
Authorization: Bearer {{admin_token}}
```

**Query Parameters:**
- `status` (optional): "Pending", "Paid", "Shipped", "Completed", "Cancelled"

**Example:**
```
GET {{base_url}}/transactions?status=Paid
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "auctionId": 5,
    "auctionTitle": "PlayStation 5 Console + Games Bundle",
    "auctionImageUrl": "/img/products/ps5.jpg",
    "otherPartyUsername": "john_doe",
    "buyerId": 3,
    "buyerEmail": "john.doe@gmail.com",
    "amount": 650.00,
    "paymentStatus": "Paid",
    "trackingNumber": null,
    "shippingMethod": null,
    "shippingAddress": null,
    "adminNotes": null,
    "createdAt": "2025-10-20T14:30:00Z"
  }
]
```

**Tests Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});

// Save first transaction ID
if (pm.response.json().length > 0) {
    pm.environment.set("transaction_id", pm.response.json()[0].id);
}
```

---

### 18. Get User's Won Auctions

**Request:**
```
GET {{base_url}}/transactions/buyer/{{user_id}}
Authorization: Bearer {{auth_token}}
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "auctionId": 5,
    "auctionTitle": "PlayStation 5 Console + Games Bundle",
    "auctionImageUrl": "/img/products/ps5.jpg",
    "otherPartyUsername": "admin",
    "amount": 650.00,
    "paymentStatus": "Paid",
    "createdAt": "2025-10-20T14:30:00Z"
  }
]
```

---

### 19. Update Shipping Information (Admin Only)

**Request:**
```
PUT {{base_url}}/transactions/{{transaction_id}}/shipping
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "trackingNumber": "1Z999AA10123456784",
  "shippingMethod": "UPS Ground",
  "shippingAddress": "123 Main St, New York, NY 10001",
  "adminNotes": "Package prepared and ready for pickup"
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Shipping information updated successfully"
}
```

**Tests Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Success message returned", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.message).to.include("successfully");
});
```

**Note:** When a tracking number is provided, the transaction status automatically changes to "Shipped".

---

### 20. Update Transaction Status (Buyer Confirms Delivery)

**Request:**
```
PATCH {{base_url}}/transactions/{{transaction_id}}/payment-status
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "paymentStatus": "Completed"
}
```

**Expected Response (200 OK):**
```json
{
  "message": "Transaction status updated successfully"
}
```

---

## Payment Operations

### 21. Create Stripe Checkout Session

**Request:**
```
POST {{base_url}}/payments/create-checkout-session/{{transaction_id}}
Authorization: Bearer {{auth_token}}
```

**Expected Response (200 OK):**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_test_a1dtbMnJFkIxmZWTud2U06MouuhFQ7kkDM295IZyQtGf8RhDFjLm7IG8Pq#fidkdWxOYHwnP..."
}
```

**Tests Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Checkout URL is returned", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('checkoutUrl');
    pm.expect(jsonData.checkoutUrl).to.include('stripe.com');
});
```

**Note:** The returned URL is a Stripe Checkout page. In a real test, you would visit this URL and complete payment using test card: `4242 4242 4242 4242`.

---

### 22. Stripe Webhook (Simulated)

**Request:**
```
POST {{base_url}}/payments/webhook
Content-Type: application/json
Stripe-Signature: whsec_test_signature
```

**Body (JSON):**
```json
{
  "id": "evt_test_webhook",
  "object": "event",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_a1dtbMnJFkIxmZWTud2U06MouuhFQ7kkDM295IZyQtGf8RhDFjLm7IG8Pq",
      "metadata": {
        "transaction_id": "1"
      },
      "payment_status": "paid"
    }
  }
}
```

**Note:** This endpoint requires a valid Stripe signature. For testing webhooks, use the Stripe CLI tool instead:
```bash
stripe listen --forward-to http://localhost:5021/api/payments/webhook
```

---

## Watchlist Operations

### 23. Get User's Watchlist

**Request:**
```
GET {{base_url}}/watchlist
Authorization: Bearer {{auth_token}}
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "auctionId": 2,
    "auction": {
      "id": 2,
      "title": "MacBook Pro 16-inch M3 Max",
      "currentPrice": 2600.00,
      "endTime": "2025-10-24T10:00:00Z",
      "status": "Open",
      "primaryImageUrl": "/img/products/macbook.jpg",
      "bidCount": 12
    },
    "addedDate": "2025-10-20T11:00:00Z"
  }
]
```

---

### 24. Add Auction to Watchlist

**Request:**
```
POST {{base_url}}/watchlist/{{auction_id}}
Authorization: Bearer {{auth_token}}
```

**Expected Response (201 Created):**
```json
{
  "message": "Auction added to watchlist"
}
```

**Tests Script:**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});
```

---

### 25. Remove from Watchlist

**Request:**
```
DELETE {{base_url}}/watchlist/{{auction_id}}
Authorization: Bearer {{auth_token}}
```

**Expected Response (200 OK):**
```json
{
  "message": "Auction removed from watchlist"
}
```

---

## Admin Operations

### 26. Get All Users (Admin Only)

**Request:**
```
GET {{base_url}}/users
Authorization: Bearer {{admin_token}}
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@auctionhouse.com",
    "role": "Admin",
    "isActive": true,
    "createdAt": "2025-10-15T10:00:00Z"
  },
  {
    "id": 3,
    "username": "john_doe",
    "email": "john.doe@gmail.com",
    "role": "User",
    "isActive": true,
    "createdAt": "2025-10-16T14:30:00Z"
  }
]
```

---

### 27. Deactivate User (Admin Only)

**Request:**
```
PATCH {{base_url}}/users/{{user_id}}/deactivate
Authorization: Bearer {{admin_token}}
```

**Expected Response (200 OK):**
```json
{
  "message": "User deactivated successfully"
}
```

---

### 28. Get Admin Dashboard Stats (Admin Only)

**Request:**
```
GET {{base_url}}/admin/dashboard-stats
Authorization: Bearer {{admin_token}}
```

**Expected Response (200 OK):**
```json
{
  "totalUsers": 25,
  "activeAuctions": 12,
  "totalBids": 245,
  "totalRevenue": 15750.50,
  "newUsersToday": 3,
  "newAuctionsToday": 2,
  "averageAuctionPrice": 875.25,
  "recentBids": [
    {
      "username": "john_doe",
      "amount": 3300.00,
      "auctionTitle": "Vintage 1967 Gibson Les Paul Guitar",
      "timestamp": "2025-10-21T10:45:00Z"
    }
  ],
  "recentAuctions": [
    {
      "username": "admin",
      "title": "Antique Pocket Watch Collection",
      "createdAt": "2025-10-21T09:00:00Z"
    }
  ]
}
```

---

### 29. Get All Categories

**Request:**
```
GET {{base_url}}/categories
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Electronics",
    "description": "Electronic devices, computers, phones, gadgets",
    "auctionCount": 15
  },
  {
    "id": 2,
    "name": "Musical Instruments",
    "description": "Guitars, pianos, drums, and other musical equipment",
    "auctionCount": 8
  }
]
```

---

### 30. Create Category (Admin Only)

**Request:**
```
POST {{base_url}}/categories
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Vintage Cars",
  "description": "Classic and vintage automobiles"
}
```

**Expected Response (201 Created):**
```json
{
  "id": 9,
  "name": "Vintage Cars",
  "message": "Category created successfully"
}
```

---

## Complete Test Scenarios

### Scenario 1: Complete Auction Lifecycle

**Step-by-step testing of the full auction process:**

1. **Admin Login**
   - `POST /api/auth/login` (admin credentials)
   - Save `admin_token`

2. **Create Auction**
   - `POST /api/auctions` with admin_token
   - Save `auction_id` from response

3. **User Login**
   - `POST /api/auth/login` (user credentials)
   - Save `auth_token`

4. **View Auction**
   - `GET /api/auctions/{{auction_id}}`
   - Verify auction details

5. **Add to Watchlist**
   - `POST /api/watchlist/{{auction_id}}`
   - Verify 201 status

6. **Place Bid**
   - `POST /api/bids` with amount > currentPrice
   - Verify bid accepted

7. **Place Higher Bid (Another User)**
   - Login as second user
   - Place higher bid
   - First user should be outbid

8. **Close Auction (Admin)**
   - `POST /api/auctions/{{auction_id}}/close` with admin_token
   - Verify 204 status

9. **Verify Transaction Created**
   - `GET /api/transactions` with admin_token
   - Find transaction for closed auction
   - Save `transaction_id`

10. **Create Payment Session (Winner)**
    - Login as winning bidder
    - `POST /api/payments/create-checkout-session/{{transaction_id}}`
    - Verify checkout URL returned

11. **Complete Payment** (Manual - Use Stripe Test Card)
    - Visit checkout URL
    - Enter test card: 4242 4242 4242 4242
    - Complete payment

12. **Verify Payment Status**
    - `GET /api/transactions/{{transaction_id}}`
    - Verify status changed to "Paid"

13. **Update Shipping (Admin)**
    - `PUT /api/transactions/{{transaction_id}}/shipping` with admin_token
    - Include tracking number
    - Verify status changed to "Shipped"

14. **Confirm Delivery (Buyer)**
    - `PATCH /api/transactions/{{transaction_id}}/payment-status`
    - Set status to "Completed"
    - Verify transaction completed

---

### Scenario 2: User Registration & Bidding

**Testing new user flow:**

1. **Register New User**
   - `POST /api/auth/register`
   - Save token and user_id

2. **Update Profile**
   - `PUT /api/users/profile`
   - Add bio, phone, address

3. **Browse Auctions**
   - `GET /api/auctions?status=Open`
   - Select an auction

4. **View Auction Details**
   - `GET /api/auctions/{{auction_id}}`
   - Check current price

5. **Place Bid**
   - `POST /api/bids`
   - Verify bid placed successfully

6. **Check Active Bids**
   - `GET /api/bids/user/active`
   - Verify bid appears

7. **Get Dashboard Stats**
   - `GET /api/users/dashboard-stats`
   - Verify statistics updated

---

### Scenario 3: Admin Management

**Testing admin capabilities:**

1. **Admin Login**
   - `POST /api/auth/login` (admin)

2. **Get Dashboard Stats**
   - `GET /api/admin/dashboard-stats`
   - Verify all metrics returned

3. **View All Users**
   - `GET /api/users`
   - Verify user list

4. **View All Transactions**
   - `GET /api/transactions`
   - Filter by different statuses

5. **Create Category**
   - `POST /api/categories`
   - Verify category created

6. **Create Auction**
   - `POST /api/auctions`
   - Verify auction created

7. **Close Auction Manually**
   - `POST /api/auctions/{{auction_id}}/close`
   - Verify transaction created

8. **Update Shipping Info**
   - `PUT /api/transactions/{{transaction_id}}/shipping`
   - Verify status updated

---

## Error Testing

### Common Error Scenarios to Test:

**1. Unauthorized Access:**
```
GET {{base_url}}/admin/dashboard-stats
(Without Authorization header)

Expected: 401 Unauthorized
```

**2. Invalid Token:**
```
GET {{base_url}}/users/profile
Authorization: Bearer invalid_token_here

Expected: 401 Unauthorized
```

**3. Insufficient Permissions:**
```
POST {{base_url}}/auctions/1/close
Authorization: Bearer {{auth_token}}
(Using regular user token)

Expected: 403 Forbidden
```

**4. Invalid Bid Amount:**
```
POST {{base_url}}/bids
Body: { "auctionId": 1, "amount": 10.00 }
(Amount lower than current price)

Expected: 400 Bad Request
```

**5. Bidding on Own Auction:**
```
POST {{base_url}}/bids
Body: { "auctionId": {{own_auction_id}}, "amount": 1000.00 }

Expected: 400 Bad Request
```

**6. Duplicate Registration:**
```
POST {{base_url}}/auth/register
Body: { "email": "john.doe@gmail.com", ... }
(Email already exists)

Expected: 400 Bad Request
```

---

## Best Practices

### 1. Use Environment Variables
Always use `{{variable_name}}` instead of hardcoded values for:
- Base URL
- Authentication tokens
- Resource IDs

### 2. Add Tests to Every Request
Include test scripts to:
- Verify status codes
- Check response structure
- Save variables for subsequent requests

### 3. Organize Collection
Group requests into folders:
- Authentication
- Users
- Auctions
- Bids
- Transactions
- Payments
- Admin

### 4. Use Pre-request Scripts
Add scripts to automatically:
- Set timestamps
- Generate unique IDs
- Calculate values

**Example Pre-request Script:**
```javascript
// Generate unique email for registration
const randomEmail = `testuser_${Date.now()}@example.com`;
pm.environment.set("random_email", randomEmail);

// Set ISO timestamp for auction start/end
const now = new Date();
const endTime = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days later
pm.environment.set("auction_start", now.toISOString());
pm.environment.set("auction_end", endTime.toISOString());
```

### 5. Run Collections
Use Postman's Collection Runner to:
- Execute all requests in sequence
- Generate test reports
- Automate testing

---

## Exporting Postman Collection

To share this collection with your team:

1. Click on the collection name
2. Click the three dots (...)
3. Select "Export"
4. Choose "Collection v2.1"
5. Save as `Auction_House_API.postman_collection.json`

You can also export the environment:
1. Click on "Environments"
2. Select your environment
3. Click the three dots (...)
4. Select "Export"
5. Save as `Auction_House_Local.postman_environment.json`

---

## Support

For API issues:
- Check backend logs in terminal
- Verify database seeding completed
- Ensure JWT token is valid and not expired
- Check Authorization header format: `Bearer <token>`

---

**Last Updated:** October 21, 2025
