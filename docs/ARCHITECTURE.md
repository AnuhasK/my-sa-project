# Auction House System Architecture

```mermaid
flowchart TD
    subgraph Frontend
        A[React.js / HTML / CSS / JS]
    end

    subgraph Backend
        B[API Layer: ASP.NET Core Controllers]
        C[Service Layer: Business Logic]
        D[Repository Layer: Data Access]
        E[SignalR Hub: Real-Time Bidding]
        F[Stripe Integration: Payments & Webhooks]
    end

    subgraph Database
        G[(SQL Server / PostgreSQL)]
    end

    A -- REST API Calls --> B
    B -- Calls --> C
    C -- Calls --> D
    D -- Queries & Data --> G
    E <--> A
    F -- Webhooks --> B
```

---


- **Presentation Layer:** Built using React (Vite + Tailwind CSS), this layer handles user interactions and displays real-time data updates.
- **Business Logic Layer:** Implemented in ASP.NET Core, this layer manages application logic through controllers and services.
- **Data Access Layer:** Uses Entity Framework Core and the Repository Pattern to manage data transactions.
- **SignalR Hub:** Real-time bidding and notifications.
- **Stripe Integration:** Payment sessions and webhooks.
- **Database Layer:** SQL Server (or PostgreSQL) for persistent storage.
