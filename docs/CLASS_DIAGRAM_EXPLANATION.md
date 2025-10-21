# Class Diagram Explanation: Auction House System

This document explains the core class diagram for the Online Auction Website System, describing the main entities, their attributes, methods, and relationships.

---

## Overview
The class diagram models the domain of the auction platform, showing how users, auctions, bids, transactions, notifications, images, and security tokens interact. It follows best practices for encapsulation, separation of concerns, and real-world mapping.

---

## Key Classes and Relationships

### 1. **User**
- **Attributes:**
  - Id, Username, Email, PasswordHash, Role, IsActive, CreatedAt
- **Methods:**
  - Register(), Authenticate(), UpdateProfile(), Deactivate()
- **Relationships:**
  - One-to-many with Auction (as Seller)
  - One-to-many with Bid (as Bidder)
  - One-to-many with Notification
  - One-to-many with ClaRevokedToken
  - One-to-many with Transaction (as Buyer)

### 2. **Auction**
- **Attributes:**
  - Id, Title, Description, StartPrice, CurrentPrice, Status, StartTime, EndTime, SellerId, WinnerId
- **Methods:**
  - StartAuction(), CloseAuction(), UpdateCurrentPrice(), GetBids(), GetImages()
- **Relationships:**
  - Many-to-one with User (Seller)
  - One-to-many with Bid
  - One-to-many with AuctionImage
  - One-to-one with Transaction (when closed)

### 3. **Bid**
- **Attributes:**
  - Id, AuctionId, UserId, Amount, Timestamp
- **Methods:**
  - PlaceBid(), ValidateBid(), GetBidHistory()
- **Relationships:**
  - Many-to-one with Auction
  - Many-to-one with User (Bidder)

### 4. **Transaction**
- **Attributes:**
  - Id, AuctionId, BuyerId, SellerId, Amount, TransactionDate, Status, PaymentMethod
- **Methods:**
  - CreateTransaction(), UpdateStatus()
- **Relationships:**
  - One-to-one with Auction
  - Many-to-one with User (Buyer)
  - Many-to-one with User (Seller)

### 5. **Notification**
- **Attributes:**
  - Id, UserId, Message, IsRead, Timestamp
- **Methods:**
  - SendNotification(), MarkAsRead()
- **Relationships:**
  - Many-to-one with User

### 6. **AuctionImage**
- **Attributes:**
  - Id, AuctionId, Url, IsPrimary, DisplayOrder
- **Methods:**
  - UploadImage(), SetPrimaryImage()
- **Relationships:**
  - Many-to-one with Auction

### 7. **ClaRevokedToken**
- **Attributes:**
  - Id, UserId, Token, RevokedAt
- **Methods:**
  - RevokeToken(), IsTokenRevoked()
- **Relationships:**
  - Many-to-one with User

---

## Relationships Summary
- **User** ⟷ **Auction**: One user (seller) can have many auctions.
- **Auction** ⟷ **Bid**: One auction can have many bids.
- **User** ⟷ **Bid**: One user (bidder) can place many bids.
- **Auction** ⟷ **AuctionImage**: One auction can have many images.
- **Auction** ⟷ **Transaction**: One auction has one transaction when closed.
- **User** ⟷ **Transaction**: User can be buyer or seller in many transactions.
- **User** ⟷ **Notification**: One user can have many notifications.
- **User** ⟷ **ClaRevokedToken**: One user can have many revoked tokens.

---

## Design Principles
- **Encapsulation:** Each class manages its own data and logic.
- **Separation of Concerns:** Domain entities are distinct from service and controller logic.
- **Reusability:** Core entities are reused across features (e.g., User, Auction, Bid).

---

> This class diagram and explanation provide a clear, maintainable, and extensible foundation for the auction platform.
