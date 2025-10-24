import { Search, Gavel, Shield, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { AuctionCard } from '../user/AuctionCard';
import { useEffect, useState } from 'react';
import api from '../../services/api';

interface HomePageProps {
  setCurrentPage: (page: string) => void;
  setSelectedAuction: (id: string) => void;
  setSelectedCategory: (id: number | null) => void;
}

interface Auction {
  id: number;
  title: string;
  description: string;
  currentPrice: number;
  startTime: string;
  endTime: string;
  status: string;
  categoryName: string;
  categoryId: number;
  primaryImageUrl?: string;
  bidCount: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
  count?: number;
}

export function HomePage({ setCurrentPage, setSelectedAuction, setSelectedCategory }: HomePageProps) {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching data from:', import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
        
        // Fetch auctions and categories in parallel
        const [auctionData, categoryData] = await Promise.all([
          api.getAuctions({ status: 'Open', sortBy: 'ending-soon', limit: 6 }), // Get 6 open auctions ending soon
          api.getCategories()
        ]);
        
        console.log('Received auction data:', auctionData);
        console.log('Received category data:', categoryData);
        
        setAuctions(auctionData);
        setCategories(categoryData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data. Please try again later.');
        // Set fallback data if API fails
        setAuctions([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTimeLeft = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatAuctionForCard = (auction: Auction) => {
    const timeLeft = formatTimeLeft(auction.endTime);
    const isEnding = timeLeft !== 'Ended' && (
      timeLeft.includes('h') && !timeLeft.includes('d') && 
      parseInt(timeLeft.split('h')[0]) < 6
    );

    // Use the category from backend API
    let category = auction.categoryName || 'Uncategorized';
    let imageUrl = auction.primaryImageUrl || '/img/placeholder-auction.jpg';
    
    // If no backend image, use smart category detection based on the backend category or title
    if (!auction.primaryImageUrl) {
      const title = auction.title.toLowerCase();
      const categoryName = auction.categoryName?.toLowerCase() || '';
      
      if (categoryName.includes('musical') || title.includes('guitar') || title.includes('music')) {
        imageUrl = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop';
      } else if (categoryName.includes('electronics') || title.includes('macbook') || title.includes('computer') || title.includes('tech')) {
        imageUrl = 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop';
      } else if (categoryName.includes('fashion') || categoryName.includes('accessories') || title.includes('rolex') || title.includes('watch')) {
        imageUrl = 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400&h=300&fit=crop';
      } else if (categoryName.includes('home') || categoryName.includes('garden') || title.includes('rug') || title.includes('carpet')) {
        imageUrl = 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop';
      } else if (categoryName.includes('gaming') || title.includes('playstation') || title.includes('gaming')) {
        imageUrl = 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&h=300&fit=crop';
      } else if (categoryName.includes('photography') || title.includes('camera') || title.includes('photography')) {
        imageUrl = 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop';
      }
    }

    return {
      id: auction.id.toString(),
      title: auction.title,
      currentBid: auction.currentPrice,
      timeLeft,
      imageUrl,
      views: Math.floor(Math.random() * 500) + 50, // Placeholder until we add view tracking
      category,
      status: auction.status,
      isEnding
    };
  };

  // Categories will be fetched from API

  const handleAuctionClick = (id: string) => {
    setSelectedAuction(id);
    setCurrentPage('auction-details');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Discover Unique
            <br />
            <span className="text-gray-600">Auction Items</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Find exceptional pieces from trusted sellers worldwide. Bid with confidence on authenticated items.
          </p>
          {/* Search Bar */}
          <form
            className="max-w-2xl mx-auto mb-8"
            onSubmit={e => {
              e.preventDefault();
              if (searchQuery.trim()) {
                setSelectedCategory(null);
                setCurrentPage('auctions');
                sessionStorage.setItem('searchQuery', searchQuery.trim());
                setSearchQuery("");
              }
            }}
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for watches, art, furniture..."
                className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-gray-400 rounded-xl"
              />
              <Button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white hover:bg-gray-800 px-6"
              >
                Search
              </Button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              size="lg" 
              className="bg-black text-white hover:bg-gray-800 px-8 py-3"
              onClick={() => {
                setSelectedCategory(null);
                setCurrentPage('auctions');
              }}
            >
              Browse Auctions
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3"
            >
              How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Bidding</h3>
              <p className="text-gray-600">All transactions are protected with bank-level security and buyer protection.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gavel className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Authentication</h3>
              <p className="text-gray-600">Every item is verified by our team of specialists before listing.</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Auctions</h3>
              <p className="text-gray-600">Participate in real-time bidding with instant updates and notifications.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Auctions</h2>
              <p className="text-gray-600">Handpicked items ending soon</p>
            </div>
            <Button 
              variant="outline"
              onClick={() => {
                setSelectedCategory(null);
                setCurrentPage('auctions');
              }}
              className="flex items-center space-x-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Retry
              </Button>
            </div>
          ) : auctions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No auctions available at the moment.</p>
              <Button 
                onClick={() => setCurrentPage('auctions')}
                variant="outline"
              >
                Check Back Later
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {auctions.slice(0, 4).map((auction) => {
                const cardData = formatAuctionForCard(auction);
                return (
                  <AuctionCard
                    key={auction.id}
                    {...cardData}
                    onClick={() => handleAuctionClick(cardData.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our curated collections across different categories
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.slice(0, 6).map((category) => {
              // Count auctions in this category
              const auctionCount = auctions.filter(auction => auction.categoryId === category.id).length;
              
              return (
                <button
                  key={category.id}
                  className="p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center group"
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setCurrentPage('auctions');
                  }}
                >
                  <h3 className="font-medium text-gray-900 mb-2 group-hover:text-black">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600">{auctionCount} items</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}