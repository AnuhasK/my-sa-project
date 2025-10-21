# Auction Website Development Workplan

## Overview
This workplan outlines a structured approach to building the auction platform, prioritizing foundational features before administrative tools to minimize rework and ensure data integrity.

---

## Phase 1: User Management & Authentication (Foundation)
**Goal:** Establish secure user accounts, authentication, and role-based access control.

### 1.1 Backend - User System
- [ ] Review and validate User model (fields: Id, Username, Email, PasswordHash, Role, CreatedAt, etc.)
- [ ] Implement user registration endpoint with validation
- [ ] Implement login endpoint with JWT token generation
- [ ] Create password hashing/verification service
- [ ] Add email verification workflow (optional but recommended)
- [ ] Implement password reset functionality
- [ ] Create user profile endpoints (GET, PUT for profile updates)
- [ ] Add user avatar/image upload support
- [ ] Implement role-based authorization middleware
- [ ] Write unit tests for authentication service

### 1.2 Frontend - User Pages
- [ ] Create registration page with form validation
- [ ] Create login page with error handling
- [ ] Implement JWT token storage (localStorage/sessionStorage)
- [ ] Create authentication context/provider for global auth state
- [ ] Build protected route wrapper component
- [ ] Create user profile page (view/edit personal info)
- [ ] Add profile image upload component
- [ ] Implement logout functionality
- [ ] Create password change form
- [ ] Add "forgot password" flow

### 1.3 User Dashboard
- [ ] Design dashboard layout for regular users
- [ ] Display user statistics (active bids, won auctions, selling auctions)
- [ ] Show recent activity feed
- [ ] Create "My Auctions" section (auctions user created)
- [ ] Create "My Bids" section (auctions user is bidding on)
- [ ] Create "Watchlist" section (saved/favorited auctions)
- [ ] Add quick actions (create auction, browse auctions)
- [ ] Implement notifications badge/preview

**Validation Checkpoint:**
- Users can register, login, and access their dashboard
- Profile updates work correctly
- Role-based routing prevents unauthorized access

---

## Phase 2: Auction Core Features
**Goal:** Build complete auction lifecycle from creation to closing.

### 2.1 Backend - Auction Management
- [ ] Review and validate Auction model (Title, Description, StartingPrice, CurrentPrice, StartTime, EndTime, Status, CategoryId, SellerId)
- [ ] Implement auction creation endpoint with validation
- [ ] Create auction listing endpoint (GET /api/auctions) with pagination, filtering, sorting
- [ ] Add auction detail endpoint (GET /api/auctions/{id})
- [ ] Implement auction update endpoint (for sellers only)
- [ ] Create auction deletion/cancellation logic (soft delete)
- [ ] Add image upload for auction items (multiple images support)
- [ ] Implement auction search functionality (by title, description, category)
- [ ] Create category management endpoints (if not already exist)
- [ ] Add auction status transition logic (Pending → Open → Closed)
- [ ] Implement scheduled job/service to auto-close expired auctions
- [ ] Write unit tests for auction service

### 2.2 Frontend - Auction Pages
- [ ] Create auction listing page (browse all auctions)
- [ ] Implement filters (category, price range, status, time remaining)
- [ ] Add search bar with debounced API calls
- [ ] Create auction card component (thumbnail, title, current price, time left)
- [ ] Build auction detail page with full information
- [ ] Create image gallery/carousel for auction images
- [ ] Add "Create Auction" page with form validation
- [ ] Implement multi-image upload component
- [ ] Create "Edit Auction" page (for sellers)
- [ ] Add auction timer/countdown component
- [x] Implement watchlist/favorite toggle button (heart icon in AuctionCard and AuctionDetailsPage)
- [ ] Create category filter component

### 2.3 Backend - Bidding System
- [ ] Review and validate Bid model (AuctionId, UserId, Amount, Timestamp)
- [ ] Create place bid endpoint with validation rules:
  - Bid must be higher than current price
  - Auction must be open
  - User cannot bid on own auction
  - Minimum bid increment enforcement
- [ ] Implement bid history endpoint (GET /api/auctions/{id}/bids)
- [ ] Create autobid/proxy bidding logic (optional advanced feature)
- [ ] Add winner determination logic when auction closes
- [ ] Implement notification triggers for outbid events
- [ ] Write unit tests for bidding service

### 2.4 Frontend - Bidding Interface
- [ ] Create bid input component with validation
- [ ] Display current highest bid and bidder (anonymous/public)
- [ ] Show bid history table/list with timestamps
- [ ] Implement real-time bid updates (prepare for SignalR integration)
- [ ] Add bid confirmation modal/dialog
- [ ] Display error messages for invalid bids
- [ ] Show "You're winning!" / "You've been outbid" status
- [ ] Create quick bid buttons (suggested increments)

**Validation Checkpoint:**
- Users can create auctions with images
- Auction listings display correctly with filters/search
- Users can place bids following all validation rules
- Bid history updates correctly

---

## Phase 3: Real-Time Features (SignalR)
**Goal:** Add live bidding updates and real-time notifications.

### 3.1 Backend - SignalR Setup
- [ ] Review SignalR hub configuration in Program.cs
- [ ] Create/review BidHub for real-time bidding updates
- [ ] Implement hub methods:
  - JoinAuction(auctionId) - subscribe to auction updates
  - LeaveAuction(auctionId) - unsubscribe
  - BroadcastNewBid(auctionId, bidInfo) - notify all watchers
- [ ] Add authentication to SignalR hub
- [ ] Create NotificationHub for user notifications
- [ ] Implement notification methods (send to specific user/group)
- [ ] Add connection lifecycle logging
- [ ] Handle reconnection scenarios

### 3.2 Frontend - SignalR Integration
- [ ] Install @microsoft/signalr package (if not already)
- [ ] Create SignalR service/context for bid updates
- [ ] Connect to BidHub when viewing auction detail page
- [ ] Subscribe to auction-specific updates
- [ ] Update UI in real-time when new bids arrive
- [ ] Create NotificationHub connection service
- [ ] Implement real-time notification receiver
- [ ] Add toast notifications for bid events
- [ ] Handle connection errors and reconnection
- [ ] Test with multiple browser tabs/users

### 3.3 Live Auction Experience
- [ ] Add visual indicators for active bidding (pulse animations, etc.)
- [ ] Implement optimistic UI updates (show bid immediately, rollback on error)
- [ ] Add sound notifications for new bids (optional, user preference)
- [ ] Create live auction counter (number of active bidders)
- [ ] Implement "auction ending soon" warnings
- [ ] Add anti-sniping logic (extend auction if bid in last seconds - optional)

**Validation Checkpoint:**
- Multiple users can bid on same auction simultaneously
- All users see bid updates in real-time
- Notifications arrive instantly without page refresh
- Connection handles errors gracefully

---

## Phase 4: Enhanced User Features
**Goal:** Complete the user experience with advanced features.

### 4.1 Watchlist & Favorites ✅ COMPLETE
- [x] Backend: Create watchlist endpoints (add, remove, list, check, get watchers count)
- [x] Backend: Create Watchlist model and database table (migration applied)
- [x] Backend: Implement WatchlistService with 5 methods
- [x] Backend: Create WatchlistController with [Authorize] endpoints
- [x] Frontend: Implement watchlist functionality in AuctionCard (heart icon toggle)
- [x] Frontend: Add watchlist functionality in AuctionDetailsPage (two heart icon locations)
- [x] Frontend: Add watchlist page showing all saved auctions (WatchlistPage.tsx)
- [x] Frontend: Add watchlist link to header navigation with count badge
- [x] Frontend: Implement auto-refresh of watchlist count (every 30 seconds)
- [x] Frontend: Fix API response parsing (checkWatchlist, getWatchersCount)
- [x] Frontend: Fix WatchlistPage routing bug (use auctionId instead of watchlist entry id)
- [x] Add error handling for 404 (item not in watchlist)
- [x] Display watchers count on auction cards and details page
- [x] Persist watchlist data in database (survives page refreshes)
- [ ] Send notifications when watchlist auction is ending soon (pending notification system)

### 4.2 Transaction & Payment (Basic)
- [ ] Backend: Create Order/Transaction model
- [ ] Implement winner notification when auction closes
- [ ] Create transaction history endpoint
- [ ] Add payment status tracking (Pending, Paid, Shipped, Completed)
- [ ] Frontend: Create "Won Auctions" page
- [ ] Display payment instructions
- [ ] Add order tracking interface

### 4.3 User Ratings & Reviews
- [ ] Backend: Create Rating/Review model (for sellers)
- [ ] Implement rating endpoints (create, list)
- [ ] Add rating aggregation to user profiles
- [ ] Frontend: Create rating/review form
- [ ] Display seller ratings on auction pages
- [ ] Show reviews on user profile pages

### 4.4 Notifications System (User-Side)
- [ ] Backend: Create Notification model (Type, Message, IsRead, UserId)
- [ ] Implement notification creation service
- [ ] Add notification endpoints (list, mark as read, mark all as read)
- [ ] Create notification triggers:
  - Outbid on an auction
  - Auction you're watching is ending soon
  - You won an auction
  - Someone bid on your auction
  - Your auction ended
- [ ] Frontend: Create notification dropdown/panel
- [ ] Add unread notification badge
- [ ] Implement notification list with read/unread states
- [ ] Add notification settings page (email preferences, etc.)

**Validation Checkpoint:**
- Users receive timely notifications for relevant events
- Watchlist and transaction features work end-to-end
- Rating system displays correctly and updates profiles

---

## Phase 5: Admin Dashboard (Now with Full Context)
**Goal:** Build comprehensive admin tools with all underlying data in place.

### 5.1 Admin - User Management (Polish)
- [x] User CRUD operations (already implemented)
- [x] Role management (User/Admin) (already implemented)
- [ ] Add user statistics (total bids, auctions created, win rate)
- [ ] Implement user suspension/ban functionality
- [ ] Add user activity logs
- [ ] Create user search and advanced filters
- [ ] Add bulk user actions (export, bulk role change)

### 5.2 Admin - Auction Management (Polish)
- [x] Auction listing with categories (already implemented)
- [x] Status change functionality (already implemented)
- [x] Delete/flag auctions (already implemented)
- [ ] Add auction approval workflow (Pending → Open)
- [ ] Implement auction analytics (views, bid count, engagement)
- [ ] Create auction report handling (flagged content)
- [ ] Add auction editing capabilities (admin override)
- [ ] Implement auction scheduling (auto-publish at specified time)

### 5.3 Admin - Notifications Management
- [ ] Create admin notification dashboard
- [ ] Display notification statistics (sent, delivered, read rates)
- [ ] Implement broadcast notification (send to all users or groups)
- [ ] Add notification templates management
- [ ] Create notification scheduling (send at specific time)
- [ ] Implement notification filtering/search
- [ ] Add notification analytics (engagement tracking)
- [ ] Create notification settings override (force send critical alerts)

### 5.4 Admin - Analytics & Reporting
- [ ] Create admin analytics dashboard
- [ ] Display platform statistics (total users, active auctions, revenue)
- [ ] Add growth charts (new users over time, auction volume)
- [ ] Implement category performance analysis
- [ ] Create revenue reports (transaction fees, premium features)
- [ ] Add user engagement metrics (DAU, MAU, retention)
- [ ] Implement auction success rate analysis
- [ ] Create exportable reports (CSV, PDF)

### 5.5 Admin - System Settings
- [ ] Create platform settings page (site name, contact info, etc.)
- [ ] Add category management (CRUD operations)
- [ ] Implement fee configuration (listing fees, transaction fees)
- [ ] Create email template editor
- [ ] Add auction rules configuration (minimum bid increment, duration limits)
- [ ] Implement content moderation settings
- [ ] Create backup/restore interface (if applicable)

**Validation Checkpoint:**
- Admin can manage all aspects of the platform
- Notifications system is fully functional with analytics
- Reports provide meaningful business insights
- Settings changes apply correctly across the platform

---

## Phase 6: Testing & Optimization
**Goal:** Ensure quality, performance, and security.

### 6.1 Testing
- [ ] Write unit tests for all services (backend)
- [ ] Create integration tests for API endpoints
- [ ] Add end-to-end tests for critical user flows
- [ ] Implement component tests (frontend)
- [ ] Test role-based access control thoroughly
- [ ] Perform security audit (SQL injection, XSS, CSRF)
- [ ] Load test real-time features (SignalR under high load)
- [ ] Test on multiple browsers and devices

### 6.2 Performance Optimization
- [ ] Add database indexes for frequently queried fields
- [ ] Implement API response caching where appropriate
- [ ] Optimize image loading (lazy loading, compression)
- [ ] Add pagination to all list endpoints
- [ ] Implement database query optimization
- [ ] Add frontend code splitting
- [ ] Optimize bundle size
- [ ] Implement CDN for static assets (production)

### 6.3 Security Hardening
- [ ] Review and strengthen JWT implementation
- [ ] Add rate limiting to API endpoints
- [ ] Implement CORS properly
- [ ] Add input validation and sanitization everywhere
- [ ] Enable HTTPS (production)
- [ ] Implement secure password policies
- [ ] Add audit logging for admin actions
- [ ] Review and fix any security vulnerabilities

### 6.4 Documentation
- [ ] Create API documentation (Swagger/OpenAPI)
- [ ] Write deployment guide
- [ ] Document environment setup
- [ ] Create user guide/help pages
- [ ] Document admin features
- [ ] Add inline code documentation
- [ ] Create troubleshooting guide

---

## Phase 7: Deployment & Launch
**Goal:** Deploy to production and monitor.

### 7.1 Pre-Deployment
- [ ] Set up production database
- [ ] Configure production environment variables
- [ ] Set up SSL certificates
- [ ] Configure production logging
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Create database backup strategy
- [ ] Configure email service for production
- [ ] Set up monitoring and alerts

### 7.2 Deployment
- [ ] Deploy backend to hosting service (Azure, AWS, etc.)
- [ ] Deploy frontend to hosting/CDN
- [ ] Configure domain and DNS
- [ ] Run database migrations on production
- [ ] Test all features in production environment
- [ ] Set up CI/CD pipeline
- [ ] Create rollback plan

### 7.3 Post-Launch
- [ ] Monitor application performance
- [ ] Track error rates and fix issues
- [ ] Gather user feedback
- [ ] Plan feature iterations
- [ ] Monitor security alerts
- [ ] Optimize based on real usage patterns

---

## Current Status Summary
✅ **Completed:**
- **Phase 1 - User Management & Authentication (90% COMPLETE):**
  - ✅ User registration, login, JWT authentication, and logout
  - ✅ User model extended with profile fields (ProfileImageUrl, PhoneNumber, Address, Bio)
  - ✅ User profile endpoints (GET /api/auth/me, PUT /api/auth/profile, POST /api/auth/change-password, POST /api/auth/profile-image)
  - ✅ User statistics endpoint (GET /api/users/stats, /api/users/active-bids, /api/users/won-auctions)
  - ✅ User profile page (UserProfile.tsx) with view/edit functionality
  - ✅ Enhanced UserDashboard with real API data for stats, bids, and auctions
  - ✅ Database migration for new profile fields applied
  - ✅ Basic admin user management (CRUD, role assignment)
  - ✅ Basic admin auction management (list, status change, delete)
  - ✅ Dynamic category fetching
  - ✅ JWT authentication setup
  - ✅ New auctions default to "Pending" status

- **Phase 2 - Auction Core Features (IN PROGRESS):**
  - ✅ Real-time bidding via SignalR (BidHub)
  - ✅ Auction listing and detail pages
  - ✅ Bidding interface with validation
  - ✅ Bid history display
  - ✅ Auction timer/countdown

- **Phase 4 - Enhanced User Features:**
  - ✅ **Watchlist & Favorites (100% COMPLETE):**
    - ✅ Backend: Watchlist model, database table, 5 endpoints (add, remove, list, check, count)
    - ✅ Backend: WatchlistService and WatchlistController with authorization
    - ✅ Frontend: Watchlist toggle in AuctionCard and AuctionDetailsPage (heart icon)
    - ✅ Frontend: WatchlistPage with grid layout and empty state
    - ✅ Frontend: Header navigation with live watchlist count badge (auto-refresh)
    - ✅ Frontend: Fixed API response parsing and routing bugs
    - ✅ Persistent storage in database
    - ✅ Real-time watchers count display
    - ✅ Error handling for edge cases

📍 **Current Phase:** Phase 2 - Auction Core Features (In Progress)
**Next Immediate Tasks:**
1. ~~Implement watchlist/favorites feature~~ ✅ DONE
2. Continue with Phase 2 remaining tasks (auction creation, image upload, search, filters)
3. Complete bidding system enhancements
4. Move to Phase 3: Real-Time Features (SignalR notifications)

---

## Timeline Estimate
- **Phase 1:** 1-2 weeks
- **Phase 2:** 2-3 weeks
- **Phase 3:** 1-2 weeks
- **Phase 4:** 2-3 weeks
- **Phase 5:** 2 weeks
- **Phase 6:** 1-2 weeks
- **Phase 7:** 1 week

**Total Estimated Time:** 10-15 weeks (adjustable based on team size and feature scope)

---

## Notes & Recommendations

### Priority Order Rationale:
1. **Users First:** Everything depends on user accounts and authentication
2. **Auctions Next:** Core business logic that defines the platform
3. **Real-time Features:** Enhances user experience with live updates
4. **Enhanced Features:** Makes the platform competitive and engaging
5. **Admin Last:** Admin tools are most effective when built on stable foundations
6. **Testing & Deployment:** Ensures quality and successful launch

### Key Dependencies:
- Admin notifications rely on user notifications being implemented
- Admin analytics require auction and bidding data to be flowing
- Real-time features should be tested with actual auction and bid data
- Payment features depend on auction completion workflow

### Best Practices:
- Test each phase thoroughly before moving to the next
- Keep frontend and backend changes in sync
- Document API changes as you go
- Commit code frequently with clear messages
- Consider feature flags for gradual rollout
- Get user feedback early and often

---

## Quick Reference Checklist

**Before Starting Phase 2:**
- [ ] Users can register and login
- [ ] User dashboard displays correctly
- [ ] Profile updates work
- [ ] Role-based access is enforced

**Before Starting Phase 3:**
- [ ] Auctions can be created with images
- [ ] Auction listings work with filters
- [ ] Bidding works with all validation rules
- [ ] Bid history displays correctly

**Before Starting Phase 5:**
- [ ] Real-time bidding is functional
- [ ] Notifications are working for users
- [ ] All user-facing features are stable
- [ ] Core auction lifecycle is complete

---

*This workplan is a living document. Update task status and adjust priorities as the project evolves.*
