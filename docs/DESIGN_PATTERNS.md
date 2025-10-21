# Software Design Patterns in Auction House Project

This document lists the key software design patterns used in the Auction House project, with examples of where they are implemented in the codebase.

---

## 1. Repository Pattern
- **Purpose:** Abstracts data access logic and provides a clean interface for data operations.
- **Implementation:**
  - `backend/AuctionHouse.Api/Repositories/` (all repository classes)
  - Example: `AuctionRepository.cs`, `UserRepository.cs`
  - Used in: `backend/AuctionHouse.Api/Services/` (service classes call repositories)

## 2. Service Layer Pattern
- **Purpose:** Encapsulates business logic, keeping controllers thin.
- **Implementation:**
  - `backend/AuctionHouse.Api/Services/` (all service classes)
  - Example: `AuctionService.cs`, `TransactionService.cs`
  - Used in: `backend/AuctionHouse.Api/Controllers/` (controllers call services)

## 3. Controller Pattern (MVC)
- **Purpose:** Handles HTTP requests, maps to service calls, returns responses.
- **Implementation:**
  - `backend/AuctionHouse.Api/Controllers/` (all controller classes)
  - Example: `AuctionsController.cs`, `AuthController.cs`

## 4. Dependency Injection
- **Purpose:** Decouples class dependencies, improves testability and maintainability.
- **Implementation:**
  - `backend/AuctionHouse.Api/Program.cs` (service and repository registration)
  - Example lines: `builder.Services.AddScoped<IAuctionService, AuctionService>();`

## 5. DTO (Data Transfer Object) Pattern
- **Purpose:** Transfers data between layers, decoupling internal models from API contracts.
- **Implementation:**
  - `backend/AuctionHouse.Api/DTOs/` (all DTO classes)
  - Example: `AuctionCreateDto.cs`, `UserDto.cs`
  - Used in: Controllers and Services

## 6. Singleton Pattern
- **Purpose:** Ensures a class has only one instance (e.g., configuration, Stripe client).
- **Implementation:**
  - `backend/AuctionHouse.Api/Program.cs` (singleton registration)
  - Example: `builder.Services.AddSingleton<IStripeClient, StripeClient>();`

## 7. Observer / Publish-Subscribe Pattern
- **Purpose:** Enables real-time updates and notifications.
- **Implementation:**
  - `backend/AuctionHouse.Api/Hubs/` (SignalR hubs)
  - Example: `BiddingHub.cs`
  - Used in: Backend (SignalR) and Frontend (React SignalR client)

## 8. Unit of Work Pattern (via EF Core DbContext)
- **Purpose:** Ensures a set of changes are committed as a single transaction.
- **Implementation:**
  - `backend/AuctionHouse.Api/Data/ApplicationDbContext.cs`
  - Used in: All repository and service classes

## 9. Factory Pattern (where applicable)
- **Purpose:** Encapsulates object creation logic (e.g., Stripe session creation).
- **Implementation:**
  - `backend/AuctionHouse.Api/Services/PaymentService.cs` (Stripe session creation logic)

---

> **Note:** File and line numbers may vary depending on your exact codebase structure. Use the above as a guide to locate the relevant implementations.


Your project uses the following architectural styles:

Layered (N-Tier) Architecture

The codebase is organized into clear layers: Presentation (React frontend), API/Controller, Service (business logic), Repository (data access), and Database.
Each layer has a distinct responsibility and communicates only with adjacent layers.
Client-Server Architecture

The frontend (React) acts as a client, communicating with the backend (ASP.NET Core API) over HTTP/REST.
The backend serves data and business logic, while the frontend handles user interaction and presentation.
RESTful Architecture

The backend exposes RESTful API endpoints for all resources (users, auctions, bids, etc.).
Follows REST principles: statelessness, resource-based URLs, standard HTTP methods (GET, POST, PUT, DELETE, PATCH).
Event-Driven/Real-Time Architecture

SignalR is used for real-time features (bidding, notifications), enabling event-driven communication between server and clients.
Microkernel/Plugin (to a small extent)

The use of background services (e.g., AuctionClosingService) and integration with external services (Stripe) shows extensibility, though the core is still layered.
These styles together provide a robust, scalable, and maintainable foundation for your auction platform. If you want this in your documentation, let me know!
