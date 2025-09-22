# Database Schema for Auction Website (From Existing Implementation)

## Entities & Fields

### 1. Users
- Id (PK, string) - Identity/GUID  
- UserName (string)
- Email (string)  
- PasswordHash (string)
- IsEmailConfirmed (bool)
- CreatedAt (datetime)
- UpdatedAt (datetime)

### 2. Auctions  
- Id (PK, int)
- Title (string)
- Description (string)
- StartingPrice (decimal)
- CurrentPrice (decimal) 
- StartDate (datetime)
- EndDate (datetime)
- IsActive (bool)
- SellerId (FK, string, references Users)
- CreatedAt (datetime)
- UpdatedAt (datetime)

### 3. Bids
- Id (PK, int)
- AuctionId (FK, int, references Auctions)
- BidderId (FK, string, references Users)
- Amount (decimal)
- BidTime (datetime)
- IsWinningBid (bool)

### 4. AuctionImages
- Id (PK, int)
- AuctionId (FK, int, references Auctions)
- ImageUrl (string)
- IsPrimary (bool)
- UploadedAt (datetime)

### 5. Transactions
- Id (PK, int)
- AuctionId (FK, int, references Auctions)
- BuyerId (FK, string, references Users)
- SellerId (FK, string, references Users)
- Amount (decimal)
- TransactionDate (datetime)
- Status (string: pending, completed, failed)
- PaymentMethod (string)

### 6. Categories (Planned)
- Id (PK, int)
- Name (string)
- Description (string)

### 7. Notifications (Planned)
- Id (PK, int)
- UserId (FK, string, references Users)
- Message (string)
- IsRead (bool)
- CreatedAt (datetime)

### 8. SupportTickets (Planned)
- Id (PK, int)
- UserId (FK, string, references Users)
- Subject (string)
- Description (string)
- Status (string: open, closed, pending)
- CreatedAt (datetime)

## Relationships
- Each Auction belongs to one User (Seller)
- Each Bid belongs to one Auction and one User (Bidder)
- Each Auction can have multiple AuctionImages
- Each Transaction involves one Auction, one Buyer, and one Seller
- Each Auction belongs to one Category (when implemented)
- Each Notification belongs to one User (when implemented)
- Each SupportTicket belongs to one User (when implemented)

## Key Features Implemented
- ✅ User authentication with Identity
- ✅ Auction creation and management
- ✅ Real-time bidding with SignalR
- ✅ Image upload for auctions
- ✅ Transaction tracking
- ✅ Entity Framework Core with migrations

## Database Technology
- **Current:** Entity Framework Core with SQL Server LocalDB
- **Connection:** Configured in appsettings.json
- **Migrations:** Located in `/Migrations` folder

## Implementation Status
✅ **Complete:** Users, Auctions, Bids, AuctionImages, Transactions  
🔄 **To Add:** Categories, Notifications, SupportTickets

## API Integration Notes
- **Backend URL:** http://localhost:5000/api
- **SignalR Hub:** http://localhost:5000/auctionHub
- **Authentication:** JWT Bearer tokens
- **Real-time:** SignalR for live bidding updates