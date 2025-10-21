# Auction House Entity-Relationship (ER) Diagram

## ER Diagram (Crow's Foot Notation)

```mermaid
erDiagram
    USER ||--o{ AUCTION : "creates/sells"
    USER ||--o{ BID : "places"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ REVOKED_TOKEN : "owns"
    USER ||--o{ TRANSACTION : "purchases"
    USER ||--o{ WATCHLIST : "has"
    USER ||--o{ ACTIVITY_LOG : "generates"
    USER ||--o{ ANNOUNCEMENT : "creates"
    
    CATEGORY ||--o{ AUCTION : "contains"
    
    AUCTION ||--o{ BID : "receives"
    AUCTION ||--o{ AUCTION_IMAGE : "contains"
    AUCTION ||--o{ TRANSACTION : "generates"
    AUCTION ||--o{ WATCHLIST : "appears_in"
    
    USER {
        int id PK "Primary Key"
        varchar username "Unique username"
        varchar email "Email address"
        varchar password_hash "Hashed password"
        varchar role "User or Admin"
        boolean is_active "Account status"
        datetime created_at "Registration date"
        datetime deleted_at "Deletion timestamp"
        varchar profile_image_url "Profile picture"
        varchar phone_number "Contact number"
        text address "User address"
        text bio "User biography"
    }
    
    AUCTION {
        int id PK "Primary Key"
        varchar title "Auction title"
        text description "Detailed description"
        decimal start_price "Starting bid price"
        decimal current_price "Current highest bid"
        datetime start_time "Auction start time"
        datetime end_time "Auction end time"
        datetime created_at "Creation timestamp"
        int seller_id FK "References User(id)"
        int category_id FK "References Category(id)"
        varchar status "Scheduled/Open/Closed"
    }
    
    BID {
        int id PK "Primary Key"
        int auction_id FK "References Auction(id)"
        int bidder_id FK "References User(id)"
        decimal amount "Bid amount"
        datetime timestamp "Bid time"
    }
    
    TRANSACTION {
        int id PK "Primary Key"
        int auction_id FK "References Auction(id)"
        int buyer_id FK "References User(id)"
        decimal amount "Transaction amount"
        varchar payment_status "Pending/Paid/Shipped/Completed"
        datetime order_date "Order creation date"
        datetime paid_date "Payment date"
        datetime shipped_date "Shipping date"
        datetime completed_date "Completion date"
        text shipping_address "Delivery address"
        varchar tracking_number "Shipment tracking"
        varchar shipping_method "Shipping service"
        text buyer_notes "Buyer comments"
        text admin_notes "Admin comments"
        datetime created_at "Record creation"
        datetime updated_at "Last update"
    }
    
    CATEGORY {
        int id PK "Primary Key"
        varchar name "Category name"
        text description "Category description"
    }
    
    NOTIFICATION {
        int id PK "Primary Key"
        int user_id FK "References User(id)"
        varchar type "Notification type"
        varchar title "Notification title"
        text message "Notification content"
        boolean is_read "Read status"
        datetime created_at "Creation time"
        int related_entity_id "Related entity ID"
        json metadata "Additional data"
    }
    
    AUCTION_IMAGE {
        int id PK "Primary Key"
        int auction_id FK "References Auction(id)"
        varchar url "Image URL/path"
        boolean is_primary "Primary image flag"
        int display_order "Display order"
    }
    
    REVOKED_TOKEN {
        int id PK "Primary Key"
        text token "JWT token"
        datetime revoked_at "Revocation time"
        datetime expires_at "Token expiry"
        int user_id FK "References User(id)"
        varchar reason "Revocation reason"
    }
    
    WATCHLIST {
        int id PK "Primary Key"
        int user_id FK "References User(id)"
        int auction_id FK "References Auction(id)"
        datetime added_date "Addition timestamp"
    }
    
    ACTIVITY_LOG {
        int id PK "Primary Key"
        int user_id FK "References User(id)"
        varchar action "Action performed"
        varchar entity_type "Entity type"
        int entity_id "Entity ID"
        text details "Action details"
        datetime timestamp "Action time"
    }
    
    ANNOUNCEMENT {
        int id PK "Primary Key"
        varchar title "Announcement title"
        text content "Announcement content"
        datetime created_at "Creation time"
        int created_by FK "References User(id)"
        boolean is_published "Published status"
        datetime published_at "Publication time"
    }
```

---

## Entity Descriptions

### Core Entities

- **User**: Represents system users (buyers, sellers, admins) with authentication and profile information.
- **Auction**: Represents auction listings with pricing, timing, and status information.
- **Bid**: Records bidding activity on auctions.
- **Transaction**: Manages payment and shipping for completed auctions.
- **Category**: Organizes auctions into categories.

### Supporting Entities

- **Notification**: Real-time notifications for users about bids, auctions, and transactions.
- **AuctionImage**: Stores images for auction listings.
- **RevokedToken**: Tracks invalidated JWT tokens for security.
- **Watchlist**: Allows users to save auctions they're interested in.
- **ActivityLog**: Tracks user actions for audit and analytics.
- **Announcement**: System-wide announcements created by admins.

### Relationships Summary

- User ⟷ Auction: 1-to-many (as Seller)
- User ⟷ Bid: 1-to-many (as Bidder)
- User ⟷ Transaction: 1-to-many (as Buyer)
- User ⟷ Notification: 1-to-many
- User ⟷ RevokedToken: 1-to-many
- User ⟷ Watchlist: 1-to-many
- User ⟷ ActivityLog: 1-to-many
- User ⟷ Announcement: 1-to-many (as Creator)
- Auction ⟷ Category: many-to-1
- Auction ⟷ Bid: 1-to-many
- Auction ⟷ AuctionImage: 1-to-many
- Auction ⟷ Transaction: 1-to-many
- Auction ⟷ Watchlist: 1-to-many

---

**Key Points:**
- **PK** = Primary Key
- **FK** = Foreign Key
- Cardinality: `||` = one, `o{` = many
- PaymentStatus enum: Pending, Paid, Shipped, Completed, Cancelled
- NotificationType enum: Various notification types for different events

This comprehensive ER diagram shows all entities, attributes, and relationships in the Auction House database.
