# Auction House Platform

A full-stack online auction management system built with ASP.NET Core 9.0 and React 18. This platform enables secure, real-time bidding with comprehensive user management, payment processing, and administrative controls.

## Technical Architecture

### Backend: ASP.NET Core 9.0 Web API

The backend leverages modern ASP.NET Core features to deliver a scalable, secure, and maintainable REST API with real-time capabilities.

#### Core Technologies

- **Framework**: ASP.NET Core 9.0 Web API
- **Database**: SQL Server with Entity Framework Core 9.0.9
- **Authentication**: JWT Bearer tokens with role-based authorization
- **Real-time Communication**: SignalR for live bidding and notifications
- **Payment Processing**: Stripe.NET SDK (v49.0.0)
- **Password Security**: BCrypt.Net-Next (v4.0.3)
- **API Documentation**: Swagger/OpenAPI

#### Project Structure

```
backend/AuctionHouse.Api/
├── Controllers/          # RESTful API endpoints
├── Services/             # Business logic layer
├── Models/               # Entity Framework domain models
├── DTOs/                 # Data Transfer Objects
├── Data/                 # DbContext, migrations, seeding
├── Hubs/                 # SignalR hubs for real-time features
├── Middleware/           # Custom middleware (token revocation)
├── Migrations/           # EF Core database migrations
├── wwwroot/             # Static file serving (uploaded images)
└── Program.cs           # Application configuration and DI setup
```

### Frontend: React 18 + TypeScript

The frontend provides a modern, responsive user interface with real-time updates and seamless API integration.

#### Core Technologies

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: Radix UI primitives with shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Real-time**: SignalR client (@microsoft/signalr)
- **Forms**: React Hook Form
- **Charts**: Recharts

## ASP.NET Core Implementation Details

### Dependency Injection Configuration

The application uses ASP.NET Core's built-in dependency injection container for service registration:

```csharp
// Scoped services for database operations
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAuctionService, AuctionService>();
builder.Services.AddScoped<IBidService, BidService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();

// Background services for automated tasks
builder.Services.AddHostedService<AuctionClosingService>();
```

### Entity Framework Core Integration

#### DbContext Configuration

```csharp
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
```

#### Database Initialization

The application automatically applies migrations and seeds initial data on startup:

```csharp
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await db.Database.MigrateAsync();
    await SeedData.EnsureSeedData(db);
}
```

### JWT Authentication Implementation

Configured using ASP.NET Core's authentication middleware with custom token validation:

```csharp
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = jwtSection["Issuer"],
        ValidAudience = jwtSection["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateLifetime = true
    };
    
    // SignalR token handling via query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && 
                path.StartsWithSegments("/hubs/auction"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});
```

### SignalR Hub Configuration

Real-time bidding and notifications are handled through a dedicated SignalR hub:

```csharp
builder.Services.AddSignalR();

// Hub endpoint mapping
app.MapHub<AuctionHub>("/hubs/auction");
```

### CORS Policy

Configured to allow cross-origin requests from the React frontend:

```csharp
builder.Services.AddCors(opts =>
{
    opts.AddPolicy("AllowReactApp", p => 
        p.WithOrigins("http://localhost:3000", "http://localhost:5173")
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials());
});
```

### Middleware Pipeline

The application follows ASP.NET Core middleware ordering best practices:

```csharp
app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowReactApp");
app.UseStaticFiles();
app.UseAuthentication();
app.UseTokenRevocation();  // Custom middleware
app.UseAuthorization();
app.MapControllers();
app.MapHub<AuctionHub>("/hubs/auction");
```

### Custom Middleware

#### Token Revocation Middleware

Implements token blacklisting for logout functionality:

```
Middleware/TokenRevocationMiddleware.cs
```

This middleware checks revoked tokens after authentication but before authorization, ensuring logged-out users cannot access protected resources.

## API Architecture

### RESTful Controllers

The API follows REST conventions with 14 controllers:

| Controller | Responsibility |
|------------|---------------|
| `AuthController` | User registration, login, logout, token management |
| `UsersController` | User profile management and CRUD operations |
| `AuctionsController` | Auction CRUD, search, filtering, status management |
| `BidsController` | Bid placement, validation, history retrieval |
| `CategoriesController` | Category management |
| `ImagesController` | Image upload and retrieval |
| `WatchlistController` | User watchlist operations |
| `TransactionsController` | Transaction records and history |
| `PaymentsController` | Stripe payment integration and webhooks |
| `NotificationsController` | User notifications and preferences |
| `AdminController` | User management, auction moderation |
| `AnalyticsController` | Platform statistics and reporting |
| `AnnouncementsController` | System-wide announcements |
| `ActivityLogsController` | Audit logging |

### Service Layer Pattern

Business logic is encapsulated in service classes, following the Repository/Service pattern:

```
Services/
├── AuthService.cs              # Authentication and authorization
├── AuctionService.cs           # Auction business logic
├── BidService.cs               # Bidding rules and validation
├── TransactionService.cs       # Payment and transaction handling
├── NotificationService.cs      # Notification dispatch
├── PaymentService.cs           # Stripe integration
├── AdminService.cs             # Administrative operations
├── AuctionClosingService.cs    # Background service for auction closure
└── [Interface definitions]
```

### Data Transfer Objects (DTOs)

All API communication uses DTOs to:
- Decouple API contracts from database models
- Control data exposure (security)
- Enable validation attributes
- Support versioning

```
DTOs/
├── AuthDtos.cs           # Login, register, token responses
├── AuctionDtos.cs        # Auction creation, updates, listings
├── BidDtos.cs            # Bid placement and history
├── UserDtos.cs           # User profiles and updates
├── TransactionDto.cs     # Transaction records
├── NotificationDtos.cs   # Notification payloads
└── AdminDtos.cs          # Administrative data structures
```

## Database Schema

### Entity Models

The application uses Entity Framework Core with the following domain models:

| Model | Description |
|-------|-------------|
| `User` | User accounts with roles and authentication data |
| `Auction` | Auction items with status, timing, and pricing |
| `Bid` | Bid records with amount, timestamp, and bidder |
| `Category` | Auction categories for organization |
| `AuctionImage` | Multiple images per auction |
| `Watchlist` | User-specific auction watchlists |
| `Transaction` | Payment and fulfillment records |
| `Notification` | User notifications with type and status |
| `RevokedToken` | Blacklisted JWT tokens for logout |
| `ActivityLog` | Audit trail for administrative actions |
| `Announcement` | System-wide announcements |

### Relationships

- User → Auction (1:Many) - Seller relationship
- User → Bid (1:Many) - Bidder relationship
- Auction → Bid (1:Many) - Bid history
- Auction → AuctionImage (1:Many) - Multiple images
- Auction → Category (Many:1) - Categorization
- User → Watchlist (1:Many) - Saved auctions
- User → Transaction (1:Many) - Purchase history
- User → Notification (1:Many) - User notifications

## Real-Time Features with SignalR

### AuctionHub Implementation

The SignalR hub provides real-time updates for:

- Bid placement broadcasts to all connected clients
- Auction status changes (ended, extended)
- User join/leave notifications for auction rooms
- Live price updates

### Client Connection Management

Clients join auction-specific groups to receive targeted updates:

```typescript
// Join auction group
await signalRService.joinAuctionGroup(auctionId);

// Listen for bid updates
signalRService.onBidPlaced((bidData) => {
    updateAuctionUI(bidData);
});
```

## Payment Integration

### Stripe Implementation

The application integrates Stripe for secure payment processing:

- **Payment Sessions**: Server-side session creation with `PaymentService`
- **Webhook Handling**: Automated transaction updates on payment events
- **Security**: PCI DSS compliance through Stripe's hosted checkout
- **Refunds**: Administrative refund capabilities

### Payment Flow

1. Auction ends, winner is determined
2. Transaction record created with "Pending" status
3. Payment session generated via Stripe API
4. User redirected to Stripe Checkout
5. Webhook confirms payment
6. Transaction status updated to "Paid"
7. Notification sent to buyer and seller

## Background Services

### AuctionClosingService

Implemented as an `IHostedService` to automatically:

- Monitor auction end times
- Update auction status to "Closed"
- Determine winning bidder
- Create transaction records
- Send notifications to participants

## Configuration Management

### Secure Configuration Loading

The application uses a layered configuration approach:

```csharp
// Base configuration
appsettings.json (committed, no secrets)

// Environment-specific
appsettings.Development.json
appsettings.Production.json

// Local secrets (not committed)
builder.Configuration.AddJsonFile("appsettings.Secrets.json", optional: true);

// Environment variables (production)
builder.Configuration.AddEnvironmentVariables();
```

### Required Configuration

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=AuctionHouseDB;..."
  },
  "Jwt": {
    "Key": "your-secret-key-minimum-16-characters",
    "Issuer": "AuctionHouse",
    "Audience": "AuctionHouseUsers",
    "ExpiresMinutes": 120
  },
  "Stripe": {
    "PublishableKey": "pk_test_...",
    "SecretKey": "sk_test_...",
    "WebhookSecret": "whsec_..."
  }
}
```

## Security Implementation

### Authentication & Authorization

- **JWT Tokens**: Stateless authentication with configurable expiration
- **Role-Based Access Control**: Admin and User roles with `[Authorize(Roles = "...")]`
- **Token Revocation**: Middleware-based blacklisting for logout
- **Password Hashing**: BCrypt with salt rounds for secure storage

### Input Validation

- Model validation attributes in DTOs
- Business rule validation in service layer
- SQL injection prevention via parameterized queries (EF Core)

### HTTPS & CORS

- HTTPS redirection enforced
- CORS configured for specific frontend origins
- Credentials allowed for SignalR connections

## Development Setup

### Prerequisites

- .NET 9.0 SDK
- SQL Server (LocalDB or full instance)
- Node.js 18+ and npm
- Visual Studio 2022 or VS Code

### Backend Setup

```bash
cd backend/AuctionHouse.Api

# Restore packages
dotnet restore

# Create secrets file from template
copy appsettings.json appsettings.Secrets.json
# Edit appsettings.Secrets.json with your credentials

# Apply migrations
dotnet ef database update

# Run the API
dotnet run
```

The API will be available at `http://localhost:5021`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000` or `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - Token revocation

### Auctions
- `GET /api/auctions` - List auctions with filtering
- `GET /api/auctions/{id}` - Get auction details
- `POST /api/auctions` - Create auction (authenticated)
- `PUT /api/auctions/{id}` - Update auction (owner/admin)
- `DELETE /api/auctions/{id}` - Delete auction (owner/admin)

### Bidding
- `POST /api/bids` - Place bid (authenticated)
- `GET /api/bids/auction/{auctionId}` - Get bid history
- `GET /api/bids/user` - Get user's bid history

### Transactions
- `GET /api/transactions` - User transaction history
- `GET /api/transactions/{id}` - Transaction details
- `PUT /api/transactions/{id}/shipping` - Update shipping status

### Payments
- `POST /api/payments/create-session` - Create Stripe checkout session
- `POST /api/payments/webhook` - Stripe webhook endpoint

### Administration
- `GET /api/admin/users` - List all users (admin)
- `PUT /api/admin/users/{id}/suspend` - Suspend user (admin)
- `DELETE /api/admin/auctions/{id}` - Remove auction (admin)
- `GET /api/analytics` - Platform statistics (admin)

## Testing

### Backend Testing

PowerShell test scripts are provided in `backend/testing/`:

```powershell
# Run all Phase 1 tests
.\testing\run-all-phase1-tests.ps1

# Test specific features
.\testing\test-auction-crud.ps1
.\testing\test-bid-simple.ps1
.\testing\test-notifications.ps1
```

### Frontend Testing

Manual testing checklists available in `docs/PHASE*_TESTING_GUIDE.md`

## Deployment Considerations

### Production Configuration

- Use environment variables for sensitive configuration
- Consider Azure Key Vault for secret management
- Enable HTTPS and update CORS origins
- Configure proper connection pooling for SQL Server
- Set up log aggregation (Application Insights, Seq, etc.)

### Database

- Ensure proper indexes on frequently queried columns
- Configure backup strategy for SQL Server
- Monitor query performance with EF Core logging

### Scalability

- SignalR backplane required for multi-instance deployments (Redis, Azure SignalR Service)
- Consider API rate limiting
- Implement caching for frequently accessed data (IDistributedCache)
- Use CDN for static assets and uploaded images

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- `ARCHITECTURE.md` - System architecture and design patterns
- `PHASE*_COMPLETION_SUMMARY.md` - Development phase summaries
- `TESTING_GUIDE.md` - Testing procedures and checklists
- `SECURITY_SETUP.md` - Security configuration details
- `USER_GUIDE.md` - End-user documentation

## License

This project is developed for educational purposes as part of SE205.3 coursework.

## Technical Stack Summary

| Layer | Technology |
|-------|-----------|
| Backend Framework | ASP.NET Core 9.0 Web API |
| ORM | Entity Framework Core 9.0.9 |
| Database | SQL Server |
| Authentication | JWT Bearer Tokens |
| Real-time | SignalR |
| Payment | Stripe.NET SDK |
| Frontend | React 18 + TypeScript |
| Build Tool | Vite |
| UI Framework | Tailwind CSS + Radix UI |
| API Documentation | Swagger/OpenAPI |
