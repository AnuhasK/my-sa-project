# Auction Platform - Feature Roadmap
**Created**: October 12, 2025  
**Project**: Auction House Platform  
**Status**: Planning Phase

---

## 📋 TABLE OF CONTENTS
1. [Current Platform Status](#current-platform-status)
2. [High Priority Features](#high-priority-features)
3. [Medium Priority Features](#medium-priority-features)
4. [Low Priority Features](#low-priority-features)
5. [Implementation Phases](#implementation-phases)
6. [Technical Requirements](#technical-requirements)

---

## 🎯 CURRENT PLATFORM STATUS

### ✅ Implemented Features
- User authentication (JWT-based)
- Auction creation and listing
- Real-time bidding with SignalR
- Category system (8 categories)
- Image upload and management (local storage)
- Security hardening (7 vulnerabilities fixed)
- SQL Server database with EF Core
- React + TypeScript frontend
- Role-based authorization (Admin/User)

### 🔧 Technical Stack
- **Backend**: ASP.NET Core 9.0, Entity Framework Core, SignalR
- **Frontend**: React 18, TypeScript, Vite
- **Database**: SQL Server
- **Authentication**: JWT Bearer Tokens
- **Real-time**: SignalR WebSockets

---

## 🚀 HIGH PRIORITY FEATURES
*Core functionality that significantly improves user experience*

---

### 1. Watchlist / Favorites System ⭐

**Priority**: HIGH  
**Complexity**: Low-Medium  
**Time Estimate**: 2-3 hours  
**User Story**: "As a buyer, I want to save interesting auctions so I can track them easily"

#### Technical Implementation

**Backend Changes**:
```
1. Create Watchlist Model
   - Models/Watchlist.cs
   - Properties: Id, UserId, AuctionId, AddedDate
   - Relationships: User (1:M), Auction (1:M)

2. Add DbSet to ApplicationDbContext
   - public DbSet<Watchlist> Watchlists { get; set; }

3. Create WatchlistService
   - Services/IWatchlistService.cs
   - Services/WatchlistService.cs
   - Methods: AddToWatchlist, RemoveFromWatchlist, GetUserWatchlist

4. Create WatchlistController
   - Controllers/WatchlistController.cs
   - POST /api/watchlist/{auctionId} - Add to watchlist
   - DELETE /api/watchlist/{auctionId} - Remove from watchlist
   - GET /api/watchlist - Get user's watchlist

5. Create Migration
   - dotnet ef migrations add AddWatchlistTable
```

**Frontend Changes**:
```
1. Create Watchlist Service
   - src/services/watchlistService.ts

2. Add Watchlist Button Component
   - src/components/WatchlistButton.tsx
   - Heart icon (filled/unfilled based on state)
   - Toggle functionality

3. Create Watchlist Page
   - src/pages/user/WatchlistPage.tsx
   - Display all watchlisted auctions
   - Grid layout similar to HomePage

4. Update Navigation
   - Add "Watchlist" link to user menu
```

**Database Schema**:
```sql
CREATE TABLE Watchlists (
    Id INT PRIMARY KEY IDENTITY,
    UserId INT NOT NULL,
    AuctionId INT NOT NULL,
    AddedDate DATETIME2 NOT NULL,
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (AuctionId) REFERENCES Auctions(Id),
    UNIQUE (UserId, AuctionId)
);
```

**API Endpoints**:
- `POST /api/watchlist/{auctionId}` - Add auction to watchlist
- `DELETE /api/watchlist/{auctionId}` - Remove from watchlist
- `GET /api/watchlist` - Get all watchlisted auctions for current user
- `GET /api/watchlist/check/{auctionId}` - Check if auction is in watchlist

---

### 2. User Profile & Dashboard 👤

**Priority**: HIGH  
**Complexity**: Medium  
**Time Estimate**: 4-5 hours  
**User Story**: "As a user, I want to see my bidding activity and manage my auctions"

#### Technical Implementation

**Backend Changes**:
```
1. Create UserService
   - Services/IUserService.cs
   - Services/UserService.cs
   - Methods: GetUserProfile, GetUserStats, GetUserBids, GetUserAuctions

2. Create UserController
   - Controllers/UserController.cs
   - GET /api/user/profile - Get user profile
   - GET /api/user/stats - Get user statistics
   - GET /api/user/bids - Get user's bid history
   - GET /api/user/auctions - Get user's created auctions
   - GET /api/user/won-auctions - Get auctions user won

3. Create DTOs
   - DTOs/UserProfileDto.cs
   - DTOs/UserStatsDto.cs
   - DTOs/UserBidDto.cs
```

**Frontend Changes**:
```
1. Create Profile Page
   - src/pages/user/ProfilePage.tsx
   - Display user info and statistics

2. Create Dashboard Tabs
   - src/pages/user/Dashboard.tsx
   - Tab 1: Overview (stats cards)
   - Tab 2: My Bids (active bids with status)
   - Tab 3: My Auctions (created auctions)
   - Tab 4: Won Auctions (completed wins)
   - Tab 5: Watchlist

3. Create Components
   - src/components/UserStats.tsx
   - src/components/BidHistoryCard.tsx
   - src/components/UserAuctionCard.tsx
```

**Features**:
- User statistics (total bids, auctions created, auctions won)
- Active bids with current status (winning/outbid)
- Created auctions with edit/delete options
- Won auctions with payment status
- Profile picture upload (future)

---

### 3. Search & Advanced Filtering 🔍

**Priority**: HIGH  
**Complexity**: Medium  
**Time Estimate**: 3-4 hours  
**User Story**: "As a buyer, I want to find specific auctions quickly"

#### Technical Implementation

**Backend Changes**:
```
1. Update AuctionService
   - Add SearchAuctions method
   - Parameters: searchTerm, categoryId, minPrice, maxPrice, sortBy, sortOrder
   - Implement LINQ queries with filters

2. Update AuctionsController
   - GET /api/auctions/search?q={term}&category={id}&minPrice={min}&maxPrice={max}&sort={field}&order={asc/desc}

3. Create FilterDto
   - DTOs/AuctionFilterDto.cs
   - Properties: SearchTerm, CategoryId, MinPrice, MaxPrice, Status, SortBy, SortOrder
```

**Frontend Changes**:
```
1. Create Search Component
   - src/components/SearchBar.tsx
   - Debounced search input (300ms delay)
   - Search by auction title and description

2. Create Filter Component
   - src/components/AuctionFilters.tsx
   - Category dropdown
   - Price range sliders
   - Status filter (active/ending soon/ended)
   - Sort options (price, ending time, newest)

3. Update AuctionListingPage
   - Integrate search and filters
   - Update URL query parameters
   - Implement pagination
```

**Search Features**:
- Text search (title, description)
- Filter by category
- Price range filter
- Status filter (active, ending soon, ended)
- Sort by: ending soonest, price (high/low), newest, most bids

---

### 4. Auction End Notifications & Auto-Close 🔔

**Priority**: HIGH  
**Complexity**: Medium-High  
**Time Estimate**: 4-6 hours  
**User Story**: "As a user, I want to be notified when auctions end and see results"

#### Technical Implementation

**Backend Changes**:
```
1. Create Background Service
   - Services/AuctionEndService.cs
   - Implements IHostedService
   - Runs every minute to check ending auctions

2. Update Auction Model
   - Add Status enum: Active, Ended, Cancelled
   - Add WinnerId property

3. Create Notification System
   - Services/INotificationService.cs
   - Services/NotificationService.cs
   - Methods: NotifyAuctionEnded, NotifyWinner, NotifyOutbid

4. Update AuctionHub
   - Add AuctionEnded event
   - Broadcast to all connected clients

5. Add Winner Logic
   - Determine winner (highest bid)
   - Update auction status
   - Set WinnerId
```

**Frontend Changes**:
```
1. Create Notification Component
   - src/components/Notifications.tsx
   - Toast notifications
   - Bell icon with badge count

2. Update SignalR Connection
   - Listen for AuctionEnded events
   - Display winner announcement
   - Update auction cards in real-time

3. Create Winner Badge
   - src/components/WinnerBadge.tsx
   - Display on auction page if user won
```

**Background Service Logic**:
```csharp
// Pseudo-code
Every 1 minute:
  1. Query auctions where EndDate <= NOW AND Status = Active
  2. For each ended auction:
     - Find highest bid
     - Set auction Status = Ended
     - Set auction WinnerId = highest bidder
     - Send notification to winner
     - Broadcast AuctionEnded via SignalR
     - Log completion
```

---

## 🎨 MEDIUM PRIORITY FEATURES
*Enhanced experience and engagement features*

---

### 5. Image Gallery for Auctions 🖼️

**Priority**: MEDIUM  
**Complexity**: Low  
**Time Estimate**: 2-3 hours  
**User Story**: "As a seller, I want to upload multiple images to showcase my item"

#### Technical Implementation

**Backend Changes**:
```
1. Update Image Model
   - Add IsPrimary boolean
   - Add DisplayOrder int

2. Update ImagesController
   - POST /api/images/upload-multiple - Upload multiple images
   - PUT /api/images/{id}/set-primary - Set primary image
   - PUT /api/images/reorder - Update display order

3. Update AuctionService
   - Return images ordered by DisplayOrder
   - Mark primary image in response
```

**Frontend Changes**:
```
1. Create Image Gallery Component
   - src/components/ImageGallery.tsx
   - Thumbnail strip
   - Main image viewer
   - Navigation arrows

2. Update Auction Creation
   - Allow multiple image uploads
   - Drag-and-drop reordering
   - Set primary image

3. Update Auction Detail Page
   - Replace single image with gallery
   - Lightbox on click
```

---

### 6. Bid History Timeline 📊

**Priority**: MEDIUM  
**Complexity**: Low  
**Time Estimate**: 2 hours  
**User Story**: "As a user, I want to see the complete bid history on an auction"

#### Technical Implementation

**Backend Changes**:
```
1. Update BidService
   - GetBidHistory method already exists
   - Add pagination support

2. Update BidsController
   - GET /api/bids/auction/{auctionId}/history?page={page}&pageSize={size}
```

**Frontend Changes**:
```
1. Create Bid History Component
   - src/components/BidHistory.tsx
   - Timeline layout
   - Show: username, amount, timestamp
   - Highlight user's own bids
   - Show "outbid" status

2. Update Auction Detail Page
   - Add "Bid History" section
   - Display latest 10 bids
   - "View All" button with modal
```

---

### 7. Auto-Bid / Proxy Bidding 🤖

**Priority**: MEDIUM  
**Complexity**: High  
**Time Estimate**: 6-8 hours  
**User Story**: "As a buyer, I want to set a maximum bid and let the system bid for me"

#### Technical Implementation

**Backend Changes**:
```
1. Create ProxyBid Model
   - Models/ProxyBid.cs
   - Properties: Id, UserId, AuctionId, MaxAmount, CurrentAmount, IsActive

2. Create ProxyBidService
   - Services/IProxyBidService.cs
   - Services/ProxyBidService.cs
   - SetProxyBid method
   - CheckAndExecuteProxyBids method (triggered on new bids)

3. Update BidService
   - After placing bid, check for active proxy bids
   - Execute counter-bids automatically
   - Stop when max amount reached

4. Logic Flow:
   - User A sets proxy bid: $100
   - User B bids: $50
   - System auto-bids for User A: $55 (min increment)
   - User B bids: $60
   - System auto-bids for User A: $65
   - Continue until User A's max ($100) reached
```

**Frontend Changes**:
```
1. Create Proxy Bid Component
   - src/components/ProxyBidForm.tsx
   - Input for maximum bid amount
   - Display current proxy bid status
   - Warning about automatic bidding

2. Update Auction Detail Page
   - Add "Set Auto-Bid" button
   - Show proxy bid indicator
   - Display max bid (only to user)
```

---

### 8. Seller Ratings & Reviews ⭐

**Priority**: MEDIUM  
**Complexity**: Medium  
**Time Estimate**: 4-5 hours  
**User Story**: "As a buyer, I want to see seller ratings to make informed decisions"

#### Technical Implementation

**Backend Changes**:
```
1. Create Review Model
   - Models/Review.cs
   - Properties: Id, ReviewerId, SellerId, AuctionId, Rating, Comment, CreatedDate
   - Constraint: Only auction winner can review

2. Create ReviewService
   - Services/IReviewService.cs
   - Services/ReviewService.cs
   - CreateReview, GetSellerReviews, GetAverageRating

3. Create ReviewsController
   - POST /api/reviews - Create review (winner only)
   - GET /api/reviews/seller/{sellerId} - Get seller reviews
   - GET /api/reviews/seller/{sellerId}/average - Get average rating

4. Update User Model
   - Add computed AverageRating property
```

**Frontend Changes**:
```
1. Create Rating Component
   - src/components/StarRating.tsx
   - Display star rating
   - Interactive for input

2. Create Review Form
   - src/components/ReviewForm.tsx
   - Star rating input
   - Comment textarea
   - Submit button

3. Update Seller Profile
   - Display average rating
   - Show recent reviews
   - Pagination for all reviews

4. Update Auction Cards
   - Show seller rating badge
```

---

## 💎 LOW PRIORITY FEATURES
*Nice-to-have enhancements*

---

### 9. Payment Integration 💳

**Priority**: LOW  
**Complexity**: High  
**Time Estimate**: 8-12 hours  
**User Story**: "As a winner, I want to pay for my auction securely on the platform"

#### Technical Implementation

**Backend Changes**:
```
1. Install Stripe.NET
   - dotnet add package Stripe.net

2. Create Payment Model
   - Models/Payment.cs
   - Properties: Id, AuctionId, UserId, Amount, Status, StripePaymentIntentId

3. Create PaymentService
   - Services/IPaymentService.cs
   - Services/PaymentService.cs
   - CreatePaymentIntent, ConfirmPayment, RefundPayment

4. Create PaymentsController
   - POST /api/payments/create-intent - Create Stripe payment intent
   - POST /api/payments/confirm - Confirm payment
   - POST /api/payments/refund/{id} - Refund payment (admin)
```

**Frontend Changes**:
```
1. Install Stripe React
   - npm install @stripe/stripe-js @stripe/react-stripe-js

2. Create Checkout Page
   - src/pages/user/CheckoutPage.tsx
   - Stripe Elements integration
   - Card input form
   - Payment confirmation

3. Update Won Auctions
   - Add "Pay Now" button
   - Display payment status
   - Show receipt after payment
```

**Security Considerations**:
- Never store card details
- Use Stripe's secure elements
- Implement webhook for payment confirmation
- Add fraud detection

---

### 10. Mobile Responsive Improvements 📱

**Priority**: LOW  
**Complexity**: Medium  
**Time Estimate**: 4-6 hours  
**User Story**: "As a mobile user, I want a seamless experience on my phone"

#### Technical Implementation

**Frontend Changes**:
```
1. Optimize Navigation
   - Hamburger menu for mobile
   - Bottom navigation bar
   - Sticky header

2. Responsive Auction Cards
   - Stack instead of grid on mobile
   - Larger touch targets
   - Swipe gestures

3. Mobile Bid Button
   - Fixed bottom bid button
   - Quick bid with single tap
   - Haptic feedback

4. Touch Optimizations
   - Larger buttons (min 44x44px)
   - Swipe to delete
   - Pull to refresh
```

**CSS Breakpoints**:
```css
/* Mobile: < 768px */
/* Tablet: 768px - 1024px */
/* Desktop: > 1024px */
```

---

### 11. Admin Panel 🛡️

**Priority**: LOW  
**Complexity**: Medium  
**Time Estimate**: 5-7 hours  
**User Story**: "As an admin, I want to manage users and content"

#### Technical Implementation

**Backend Changes**:
```
1. Create AdminController
   - GET /api/admin/users - List all users
   - PUT /api/admin/users/{id}/ban - Ban user
   - DELETE /api/admin/auctions/{id} - Remove auction
   - GET /api/admin/stats - Platform statistics

2. Update Authorization
   - Add [Authorize(Roles = "Admin")] to admin endpoints
```

**Frontend Changes**:
```
1. Create Admin Layout
   - src/layouts/AdminLayout.tsx
   - Side navigation
   - Admin-only routes

2. Create Admin Pages
   - src/pages/admin/UsersPage.tsx - User management
   - src/pages/admin/AuctionsPage.tsx - Auction moderation
   - src/pages/admin/CategoriesPage.tsx - Category management
   - src/pages/admin/DashboardPage.tsx - Statistics

3. Create Admin Components
   - src/components/admin/UserTable.tsx
   - src/components/admin/StatsCards.tsx
   - src/components/admin/ActivityLog.tsx
```

**Admin Features**:
- View all users with registration dates
- Ban/unban users
- Remove inappropriate auctions
- View platform statistics (total users, auctions, bids, revenue)
- Activity log
- Category CRUD operations

---

### 12. Email Notifications 📧

**Priority**: LOW  
**Complexity**: Medium  
**Time Estimate**: 3-4 hours  
**User Story**: "As a user, I want email notifications for important events"

#### Technical Implementation

**Backend Changes**:
```
1. Install SendGrid or MailKit
   - dotnet add package SendGrid

2. Create EmailService
   - Services/IEmailService.cs
   - Services/EmailService.cs
   - SendWelcomeEmail, SendOutbidEmail, SendAuctionEndingEmail, SendWinnerEmail

3. Create Email Templates
   - Templates/welcome-email.html
   - Templates/outbid-email.html
   - Templates/winner-email.html

4. Update Configuration
   - Add SendGrid API key to appsettings.json
   - Add email templates path
```

**Email Triggers**:
- User registration → Welcome email
- Outbid on auction → Outbid notification
- Auction ending in 1 hour → Reminder email
- Auction ended → Winner congratulations
- New bid on your auction → Seller notification

**Template Variables**:
```
{{userName}}
{{auctionTitle}}
{{currentBid}}
{{endDate}}
{{auctionUrl}}
```

---

## 📅 IMPLEMENTATION PHASES

### **Phase 1: Core Features** (Week 1)
**Goal**: Complete essential user features  
**Duration**: 3-5 days

| Feature | Priority | Time | Status |
|---------|----------|------|--------|
| Watchlist System | HIGH | 2-3h | ⏳ Pending |
| Search & Filtering | HIGH | 3-4h | ⏳ Pending |
| User Dashboard | HIGH | 4-5h | ⏳ Pending |

**Deliverables**:
- Users can save favorite auctions
- Users can search and filter auctions
- Users have a personal dashboard

---

### **Phase 2: Auction Lifecycle** (Week 2)
**Goal**: Complete auction end-to-end flow  
**Duration**: 4-6 days

| Feature | Priority | Time | Status |
|---------|----------|------|--------|
| Auction End Detection | HIGH | 4-6h | ⏳ Pending |
| Bid History Timeline | MEDIUM | 2h | ⏳ Pending |
| Image Gallery | MEDIUM | 2-3h | ⏳ Pending |

**Deliverables**:
- Auctions automatically close
- Winners are determined
- Users see complete bid history
- Multiple images per auction

---

### **Phase 3: Advanced Features** (Week 3)
**Goal**: Enhance engagement and trust  
**Duration**: 5-7 days

| Feature | Priority | Time | Status |
|---------|----------|------|--------|
| Seller Ratings | MEDIUM | 4-5h | ⏳ Pending |
| Auto-Bid System | MEDIUM | 6-8h | ⏳ Pending |
| Email Notifications | LOW | 3-4h | ⏳ Pending |

**Deliverables**:
- Trust system with ratings
- Automated bidding
- Email communication

---

### **Phase 4: Platform Management** (Week 4)
**Goal**: Admin tools and polish  
**Duration**: 5-7 days

| Feature | Priority | Time | Status |
|---------|----------|------|--------|
| Admin Panel | LOW | 5-7h | ⏳ Pending |
| Mobile Optimization | LOW | 4-6h | ⏳ Pending |
| Payment Integration | LOW | 8-12h | ⏳ Pending |

**Deliverables**:
- Admin management interface
- Mobile-optimized experience
- Payment processing (optional)

---

## 🛠️ TECHNICAL REQUIREMENTS

### Backend Development

**New Models Needed**:
```
- Watchlist (UserId, AuctionId, AddedDate)
- ProxyBid (UserId, AuctionId, MaxAmount, CurrentAmount)
- Review (ReviewerId, SellerId, AuctionId, Rating, Comment)
- Payment (AuctionId, UserId, Amount, Status, StripePaymentIntentId)
- Notification (UserId, Type, Message, IsRead, CreatedDate)
```

**New Services Needed**:
```
- IWatchlistService / WatchlistService
- IUserService / UserService
- INotificationService / NotificationService
- IProxyBidService / ProxyBidService
- IReviewService / ReviewService
- IPaymentService / PaymentService
- IEmailService / EmailService
- AuctionEndService (IHostedService)
```

**New Controllers Needed**:
```
- WatchlistController
- UserController
- ReviewsController
- PaymentsController
- AdminController
```

### Frontend Development

**New Pages Needed**:
```
- WatchlistPage
- ProfilePage
- DashboardPage
- CheckoutPage
- AdminDashboard
- AdminUsersPage
- AdminAuctionsPage
```

**New Components Needed**:
```
- WatchlistButton
- SearchBar
- AuctionFilters
- Notifications
- ImageGallery
- BidHistory
- ProxyBidForm
- StarRating
- ReviewForm
- UserStats
- AdminSidebar
```

### Database Migrations

**Migration Order**:
```
1. AddWatchlistTable
2. AddAuctionStatusAndWinner
3. AddProxyBidsTable
4. AddReviewsTable
5. AddPaymentsTable
6. AddNotificationsTable
7. AddUserBanFields
8. AddImageGalleryFields
```

### Third-Party Integrations

**Required Services**:
- **Stripe** (Payment processing) - Free tier available
- **SendGrid** (Email delivery) - 100 emails/day free
- **Cloudinary** (Image hosting - optional) - Free tier available

**Environment Variables to Add**:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
SENDGRID_API_KEY=SG....
EMAIL_FROM_ADDRESS=noreply@auctionhouse.com
```

---

## 🎯 SUCCESS METRICS

### User Engagement
- **Watchlist Usage**: % of users with watchlisted items
- **Search Usage**: % of sessions using search
- **Return Rate**: Daily active users (DAU)

### Auction Performance
- **Completion Rate**: % of auctions that receive bids
- **Average Bids**: Average number of bids per auction
- **Winner Payment Rate**: % of winners who complete payment

### Platform Health
- **User Growth**: New registrations per week
- **Active Auctions**: Number of active auctions
- **Revenue**: Total transaction volume (with payment integration)

---

## 📝 NOTES

### Current Blockers
- JWT key needs update (minimum 16 characters) before production
- IntelliSense errors need OmniSharp restart
- Production CORS origins need configuration

### Future Considerations
- **Scalability**: Consider Redis for caching when user base grows
- **Image Storage**: Move to Cloudinary/AWS S3 for production
- **Database**: Add indexes on foreign keys and frequently queried fields
- **Monitoring**: Implement Application Insights or Sentry
- **CI/CD**: Set up automated deployment pipeline

### Security Reminders
- All new endpoints need `[Authorize]` attribute
- Validate all user inputs with DTOs
- Implement rate limiting on sensitive endpoints
- Add CAPTCHA on registration/login (future)
- Regular security audits

---

## 📞 CONTACT & SUPPORT

**Project Repository**: github.com/AnuhasK/my-sa-project  
**Branch**: backend  
**Documentation**: docs/workflow/

---

**Last Updated**: October 12, 2025  
**Next Review**: After Phase 1 completion  
**Version**: 1.0
