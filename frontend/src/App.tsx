import { useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/public/HomePage';
import { AuctionListingPage } from './pages/user/AuctionListingPage';
import { AuctionDetailsPage } from './pages/user/AuctionDetailsPage';
import { AuthForms } from './pages/public/AuthForms';
import { UserDashboard } from './pages/user/UserDashboard';
import { AdminSidebar } from './pages/admin/AdminSidebar';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { AuctionManagement } from './pages/admin/AuctionManagement';
import { Reports } from './pages/admin/Reports';
import { NotificationCenter } from './pages/admin/NotificationCenter';
import { AdminSettings } from './pages/admin/AdminSettings';
import { SupportTickets } from './pages/admin/SupportTickets';
import { Button } from './components/button';
import { Toaster } from './components/sonner';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState('1');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage 
            setCurrentPage={setCurrentPage} 
            setSelectedAuction={setSelectedAuction}
          />
        );
      case 'auctions':
        return (
          <AuctionListingPage 
            setCurrentPage={setCurrentPage}
            setSelectedAuction={setSelectedAuction}
          />
        );
      case 'auction-details':
        return (
          <AuctionDetailsPage 
            auctionId={selectedAuction}
            setCurrentPage={setCurrentPage}
          />
        );
      case 'login':
        return (
          <AuthForms 
            mode="login"
            setCurrentPage={setCurrentPage}
            setIsLoggedIn={setIsLoggedIn}
          />
        );
      case 'register':
        return (
          <AuthForms 
            mode="register"
            setCurrentPage={setCurrentPage}
            setIsLoggedIn={setIsLoggedIn}
          />
        );
      case 'reset-password':
        return (
          <AuthForms 
            mode="reset-password"
            setCurrentPage={setCurrentPage}
            setIsLoggedIn={setIsLoggedIn}
          />
        );
      case 'dashboard':
        return isLoggedIn ? (
          <UserDashboard 
            setCurrentPage={setCurrentPage}
            setSelectedAuction={setSelectedAuction}
          />
        ) : (
          <AuthForms 
            mode="login"
            setCurrentPage={setCurrentPage}
            setIsLoggedIn={setIsLoggedIn}
          />
        );
      case 'categories':
        return (
          <AuctionListingPage 
            setCurrentPage={setCurrentPage}
            setSelectedAuction={setSelectedAuction}
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
              <div className="mt-8">
                <Button 
                  onClick={() => { setIsAdmin(true); setIsLoggedIn(true); setCurrentPage('admin-dashboard'); }}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Admin Access (Demo)
                </Button>
              </div>
            </div>
          </div>
        );
      // Admin Pages
      case 'admin-dashboard':
        return <AdminDashboard setCurrentPage={setCurrentPage} />;
      case 'admin-users':
        return <UserManagement />;
      case 'admin-auctions':
        return <AuctionManagement />;
      case 'admin-reports':
        return <Reports />;
      case 'admin-notifications':
        return <NotificationCenter />;
      case 'admin-settings':
        return <AdminSettings />;
      case 'admin-support':
        return <SupportTickets />;
      default:
        return (
          <HomePage 
            setCurrentPage={setCurrentPage} 
            setSelectedAuction={setSelectedAuction}
          />
        );
    }
  };

  const shouldShowHeaderFooter = !['login', 'register', 'reset-password'].includes(currentPage) && !currentPage.startsWith('admin-');
  const isAdminPage = currentPage.startsWith('admin-');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white flex">
        {/* Admin Layout */}
        {isAdminPage ? (
          <>
            <AdminSidebar 
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              setIsLoggedIn={setIsLoggedIn}
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
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
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
    </AuthProvider>
  );
}