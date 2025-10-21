import { useState, useEffect } from 'react';
import { Grid, List } from 'lucide-react';
import { Button } from '../../components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/select';
import { AuctionCard } from './AuctionCard';
import AuctionFilters from '../../components/AuctionFilters';
import api from '../../services/api';

// Helper to convert relative image URLs to full URLs
const getImageUrl = (relativeUrl: string | undefined) => {
  if (!relativeUrl || relativeUrl.startsWith('http')) return relativeUrl;
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5021/api';
  const baseUrl = apiBase.replace(/\/api$/, '');
  return `${baseUrl}${relativeUrl}`;
};

interface AuctionListingPageProps {
  setCurrentPage: (page: string) => void;
  setSelectedAuction: (id: string) => void;
  isAdmin?: boolean;
  initialCategoryId?: number | null;
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

export function AuctionListingPage({ setCurrentPage, setSelectedAuction, initialCategoryId }: AuctionListingPageProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('ending-soon');
  const [currentFilters, setCurrentFilters] = useState<any>({});

  // Check for search query and initial category on mount
  useEffect(() => {
    const searchQuery = sessionStorage.getItem('searchQuery');
    const initialFilters: any = {};
    
    if (searchQuery) {
      initialFilters.search = searchQuery;
      sessionStorage.removeItem('searchQuery'); // Clear after using
    }
    
    if (initialCategoryId) {
      initialFilters.categoryId = initialCategoryId;
    }
    
    if (Object.keys(initialFilters).length > 0) {
      setCurrentFilters(initialFilters);
    }
  }, [initialCategoryId]);

  // Fetch auctions on mount and when filters change
  useEffect(() => {
    fetchAuctions(currentFilters);
  }, [currentFilters]);

  const fetchAuctions = async (filters: any) => {
    try {
      setLoading(true);
      const data = await api.getAuctions(filters);
      setAuctions(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch auctions:', err);
      setError('Failed to load auctions. Please try again.');
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: any) => {
    setCurrentFilters(filters);
  };

  const handleClearFilters = () => {
    setCurrentFilters({});
  };

  const formatTimeLeft = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatAuctionForCard = (auction: Auction) => {
    const timeLeft = formatTimeLeft(auction.endTime);
    const isEnding = timeLeft !== 'Ended' && !timeLeft.includes('d') && 
                     (timeLeft.includes('h') || timeLeft.includes('m'));

    return {
      id: auction.id.toString(),
      title: auction.title,
      currentBid: auction.currentPrice,
      timeLeft: timeLeft,
      imageUrl: auction.primaryImageUrl || '/img/placeholder-auction.jpg',
      views: 0, // Not tracked yet
      category: auction.categoryName,
      status: auction.status,
      isEnding: isEnding
    };
  };

  const mockAuctions = [
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
    },
    {
      id: '5',
      title: 'Vintage Gibson Les Paul Guitar',
      currentBid: 3200,
      timeLeft: '4d 12h 18m',
      imageUrl: 'https://images.unsplash.com/photo-1695528589305-5103f5c52306?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwd2F0Y2glMjBsdXh1cnklMjBhdWN0aW9ufGVufDF8fHx8MTc1NzUwMDE3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      views: 567,
      category: 'Music',
      isEnding: false
    },
    {
      id: '6',
      title: 'Art Deco Diamond Ring',
      currentBid: 4500,
      timeLeft: '18h 24m',
      imageUrl: 'https://images.unsplash.com/photo-1682248241811-c60fac657a2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbnRpcXVlJTIwZnVybml0dXJlJTIwY2hhaXJ8ZW58MXx8fHwxNzU3Mzk3NzEwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      views: 892,
      category: 'Jewelry',
      isEnding: true
    }
  ];

  const handleAuctionClick = (id: string) => {
    setSelectedAuction(id);
    setCurrentPage('auction-details');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Auctions</h1>
          <p className="text-gray-600">Discover unique items from trusted sellers</p>
        </div>

        {/* Phase 3: Search and Filter Component */}
        <AuctionFilters 
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* View Controls and Sort */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <span className="text-sm text-gray-600">
              Showing {auctions.length} auctions
            </span>

            <div className="flex items-center space-x-4">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ending-soon">Ending Soon</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="most-watched">Most Watched</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex border border-gray-200 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Full Width */}
        <div>
          <div className="w-full">
            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                <p className="mt-4 text-gray-600">Loading auctions...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* No Results */}
            {!loading && !error && auctions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No auctions found matching your filters.</p>
                <Button onClick={handleClearFilters} className="mt-4">Clear Filters</Button>
              </div>
            )}

            {/* Auction Grid */}
            {!loading && !error && auctions.length > 0 && (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {auctions.map((auction) => (
                      <AuctionCard
                        key={auction.id}
                        {...formatAuctionForCard(auction)}
                        onClick={() => handleAuctionClick(auction.id.toString())}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {auctions.map((auction) => {
                      const formatted = formatAuctionForCard(auction);
                      return (
                        <div
                          key={auction.id}
                          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleAuctionClick(auction.id.toString())}
                        >
                          <div className="flex items-center space-x-6">
                            <img
                              src={getImageUrl(formatted.imageUrl)}
                              alt={formatted.title}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{formatted.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{formatted.category}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-sm text-gray-600">Current Bid:</span>
                                <span className="font-semibold text-gray-900">${formatted.currentBid.toLocaleString()}</span>
                                <span className="text-sm text-gray-600">{formatted.timeLeft} left</span>
                              </div>
                            </div>
                            <Button 
                              className="bg-black text-white hover:bg-gray-800"
                              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                e.stopPropagation();
                                handleAuctionClick(auction.id.toString());
                              }}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center space-x-2 mt-12">
              <Button variant="outline" disabled>Previous</Button>
              <Button variant="default" className="bg-black text-white">1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <span className="text-gray-500">...</span>
              <Button variant="outline">12</Button>
              <Button variant="outline">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}