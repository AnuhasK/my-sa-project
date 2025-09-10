import { Search, Gavel, Shield, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AuctionCard } from './AuctionCard';

interface HomePageProps {
  setCurrentPage: (page: string) => void;
  setSelectedAuction: (id: string) => void;
}

export function HomePage({ setCurrentPage, setSelectedAuction }: HomePageProps) {
  const featuredAuctions = [
    {
      id: '1',
      title: 'Vintage Omega Speedmaster Professional',
      currentBid: 2850,
      timeLeft: '2d 14h 32m',
      imageUrl: 'https://images.unsplash.com/photo-1695528589305-5103f5c52306?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwd2F0Y2glMjBsdXh1cnklMjBhdWN0aW9ufGVufDF8fHx8MTc1NzUwMDE3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      views: 342,
      category: 'Watches',
      isEnding: false
    },
    {
      id: '2',
      title: 'Mid-Century Modern Lounge Chair',
      currentBid: 1250,
      timeLeft: '5h 42m',
      imageUrl: 'https://images.unsplash.com/photo-1682248241811-c60fac657a2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbnRpcXVlJTIwZnVybml0dXJlJTIwY2hhaXJ8ZW58MXx8fHwxNzU3Mzk3NzEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      views: 189,
      category: 'Furniture',
      isEnding: true
    },
    {
      id: '3',
      title: 'Leica M3 35mm Film Camera',
      currentBid: 890,
      timeLeft: '1d 8h 15m',
      imageUrl: 'https://images.unsplash.com/photo-1626256226202-7989ae22548e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2FtZXJhJTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzU3NTAwMTgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      views: 256,
      category: 'Electronics',
      isEnding: false
    },
    {
      id: '4',
      title: 'Original Oil Painting - Abstract Landscape',
      currentBid: 1680,
      timeLeft: '3d 2h 8m',
      imageUrl: 'https://images.unsplash.com/photo-1552832036-5ce6f9568f9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBwYWludGluZyUyMGZyYW1lfGVufDF8fHx8MTc1NzUwMDE4NHww&ixlib=rb-4.1.0&q=80&w=1080',
      views: 423,
      category: 'Art',
      isEnding: false
    }
  ];

  const categories = [
    { name: 'Art & Collectibles', count: 1247 },
    { name: 'Jewelry & Watches', count: 892 },
    { name: 'Antiques', count: 634 },
    { name: 'Electronics', count: 456 },
    { name: 'Furniture', count: 328 },
    { name: 'Books & Manuscripts', count: 234 }
  ];

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
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for watches, art, furniture..."
                className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-gray-400 rounded-xl"
              />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white hover:bg-gray-800 px-6"
              >
                Search
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              size="lg" 
              className="bg-black text-white hover:bg-gray-800 px-8 py-3"
              onClick={() => setCurrentPage('auctions')}
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
              onClick={() => setCurrentPage('auctions')}
              className="flex items-center space-x-2 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAuctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                {...auction}
                onClick={() => handleAuctionClick(auction.id)}
              />
            ))}
          </div>
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
            {categories.map((category) => (
              <button
                key={category.name}
                className="p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center group"
                onClick={() => setCurrentPage('auctions')}
              >
                <h3 className="font-medium text-gray-900 mb-2 group-hover:text-black">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600">{category.count} items</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">50K+</div>
              <div className="text-gray-400">Active Bidders</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">12K+</div>
              <div className="text-gray-400">Items Sold</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">$2.4M+</div>
              <div className="text-gray-400">Total Sales</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">98%</div>
              <div className="text-gray-400">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}