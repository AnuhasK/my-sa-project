# Auction House - User Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Requirements](#system-requirements)
3. [Installation & Setup](#installation--setup)
4. [Running the Application](#running-the-application)
5. [Testing Guide](#testing-guide)
6. [User Roles & Features](#user-roles--features)
7. [Payment Testing](#payment-testing)
8. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Auction House** is a full-stack online auction platform where users can:
- Browse and bid on auctions
- Create and manage auctions (sellers)
- Process payments via Stripe
- Track transactions and shipping

**Tech Stack:**
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** ASP.NET Core (.NET 9.0) + Entity Framework Core
- **Database:** SQL Server (LocalDB)
- **Payment:** Stripe (Test Mode)

---

## System Requirements

### Required Software
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **.NET 9.0 SDK** - [Download](https://dotnet.microsoft.com/download)
- **SQL Server** (LocalDB or SQL Server Express)
- **Stripe CLI** (for payment testing) - [Download](https://stripe.com/docs/stripe-cli)
- **Git** (for version control)

### Recommended Tools
- **Visual Studio Code** or **Visual Studio 2022**
- **SQL Server Management Studio (SSMS)** (optional, for database viewing)
- **Postman** (optional, for API testing)

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Auction Website Project"
```

### 2. Backend Setup

#### Step 1: Navigate to Backend Directory
```bash
cd backend/AuctionHouse.Api
```

#### Step 2: Restore Dependencies
```bash
dotnet restore
```

#### Step 3: Update Database Connection String
Open `appsettings.json` and verify the connection string:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=AuctionHouseDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

#### Step 4: Run Database Migrations
```bash
dotnet ef database update
```

This will:
- Create the `AuctionHouseDB` database
- Apply all migrations
- Seed initial data (admin user, sample categories, auctions)

#### Step 5: Build the Backend
```bash
dotnet build
```

### 3. Frontend Setup

#### Step 1: Navigate to Frontend Directory
```bash
cd ../../frontend
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Verify Configuration
Check that the API URL matches your backend in the code (default: `http://localhost:5021`)

---

## Running the Application

### Start Backend Server

```bash
cd backend/AuctionHouse.Api
dotnet run
```

**Backend will run on:** `http://localhost:5021`

You should see:
```
info: Program[0]
      Database migration completed successfully.
info: AuctionHouse.Api.Services.AuctionClosingService[0]
      Auction Closing Service started
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5021
```

### Start Frontend Server

Open a **new terminal** and run:

```bash
cd frontend
npm run dev
```

**Frontend will run on:** `http://localhost:3000`

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

### Access the Application

Open your browser and navigate to: **http://localhost:3000**

---

## Testing Guide

### Default Test Accounts

The system is pre-seeded with test accounts:

#### Admin Accounts
- **Email:** `admin@auctionhouse.com`
- **Password:** `Admin@123`
- **Role:** Administrator

- **Email:** `admin2@auctionhouse.com`
- **Password:** `Admin2@123`
- **Role:** Administrator

#### Regular User Accounts (Buyers/Bidders)
- **Username:** `john_doe`
- **Email:** `john.doe@gmail.com`
- **Password:** `User@123`
- **Role:** User

- **Username:** `jane_smith`
- **Email:** `jane.smith@gmail.com`
- **Password:** `User@123`
- **Role:** User

- **Username:** `collector_mike`
- **Email:** `mike.collector@gmail.com`
- **Password:** `User@123`
- **Role:** User

**Note:** All users can create auctions (as sellers) and place bids (as buyers). Admins have additional privileges to manage all users, auctions, and transactions.

### Test Scenarios

#### 1. User Registration & Login

**Test New User Registration:**
1. Click "Register" in the header
2. Fill in the form:
   - Username: `testuser`
   - Email: `testuser@example.com`
   - Password: `Test123!`
   - Confirm Password: `Test123!`
3. Click "Create Account"
4. You should be automatically logged in

**Test Login:**
1. Click "Login" in the header
2. Enter credentials (use any test account above)
3. Click "Sign In"
4. Verify you're redirected to the dashboard

#### 2. Browsing Auctions

1. Navigate to "Auctions" from the header
2. Browse available auctions
3. Use filters (categories, status, search)
4. Click on an auction to view details

#### 3. Creating an Auction (Seller)

**Login as seller or admin, then:**

1. Click "Profile" → "Create Auction" (or Admin Dashboard → Auctions → Create)
2. Fill in auction details:
   - **Title:** "Vintage Camera"
   - **Description:** "Professional DSLR camera..."
   - **Starting Price:** 100
   - **Category:** Electronics
   - **Start Time:** Current date/time
   - **End Time:** 2-3 days from now
3. Upload images (optional)
4. Click "Create Auction"
5. Verify auction appears in auction list

#### 4. Placing Bids (Buyer)

**Login as buyer, then:**

1. Go to "Auctions" and select an open auction
2. Enter a bid amount (must be higher than current price)
3. Click "Place Bid"
4. Verify bid appears in bid history
5. Check notifications for bid confirmation

#### 5. Watchlist Testing

1. Login as any user
2. View an auction detail page
3. Click "Add to Watchlist"
4. Go to "Profile" → "Watchlist"
5. Verify auction appears
6. Remove from watchlist

#### 6. Auction Closing

**Option A: Automatic Closure**
- Wait for auction end time to pass
- The background service runs every 60 seconds
- Transaction is automatically created for the winner

**Option B: Manual Closure (Admin)**
1. Login as admin
2. Go to "Admin Dashboard" → "Auctions"
3. Find an auction with bids that has ended
4. Click "⋮" menu → "Close & Create Transaction"
5. Verify transaction is created

#### 7. Admin Functions

**User Management:**
1. Login as admin
2. Go to "Admin Dashboard" → "Users"
3. View all users
4. Deactivate/activate users
5. View user details

**Auction Management:**
1. Go to "Admin Dashboard" → "Auctions"
2. View all auctions (Open, Closed, Deleted)
3. Filter by status
4. Close auctions manually
5. View auction details

**Transaction Management:**
1. Go to "Admin Dashboard" → "Transactions"
2. View all transactions
3. Filter by payment status (Pending, Paid, Shipped, Completed)
4. Update shipping information
5. Mark transactions as shipped

**Dashboard Analytics:**
1. Go to "Admin Dashboard"
2. View statistics:
   - Total users
   - Active auctions
   - Total bids
   - Revenue
3. View recent activity
4. Check recent bids and auctions

---

## Payment Testing

### Setup Stripe CLI for Webhooks

#### 1. Install Stripe CLI
- Download from: https://stripe.com/docs/stripe-cli
- Or use: `winget install stripe.stripe-cli`

#### 2. Login to Stripe
```bash
stripe login
```

#### 3. Forward Webhooks to Local Backend
Open a **new terminal** and run:

```bash
stripe listen --forward-to http://localhost:5021/api/payments/webhook
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxx...
```

**Keep this terminal running during payment testing!**

### Testing Payment Flow

#### Step 1: Create a Transaction
1. Login as **buyer**
2. Ensure you've won an auction (bid on an auction and wait for it to close)
3. Go to "Profile" → "Dashboard" → "Won Items" tab
4. You should see a transaction with status "Pending"

#### Step 2: Initiate Payment
1. Click "Pay Now" button on a pending transaction
2. You'll be redirected to Stripe Checkout page

#### Step 3: Complete Payment
On the Stripe Checkout page, use **test card details**:
- **Card Number:** `4242 4242 4242 4242`
- **Expiry Date:** Any future date (e.g., `12/28`)
- **CVC:** Any 3 digits (e.g., `123`)
- **ZIP Code:** Any 5 digits (e.g., `12345`)

Click "Pay"

#### Step 4: Verify Payment Success
1. You should be redirected to the payment success page
2. After 5 seconds, auto-redirected to dashboard
3. Transaction status should now show "Paid" (green badge)
4. "Pay Now" button should be gone

#### Step 5: Verify Webhook (Check Stripe CLI Terminal)
In the Stripe CLI terminal, you should see:
```
2025-10-21 12:14:53  <--  [200] POST http://localhost:5021/api/payments/webhook [evt_xxx]
```

The `[200]` indicates successful webhook processing!

#### Step 6: Admin Adds Shipping Info
1. Login as **admin**
2. Go to "Admin Dashboard" → "Transactions"
3. Find the paid transaction
4. Click "Add Shipping" or "Edit" button
5. Fill in:
   - **Tracking Number:** `1Z999AA10123456784`
   - **Shipping Method:** `UPS Ground`
   - **Admin Notes:** (optional)
6. Click "Mark as Shipped"
7. Status changes to "Shipped" (blue badge)

#### Step 7: Buyer Confirms Delivery
1. Switch back to **buyer** account
2. Go to "Profile" → "Dashboard" → "Won Items"
3. You should see shipping information displayed
4. Click "Mark as Received" button
5. Status changes to "Completed" (purple badge)

### Stripe Test Cards Reference

| Card Number | Description |
|-------------|-------------|
| 4242 4242 4242 4242 | Success |
| 4000 0027 6000 3184 | 3D Secure required |
| 4000 0000 0000 0002 | Card declined |
| 4000 0000 0000 9995 | Insufficient funds |

---

## User Roles & Features

### Guest (Not Logged In)
- ✅ Browse auctions
- ✅ View auction details
- ✅ Search auctions
- ❌ Cannot bid
- ❌ Cannot create auctions

### Regular User (Buyer/Seller)
- ✅ All guest features
- ✅ Place bids on auctions
- ✅ Create auctions (as seller)
- ✅ Add auctions to watchlist
- ✅ View personal dashboard
- ✅ Track won auctions
- ✅ Make payments
- ✅ Receive notifications
- ✅ Confirm delivery

### Admin
- ✅ All user features
- ✅ Access admin dashboard
- ✅ Manage all users
- ✅ Manage all auctions
- ✅ View all transactions
- ✅ Add shipping information
- ✅ View analytics and reports
- ✅ Manually close auctions
- ✅ Create/edit categories

---

## Troubleshooting

### Common Issues

#### 1. Backend Won't Start

**Error: Database connection failed**
```
Solution:
1. Verify SQL Server is running
2. Check connection string in appsettings.json
3. Run: dotnet ef database update
```

**Error: Port 5021 already in use**
```
Solution:
1. Kill the process using port 5021
2. Or change the port in launchSettings.json
```

#### 2. Frontend Won't Start

**Error: Cannot find module**
```
Solution:
1. Delete node_modules folder
2. Run: npm install
3. Run: npm run dev
```

**Error: Port 3000 already in use**
```
Solution:
1. Kill the process using port 3000
2. Or the app will suggest using port 3001 - accept it
```

#### 3. Login Not Working

**Issue: "Invalid credentials"**
```
Solution:
1. Verify you're using the correct test account credentials
2. Check if database is seeded: Open SSMS and verify Users table has data
3. Re-run: dotnet ef database update
```

#### 4. Payments Not Working

**Issue: Webhook returns [400] error**
```
Solution:
1. Verify Stripe CLI is running with correct webhook secret
2. Check appsettings.json has the correct WebhookSecret from Stripe CLI
3. Restart the backend after updating webhook secret
```

**Issue: Can't reach payment success page**
```
Solution:
1. Verify frontend URL in appsettings.json matches your actual frontend port
2. Default should be "http://localhost:3000"
3. Restart backend after changing
```

#### 5. Images Not Loading

**Issue: Auction images not displaying**
```
Solution:
1. Verify images are in: frontend/public/img/products/
2. Check image URLs in database (AuctionImages table)
3. Clear browser cache
```

#### 6. Stripe CLI Not Found

**Issue: Command 'stripe' not recognized**
```
Solution (Windows):
1. Download from: https://github.com/stripe/stripe-cli/releases/latest
2. Extract stripe.exe to a folder
3. Add the folder to Windows PATH
4. Or run stripe.exe directly from that folder
```

### Database Reset

If you need to completely reset the database:

```bash
cd backend/AuctionHouse.Api
dotnet ef database drop
dotnet ef database update
```

This will:
1. Delete the entire database
2. Recreate it from scratch
3. Apply all migrations
4. Re-seed with test data

---

## Project Structure

```
Auction Website Project/
│
├── backend/
│   └── AuctionHouse.Api/
│       ├── Controllers/          # API endpoints
│       ├── Services/             # Business logic
│       ├── Models/               # Database entities
│       ├── Data/                 # Database context
│       ├── DTOs/                 # Data transfer objects
│       ├── Migrations/           # EF Core migrations
│       ├── appsettings.json      # Configuration
│       └── Program.cs            # App entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Page components
│   │   │   ├── public/          # Guest pages
│   │   │   ├── user/            # User pages
│   │   │   └── admin/           # Admin pages
│   │   ├── contexts/            # React contexts (Auth)
│   │   ├── services/            # API service
│   │   └── App.tsx              # Main app component
│   └── public/
│       └── img/                 # Static images
│
└── USER_GUIDE.md               # This file
```

---

## API Documentation

### Base URL
`http://localhost:5021/api`

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

#### Auctions
- `GET /api/auctions` - Get all auctions
- `GET /api/auctions/{id}` - Get auction details
- `POST /api/auctions` - Create auction (Admin/Seller)
- `PUT /api/auctions/{id}` - Update auction
- `DELETE /api/auctions/{id}` - Delete auction
- `POST /api/auctions/{id}/close` - Close auction manually (Admin)

#### Bids
- `GET /api/bids/auction/{auctionId}` - Get auction bids
- `POST /api/bids` - Place a bid

#### Transactions
- `GET /api/transactions` - Get all transactions (Admin)
- `GET /api/transactions/buyer/{userId}` - Get buyer transactions
- `PUT /api/transactions/{id}/shipping` - Update shipping info (Admin)
- `PUT /api/transactions/{id}/status` - Update transaction status

#### Payments
- `POST /api/payments/create-checkout-session/{transactionId}` - Create Stripe session
- `POST /api/payments/webhook` - Stripe webhook endpoint

---

## Support & Contact

For issues or questions:
1. Check the Troubleshooting section above
2. Review error messages in browser console (F12)
3. Check backend logs in the terminal
4. Contact the development team

---

## Version History

- **v1.0** (October 2025) - Initial release
  - User authentication
  - Auction browsing and bidding
  - Admin dashboard
  - Stripe payment integration
  - Transaction management
  - Shipping tracking

---

**Last Updated:** October 21, 2025
