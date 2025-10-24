import { 
  LayoutDashboard, 
  Users, 
  Gavel, 
  BarChart3, 
  Bell, 
  Settings, 
  Menu,
  X,
  LogOut,
  Tag,
  Package
} from 'lucide-react';
import { Button } from '../../components/button';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminSidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  setIsLoggedIn?: (loggedIn: boolean) => void; // For backward compatibility
  onLogout?: () => void; // New logout callback
}

export function AdminSidebar({ currentPage, setCurrentPage, setIsLoggedIn, onLogout }: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const navigationItems = [
    { key: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'admin-users', label: 'Users', icon: Users },
    { key: 'admin-auctions', label: 'Auctions', icon: Gavel },
    { key: 'admin-transactions', label: 'Transactions', icon: Package },
    { key: 'admin-categories', label: 'Categories', icon: Tag },
    { key: 'admin-reports', label: 'Reports', icon: BarChart3 },
    { key: 'admin-notifications', label: 'Notifications', icon: Bell },
    { key: 'admin-settings', label: 'Settings', icon: Settings },
  ];

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else if (setIsLoggedIn) {
      setIsLoggedIn(false);
      setCurrentPage('home');
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-white border border-gray-200 shadow-sm"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-sm flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">AuctionHouse</span>
                <div className="text-xs text-gray-500">Admin Panel</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => handleNavigation(item.key)}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors
                    ${currentPage === item.key 
                      ? 'bg-gray-900 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">A</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">{user?.userName || 'Admin User'}</div>
                <div className="text-xs text-gray-500">{user?.email || 'admin@auctionhouse.com'}</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}