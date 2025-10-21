import { Search, User, Menu, X, Heart } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { useState, useEffect } from 'react';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface HeaderProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
}

export function Header({ currentPage, setCurrentPage, isLoggedIn, setIsLoggedIn }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = useAuth();

  // Fetch watchlist count when user is logged in
  useEffect(() => {
    const fetchWatchlistCount = async () => {
      if (isLoggedIn && token) {
        try {
          const watchlist = await api.getWatchlist(token);
          setWatchlistCount(watchlist.length);
        } catch (error) {
          console.error('Error fetching watchlist count:', error);
        }
      } else {
        setWatchlistCount(0);
      }
    };

    fetchWatchlistCount();
    
    // Refresh count every 30 seconds if logged in
    const interval = isLoggedIn ? setInterval(fetchWatchlistCount, 30000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoggedIn, token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to auctions page with search query
      setCurrentPage('auctions');
      // Store search query in sessionStorage so AuctionListingPage can use it
      sessionStorage.setItem('searchQuery', searchQuery.trim());
      setSearchQuery('');
    }
  };

  const navigationItems = [
    { label: 'Home', key: 'home' },
    { label: 'Auctions', key: 'auctions' },
    { label: 'About', key: 'about' },
  ];

  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setCurrentPage('home')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/img/logo.png" 
                alt="Auction House Logo" 
                className="h-12 w-auto"
              />
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setCurrentPage(item.key)}
                className={`px-3 py-2 text-sm transition-colors hover:text-gray-600 ${
                  currentPage === item.key
                    ? 'text-black border-b-2 border-black'
                    : 'text-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden sm:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full bg-gray-50 border-gray-200 focus:border-gray-400 focus:ring-0"
              />
            </form>
          </div>

          {/* Notification Bell */}
          {isLoggedIn && token && (
            <div className="hidden sm:flex items-center mr-4">
              <NotificationBell token={token} isLoggedIn={isLoggedIn} />
            </div>
          )}

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage('watchlist')}
                  className="hidden sm:flex items-center space-x-2 text-gray-700 hover:text-black relative"
                >
                  <Heart className="w-4 h-4" />
                  <span>Watchlist</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage('dashboard')}
                  className="hidden sm:flex items-center space-x-2 text-gray-700 hover:text-black"
                >
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage('profile')}
                  className="hidden sm:flex items-center space-x-2 text-gray-700 hover:text-black"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsLoggedIn(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage('login')}
                  className="text-gray-700 hover:text-black"
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => setCurrentPage('register')}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  Sign Up
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Search */}
              <div className="px-3 py-2">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search auctions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full bg-gray-50 border-gray-200"
                  />
                </form>
              </div>
              
              {navigationItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setCurrentPage(item.key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`block px-3 py-2 text-base w-full text-left transition-colors hover:bg-gray-50 ${
                    currentPage === item.key ? 'text-black font-medium' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {isLoggedIn && (
                <>
                  <button
                    onClick={() => {
                      setCurrentPage('watchlist');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 text-base w-full text-left text-gray-700 hover:bg-gray-50"
                  >
                    <span className="flex items-center space-x-2">
                      <Heart className="w-4 h-4" />
                      <span>Watchlist</span>
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage('dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block px-3 py-2 text-base w-full text-left text-gray-700 hover:bg-gray-50"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setCurrentPage('profile');
                      setIsMobileMenuOpen(false);
                    }}
                    className="block px-3 py-2 text-base w-full text-left text-gray-700 hover:bg-gray-50"
                  >
                    Profile
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}