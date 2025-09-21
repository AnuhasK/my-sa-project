# Changelog

All notable changes to the Auction Website Project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Changelog file to track project changes

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
