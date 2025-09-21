# Backend-Frontend Integration Setup Guide

## ✅ Changes Made

### 1. Updated Database Schema
- Updated [`docs/database/schema.md`](docs/database/schema.md ) to match existing backend implementation
- Added complete entity relationships and implementation status

### 2. Created API Service Layer
- **File:** [`frontend/src/services/api.js`](frontend/src/services/api.js )
- **Features:** Complete API client for all backend endpoints
- **Includes:** Authentication, Auctions, Bids, Images, Transactions

### 3. Created SignalR Service
- **File:** [`frontend/src/services/signalr.ts`](frontend/src/services/signalr.ts )
- **Features:** Real-time bidding with automatic reconnection
- **Events:** BidPlaced, AuctionEnded, UserJoined/Left

### 4. Created Authentication Context
- **File:** [`frontend/src/contexts/AuthContext.tsx`](frontend/src/contexts/AuthContext.tsx )
- **Features:** Login, Register, JWT token management, SignalR integration

### 5. Environment Configuration
- **File:** [`frontend/.env`](frontend/.env )
- **Features:** API URLs, configuration values

### 6. Installed Dependencies
- ✅ `@microsoft/signalr` for real-time features

## 🚀 Next Steps to Complete Integration

### Step 1: Copy Your Backend
```bash
# Delete the old backend folder
rm -rf backend

# Copy your working backend from test project
cp -r "test Project/Backend/AuctionHouse" backend
```

### Step 2: Update Backend CORS
Add this to your [`backend/Program.cs`](backend/Program.cs ):

```csharp
// Add before builder.Build()
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Add after app is created, before other middleware
app.UseCors("AllowReactApp");
```

### Step 3: Update Frontend App.tsx
Wrap your app with AuthProvider:

```tsx
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      {/* Your existing app content */}
    </AuthProvider>
  );
}
```

### Step 4: Update Your Components
Use the new services in your components:

```tsx
// In any component
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { signalRService } from '../services/signalr';

function AuctionComponent() {
  const { user, token } = useAuth();
  
  const loadAuctions = async () => {
    const auctions = await api.getAuctions();
    // Handle auctions
  };
  
  const placeBid = async (auctionId, amount) => {
    if (token) {
      await api.placeBid(auctionId, amount, token);
    }
  };
}
```

### Step 5: Test the Integration
1. **Start Backend:**
   ```bash
   cd backend/AuctionHouse.Api
   dotnet run
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Features:**
   - User registration/login
   - Viewing auctions
   - Placing bids
   - Real-time updates

## 🔧 Environment Variables

Update [`frontend/.env`](frontend/.env ) with your backend URL:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SIGNALR_URL=http://localhost:5000/auctionHub
```

## 🛠️ Additional Configuration

### Update tsconfig.json (if needed)
Add to [`frontend/tsconfig.json`](frontend/tsconfig.json ):
```json
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

### Update vite-env.d.ts
Add to [`frontend/src/vite-env.d.ts`](frontend/src/vite-env.d.ts ):
```typescript
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_SIGNALR_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## ✨ Key Features Now Available

- ✅ **Authentication:** Login/Register with JWT tokens
- ✅ **Real-time Bidding:** Live updates using SignalR
- ✅ **Image Upload:** Support for auction images
- ✅ **Transaction Tracking:** Complete transaction history
- ✅ **Error Handling:** Comprehensive error management
- ✅ **Type Safety:** TypeScript interfaces for all data

## 🎯 Ready to Develop!

Your frontend and backend are now ready to work together. You can start:
1. Testing authentication flows
2. Building auction listing pages
3. Implementing real-time bidding
4. Adding image upload features
5. Creating user dashboards

The integration provides a solid foundation for your auction platform!