# Changelog

All notable changes to the Auction Website Project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Complete frontend-backend integration for auction pages
- Dynamic data loading for all auction-related pages
- Real-time countdown timers and ending soon detection
- Error handling and loading states for better UX
- **Local Image Storage System**: Complete image upload and storage system
- **Image Upload API**: Endpoints for uploading, serving, and deleting images
- **Smart Image Fallbacks**: Category-based image selection for auctions without uploaded images

## [0.4.0] - 2025-01-17

### Added
- **Frontend Integration with Backend API - Phase 2**:
  - Updated AuctionListingPage to load auction data from backend API
  - Updated AuctionDetailsPage to fetch auction details and bid history from backend
  - Added data transformation between backend DTOs and frontend expectations
  - Implemented loading states and error handling for all auction pages
  - Added support for dynamic categories from backend with static fallback
  - Enhanced search functionality UI (ready for backend integration)

### Changed
- **All Auction Pages Now Use Backend Data**:
  - Homepage: ✅ Already loads backend auction data
  - Auctions Page: ✅ Now loads backend auction data  
  - Categories Page: ✅ Uses same AuctionListingPage with backend data
  - Auction Details: ✅ Now loads backend auction details and bid history

### Technical
- Data transformation handles backend DTO format conversion
- Real-time time calculations for auction countdowns
- Graceful error handling with user-friendly messages
- Time ago formatting for bid history display

## [0.3.3] - 2025-01-17

### Fixed
- **Registration Response Format Issue**:
  - Fixed case sensitivity mismatch between backend response and frontend parsing
  - Backend returns `{userId, username, token}` (lowercase) but frontend expected `{UserId, Username, Token}` (uppercase)
  - Updated API transformation logic to correctly parse backend response format
  - Registration now works correctly and automatically logs users in

### Changed
- **Database Migration to SQL Server**:
  - Migrated from LocalDB to SQL Server Developer Edition
  - Updated connection string from `(localdb)\\MSSQLLocalDB` to `localhost`
  - Applied all existing migrations to new SQL Server database
  - Created seed users: admin@local, seller@local, buyer@local

### Technical Details
- **Root Cause**: Backend AuthResponseDto uses camelCase but frontend expected PascalCase
- **Database**: Now using full SQL Server instance instead of LocalDB for better development experience
- **Connection**: SSMS connects to `localhost` instead of `(localdb)\\MSSQLLocalDB`

## [0.3.2] - 2025-09-22

### Fixed
- **Registration API Compatibility Issue**:
  - Fixed field name mismatch between frontend (`userName`) and backend (`Username`)
  - Updated API service to properly transform request/response data structures
  - Fixed authentication response format to match frontend expectations
  - Registration functionality now working correctly with backend

### Changed
- **API Data Transformation**:
  - Added proper request data transformation in API service for registration
  - Added response data transformation to convert backend format to frontend format
  - Improved error handling in authentication flow

### Technical Details
- **Backend Expects**: `{ Username, Email, Password }` with capital U
- **Frontend Sends**: `{ userName, email, password }` - now properly transformed
- **Response Format**: Backend `{ UserId, Username, Token }` transformed to frontend `{ user: { id, username }, token }`

## [0.3.1] - 2025-09-21

### Added
- **Authentication Forms Integration**:
  - Connected AuthForms component to real backend authentication
  - Added proper error handling and loading states to login/register forms
  - Implemented user feedback with error messages and loading indicators
  - Added form validation for password confirmation and terms acceptance

### Changed
- **Authentication Flow**:
  - Replaced static authentication with dynamic JWT-based system
  - Updated form data structure from firstName/lastName to userName (backend compatibility)
  - Integrated useAuth hook throughout authentication components
  - Added proper async handling for login/register operations

### Fixed
- TypeScript errors in AuthForms component related to form field structure
- Form validation logic for registration process
- Button states and loading indicators during authentication requests

### Technical Details
- **Authentication**: Full JWT integration with login, register, and error handling
- **Frontend**: React hooks for authentication state management
- **User Experience**: Loading states, error messages, and form validation
- **Testing**: Both frontend (localhost:3000) and backend (localhost:5021) running successfully

## [0.3.0] - 2025-09-21

### Added
- **Backend Integration Infrastructure**:
  - Copied working ASP.NET Core backend from test project to main project
  - Created comprehensive API service layer (`frontend/src/services/api.js`)
  - Implemented SignalR service for real-time bidding (`frontend/src/services/signalr.ts`)
  - Added authentication context with JWT token management (`frontend/src/contexts/AuthContext.tsx`)
  - Environment configuration file with API URLs (`frontend/.env`)
  - TypeScript environment definitions (`frontend/src/vite-env.d.ts`)
  - Backend-frontend integration guide (`docs/backend/integration-guide.md`)
  - Comprehensive workplan for component integration (`docs/workplan.md`)
  - Updated database schema documentation to match existing backend implementation

### Changed
- **Backend Configuration**:
  - Updated CORS policy to allow React frontend connections
  - Configured backend to run on `http://localhost:5021`
  - Updated SignalR hub endpoint to `/hubs/auction`
- **Frontend Configuration**:
  - Wrapped App component with AuthProvider for authentication context
  - Updated API base URL to match backend port
  - Installed `@microsoft/signalr` package for real-time features
- **Project Structure**:
  - Backend now located in `backend/AuctionHouse.Api/`
  - API services centralized in `frontend/src/services/`
  - Authentication context available throughout the application

### Fixed
- CORS configuration for proper frontend-backend communication
- Environment variable typing for Vite development
- Import paths for SignalR and authentication services

### Technical Details
- **Backend**: ASP.NET Core 9.0 with Entity Framework, JWT authentication, SignalR
- **Database**: SQL Server LocalDB with existing migrations
- **Frontend**: React + TypeScript with API integration layer
- **Real-time**: SignalR for live bidding updates
- **Authentication**: JWT tokens with automatic refresh
- **Build Status**: ✅ Backend running on port 5021, Frontend on port 3000

### Implementation Status
- ✅ **Infrastructure**: Backend-frontend communication established
- ✅ **Services**: API client and SignalR service created
- ✅ **Authentication**: JWT token management implemented
- 🔄 **Components**: Ready for integration (static data → real API calls)
- 📋 **Next Phase**: Component integration following workplan.md

## [0.2.0] - 2025-09-17

### Added
- Created `src/pages/public/` directory for public pages
- Moved `HomePage.tsx` and `AuthForms.tsx` to public pages folder

### Changed
- **Project Structure Reorganization**:
  - Moved `Header.tsx` and `Footer.tsx` from `src/pages/user/` to `src/components/`
  - Updated all import paths in `App.tsx` to reflect new file locations
  - Fixed component imports in `Header.tsx` to use relative paths (`./button`, `./input`)
  - Updated `HomePage.tsx` import for `AuctionCard` to point to `../user/AuctionCard`

### Fixed
- Build errors related to incorrect import paths after file restructuring
- TypeScript compilation issues in multiple components

### Technical Details
- **Time**: 11:05 PM GMT+5:30
- **Build Status**: ✅ Successful (909.54 kB bundle size)
- **Components Affected**: App.tsx, Header.tsx, Footer.tsx, HomePage.tsx, AuthForms.tsx

## [0.1.1] - 2025-09-16

### Fixed
- **TypeScript Error Resolution**:
  - Fixed implicit 'any' types in `SupportTickets.tsx` event handlers
  - Added proper type annotations in `AdminSettings.tsx` for form inputs
  - Resolved TypeScript errors in `NotificationCenter.tsx`
  - Removed unused imports across multiple files

### Changed
- Enhanced type safety across admin components
- Improved code quality with proper TypeScript annotations

### Technical Details
- **Focus**: TypeScript strict mode compliance
- **Files Modified**: SupportTickets.tsx, AdminSettings.tsx, NotificationCenter.tsx
- **Error Resolution**: Event handler typing, Settings interface usage

## [0.1.0] - 2025-09-16

### Added
- Initial React + TypeScript frontend setup
- Complete component structure with user and admin interfaces
- shadcn/ui component library integration
- Vite build configuration
- Basic project folder structure

### Features
- User authentication forms (login, register, password reset)
- Auction listing and details pages
- Admin dashboard with management interfaces
- Responsive design with Tailwind CSS
- Component-based architecture

### Technical Stack
- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: shadcn/ui, Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite 6.3.6

---

## How to Use This Changelog

### For Developers
- Add new entries under `[Unreleased]` section
- Move entries to a new version section when releasing
- Use semantic versioning (MAJOR.MINOR.PATCH)

### Entry Categories
- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

### Format Example
```markdown
## [1.0.0] - 2025-MM-DD

### Added
- New feature description

### Changed
- Modified feature description

### Fixed
- Bug fix description
```
