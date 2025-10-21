import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/public/HomePage';
import { AuctionListingPage } from './pages/user/AuctionListingPage';
import { AuctionDetailsPage } from './pages/user/AuctionDetailsPage';
import { AuthForms } from './pages/public/AuthForms';
import { UserDashboard } from './pages/user/UserDashboard';
import { UserProfile } from './pages/user/UserProfile';
import { WatchlistPage } from './pages/user/WatchlistPage';
import { WonAuctionsPage } from './pages/user/WonAuctionsPage';
import { PaymentSuccess } from './pages/user/PaymentSuccess';
import { PaymentCancelled } from './pages/user/PaymentCancelled';
import { AdminSidebar } from './pages/admin/AdminSidebar';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { AuctionManagement } from './pages/admin/AuctionManagement';
import { AdminCreateAuction } from './pages/admin/AdminCreateAuction';
import { CategoryManagement } from './pages/admin/CategoryManagement';
import { TransactionManagement } from './pages/admin/TransactionManagement';
import { Reports } from './pages/admin/Reports';
import { NotificationCenter } from './pages/admin/NotificationCenter';
import { AdminSettings } from './pages/admin/AdminSettings';
import { SupportTickets } from './pages/admin/SupportTickets';
import { Button } from './components/button';
import { Toaster } from './components/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedAuction, setSelectedAuction] = useState('1');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Handle URL-based routing (for external redirects like Stripe)
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/payment-success') {
      setCurrentPage('payment-success');
    } else if (path === '/payment-cancelled') {
      setCurrentPage('payment-cancelled');
    }
  }, []);

  // Redirect admin to admin dashboard on initial load
  useEffect(() => {
    if (isAuthenticated && isAdmin && currentPage === 'home') {
      setCurrentPage('admin-dashboard');
    }
  }, [isAuthenticated, isAdmin]);

  const handleLogout = async () => {
    await logout();
    setCurrentPage('home');
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage 
            setCurrentPage={setCurrentPage} 
            setSelectedAuction={setSelectedAuction}
            setSelectedCategory={setSelectedCategory}
          />
        );
      case 'auctions':
        return (
          <AuctionListingPage 
            setCurrentPage={setCurrentPage}
            setSelectedAuction={setSelectedAuction}
            isAdmin={isAdmin}
            initialCategoryId={selectedCategory}
          />
        );
      case 'auction-details':
        return (
          <AuctionDetailsPage 
            auctionId={selectedAuction}
            setCurrentPage={setCurrentPage}
            isAdmin={isAdmin}
          />
        );
      case 'login':
        return (
          <AuthForms 
            mode="login"
            setCurrentPage={setCurrentPage}
          />
        );
      case 'register':
        return (
          <AuthForms 
            mode="register"
            setCurrentPage={setCurrentPage}
          />
        );
      case 'reset-password':
        return (
          <AuthForms 
            mode="reset-password"
            setCurrentPage={setCurrentPage}
          />
        );
      case 'dashboard':
        return isAuthenticated ? (
          isAdmin ? (
            // Redirect admin to admin dashboard
            <>
              {setCurrentPage('admin-dashboard')}
              {null}
            </>
          ) : (
            <UserDashboard 
              setCurrentPage={setCurrentPage}
              setSelectedAuction={setSelectedAuction}
            />
          )
        ) : (
          <AuthForms 
            mode="login"
            setCurrentPage={setCurrentPage}
          />
        );
      case 'profile':
        return isAuthenticated ? (
          <UserProfile />
        ) : (
          <AuthForms 
            mode="login"
            setCurrentPage={setCurrentPage}
          />
        );
      case 'payment-success':
        return <PaymentSuccess setCurrentPage={setCurrentPage} />;
      case 'payment-cancelled':
        return <PaymentCancelled setCurrentPage={setCurrentPage} />;
      case 'watchlist':
        return isAuthenticated ? (
          <WatchlistPage 
            setCurrentPage={setCurrentPage}
            setSelectedAuction={setSelectedAuction}
          />
        ) : (
          <AuthForms 
            mode="login"
            setCurrentPage={setCurrentPage}
          />
        );
      case 'won-auctions':
      case 'my-purchases':
        return isAuthenticated ? (
          <WonAuctionsPage 
            setCurrentPage={setCurrentPage}
            setSelectedAuction={setSelectedAuction}
          />
        ) : (
          <AuthForms 
            mode="login"
            setCurrentPage={setCurrentPage}
          />
        );
      case 'categories':
        return (
          <AuctionListingPage 
            setCurrentPage={setCurrentPage}
            setSelectedAuction={setSelectedAuction}
            isAdmin={isAdmin}
          />
        );
      case 'about':
        return (
          <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">About AuctionHouse</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We are a premier online auction platform connecting collectors with unique items from around the world.
                Our mission is to provide a secure, transparent, and enjoyable bidding experience for everyone.
              </p>
            </div>
          </div>
        );
      // Admin Pages - Protected
      case 'admin-dashboard':
        return isAdmin ? <AdminDashboard setCurrentPage={setCurrentPage} /> : (
          <AuthForms mode="login" setCurrentPage={setCurrentPage} />
        );
      case 'admin-users':
        return isAdmin ? <UserManagement /> : (
          <AuthForms mode="login" setCurrentPage={setCurrentPage} />
        );
      case 'admin-auctions':
        return isAdmin ? <AuctionManagement setCurrentPage={setCurrentPage} /> : (
          <AuthForms mode="login" setCurrentPage={setCurrentPage} />
        );
      case 'admin-create-auction':
        return isAdmin ? <AdminCreateAuction setCurrentPage={setCurrentPage} /> : (
          <AuthForms mode="login" setCurrentPage={setCurrentPage} />
        );
      case 'admin-categories':
        return isAdmin ? <CategoryManagement /> : (
          <AuthForms mode="login" setCurrentPage={setCurrentPage} />
        );
      case 'admin-transactions':
        return isAdmin ? <TransactionManagement /> : (
          <AuthForms mode="login" setCurrentPage={setCurrentPage} />
        );
      case 'admin-reports':
        return isAdmin ? <Reports /> : (
          <AuthForms mode="login" setCurrentPage={setCurrentPage} />
        );
      case 'admin-notifications':
        return isAdmin ? <NotificationCenter /> : (
          <AuthForms mode="login" setCurrentPage={setCurrentPage} />
        );
      case 'admin-settings':
        return isAdmin ? <AdminSettings /> : (
          <AuthForms mode="login" setCurrentPage={setCurrentPage} />
        );
      case 'admin-support':
        return isAdmin ? <SupportTickets /> : (
          <AuthForms mode="login" setCurrentPage={setCurrentPage} />
        );
      default:
        return (
          <HomePage 
            setCurrentPage={setCurrentPage} 
            setSelectedAuction={setSelectedAuction}
            setSelectedCategory={setSelectedCategory}
          />
        );
    }
  };

  const shouldShowHeaderFooter = !['login', 'register', 'reset-password'].includes(currentPage) && !currentPage.startsWith('admin-');
  const isAdminPage = currentPage.startsWith('admin-');

  return (
    <div className="min-h-screen bg-white flex">
      {/* Admin Layout */}
      {isAdminPage ? (
        <>
          <AdminSidebar 
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onLogout={handleLogout}
          />
          <main className="flex-1 lg:ml-64 bg-gray-50">
            {renderCurrentPage()}
          </main>
        </>
      ) : (
        /* Regular Layout */
        <div className="flex flex-col w-full">
          {shouldShowHeaderFooter && (
            <Header 
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              isLoggedIn={isAuthenticated}
              setIsLoggedIn={handleLogout}
            />
          )}
          
          <main className="flex-1">
            {renderCurrentPage()}
          </main>
          
          {shouldShowHeaderFooter && <Footer />}
        </div>
      )}
      
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}