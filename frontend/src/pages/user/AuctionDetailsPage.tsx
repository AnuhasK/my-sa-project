import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Share2, Eye, User, MapPin, Clock, Gavel, Shield, TrendingUp } from 'lucide-react';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Badge } from '../../components/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card';
import { CountdownTimer } from './CountdownTimer';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface AuctionDetailsPageProps {
  auctionId: string;
  setCurrentPage: (page: string) => void;
  isAdmin?: boolean;
}

export function AuctionDetailsPage({ auctionId, setCurrentPage, isAdmin = false }: AuctionDetailsPageProps) {
  const { user, token } = useAuth(); // Add auth context
  const [bidAmount, setBidAmount] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidHistory, setBidHistory] = useState<any[]>([]);
  const [watchersCount, setWatchersCount] = useState(0);

  // Check if auction is in watchlist when component loads
  useEffect(() => {
    const checkWatchlistStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token && auctionId) {
          const response = await api.checkWatchlist(auctionId, token);
          setIsWatching(response.isInWatchlist);
        }
      } catch (error) {
        console.error('Error checking watchlist status:', error);
      }
    };

    const fetchWatchersCount = async () => {
      try {
        if (auctionId) {
          const response = await api.getWatchersCount(auctionId);
          setWatchersCount(response.watchersCount);
        }
      } catch (error) {
        console.error('Error fetching watchers count:', error);
      }
    };

    checkWatchlistStatus();
    fetchWatchersCount();
  }, [auctionId]);

  // Handle watchlist toggle
  const handleWatchlistToggle = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        alert('Please login to add items to your watchlist');
        return;
      }

      if (isWatching) {
        await api.removeFromWatchlist(auctionId, token);
        setIsWatching(false);
        setWatchersCount(prev => Math.max(0, prev - 1));
      } else {
        await api.addToWatchlist(auctionId, token);
        setIsWatching(true);
        setWatchersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      alert('Failed to update watchlist. Please try again.');
    }
  };

  // Fetch auction details from backend
  useEffect(() => {
    const fetchAuctionDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const auctionData = await api.getAuction(auctionId);
        console.log('Fetched auction details:', auctionData);
        
        // Transform backend data to match frontend expectations
        const transformedAuction = {
          id: auctionData.id,
          title: auctionData.title,
          currentBid: auctionData.currentPrice || auctionData.startPrice || 0,
          minBid: auctionData.currentPrice ? auctionData.currentPrice + 50 : auctionData.startPrice + 50,
          buyNowPrice: null, // Not in backend DTO currently
          timeLeft: new Date(auctionData.endTime),
          images: auctionData.imageUrls && auctionData.imageUrls.length > 0 ? auctionData.imageUrls : [
            'https://images.unsplash.com/photo-1695528589305-5103f5c52306?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwd2F0Y2glMjBsdXh1cnklMjBhdWN0aW9ufGVufDF8fHx8MTc1NzUwMDE3Nnww&ixlib=rb-4.1.0&q=80&w=1080'
          ],
          category: auctionData.category || 'General',
          condition: auctionData.condition || 'Good',
          views: auctionData.views || 0,
          watchers: auctionData.watchers || 0,
          bids: auctionData.bidCount || 0,
          description: auctionData.description || 'No description available.',
          seller: {
            name: auctionData.seller?.username || auctionData.sellerName || 'Anonymous',
            rating: 4.8,
            reviews: 120,
            memberSince: '2020',
            location: 'Location not specified',
            avatar: null
          },
          shipping: {
            cost: 25,
            methods: ['Standard Shipping', 'Express Shipping']
          }
        };
        
        setAuction(transformedAuction);
        
        // Also fetch bid history if available
        try {
          const bidsData = await api.getBidsForAuction(auctionId);
          const transformedBids = bidsData.map((bid: any, index: number) => ({
            bidder: `${bid.bidder?.username?.substring(0, 1)}***${bid.bidder?.username?.slice(-1)}` || `u***r`,
            amount: bid.amount,
            time: formatTimeAgo(bid.createdAt)
          }));
          setBidHistory(transformedBids);
        } catch (bidError) {
          console.log('Could not fetch bid history:', bidError);
          setBidHistory([]);
        }
        
      } catch (err) {
        console.error('Error fetching auction details:', err);
        setError('Failed to load auction details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (auctionId) {
      fetchAuctionDetails();
    }
  }, [auctionId]);

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const handlePlaceBid = async () => {
    const bid = parseFloat(bidAmount);
    
    if (!bid || bid < auction.minBid) {
      alert(`Bid must be at least $${auction.minBid}`);
      return;
    }

    if (!token || !user) {
      alert('Please login to place a bid');
      setCurrentPage('login');
      return;
    }

    try {
      // Place bid via API
      await api.placeBid(auctionId, bid, token);
      
      // Clear bid input
      setBidAmount('');
      
      // Refresh auction details to show updated price and bid count
      const auctionData = await api.getAuction(auctionId);
      const transformedAuction = {
        id: auctionData.id,
        title: auctionData.title,
        currentBid: auctionData.currentPrice || auctionData.startPrice || 0,
        minBid: auctionData.currentPrice ? auctionData.currentPrice + 50 : auctionData.startPrice + 50,
        buyNowPrice: null,
        timeLeft: new Date(auctionData.endTime),
        images: auctionData.imageUrls && auctionData.imageUrls.length > 0 ? auctionData.imageUrls : auction.images,
        category: auctionData.category || 'General',
        condition: auctionData.condition || 'Good',
        views: auctionData.views || 0,
        watchers: auctionData.watchers || 0,
        bids: auctionData.bidCount || 0,
        description: auctionData.description || 'No description available.',
        seller: auction.seller,
        shipping: auction.shipping
      };
      setAuction(transformedAuction);
      
      // Refresh bid history
      try {
        const bidsData = await api.getBidsForAuction(auctionId);
        const transformedBids = bidsData.map((bid: any) => ({
          bidder: bid.bidderName,
          amount: bid.amount,
          time: formatTimeAgo(bid.timestamp)
        }));
        setBidHistory(transformedBids);
      } catch (bidError) {
        console.log('Could not fetch bid history:', bidError);
      }
      
      alert('Bid placed successfully!');
    } catch (error: any) {
      console.error('Error placing bid:', error);
      const errorMessage = error.message || 'Failed to place bid. Please try again.';
      alert(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading auction details...</div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || 'Auction not found'}</div>
          <Button onClick={() => setCurrentPage('auctions')}>
            Back to Auctions
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setCurrentPage('auctions')}
          className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Auctions</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative">
                <img
                  src={auction.images[selectedImage]}
                  alt={auction.title}
                  className="w-full h-96 md:h-[500px] object-cover rounded-lg border border-gray-200"
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleWatchlistToggle}
                    className={`${isWatching ? 'bg-red-100 text-red-700' : 'bg-white/90'}`}
                    title={isWatching ? 'Remove from watchlist' : 'Add to watchlist'}
                  >
                    <Heart className={`w-4 h-4 ${isWatching ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="secondary" size="sm" className="bg-white/90">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Thumbnail Images */}
              <div className="flex space-x-2">
                {auction.images.map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg border-2 overflow-hidden ${
                      selectedImage === index ? 'border-black' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Item Details Tabs */}
              <Card className="mt-8">
                <Tabs defaultValue="description" className="w-full">
                  <CardHeader>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="description">Description</TabsTrigger>
                      <TabsTrigger value="shipping">Shipping</TabsTrigger>
                      <TabsTrigger value="seller">Seller Info</TabsTrigger>
                    </TabsList>
                  </CardHeader>
                  <CardContent>
                    <TabsContent value="description" className="space-y-4">
                      <div className="prose prose-gray max-w-none">
                        <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                          {auction.description}
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="shipping" className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping Cost:</span>
                          <span className="font-medium">${auction.shipping.cost}</span>
                        </div>
                        <div>
                          <span className="text-gray-600 block mb-2">Available Methods:</span>
                          <ul className="space-y-1">
                            {auction.shipping.methods.map((method: string, index: number) => (
                              <li key={index} className="text-sm text-gray-700">• {method}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="seller" className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={auction.seller.avatar} />
                          <AvatarFallback className="bg-gray-200">
                            {auction.seller.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{auction.seller.name}</h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>⭐ {auction.seller.rating}</span>
                            <span>•</span>
                            <span>{auction.seller.reviews} reviews</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{auction.seller.location}</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </CardContent>
                </Tabs>
              </Card>
            </div>
          </div>

          {/* Right Column - Bidding */}
          <div className="space-y-6">
            {/* Auction Info Card */}
            <Card>
              <CardHeader>
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-fit">
                    {auction.category}
                  </Badge>
                  <CardTitle className="text-xl leading-tight">{auction.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{auction.views} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{watchersCount} watching</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Bid */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Current Bid</div>
                  <div className="text-3xl font-bold text-gray-900">
                    ${auction.currentBid.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {auction.bids} bids
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600 mb-3">Time Remaining</div>
                  <CountdownTimer endTime={auction.timeLeft} />
                </div>

                {/* Bidding Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Minimum bid:</span>
                    <span className="font-medium">${auction.minBid.toLocaleString()}</span>
                  </div>
                  
                  {!isAdmin && (
                    <div className="space-y-3">
                      <Input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Enter $${auction.minBid} or more`}
                        className="text-center text-lg font-medium"
                      />
                      <Button 
                        onClick={handlePlaceBid}
                        className="w-full bg-black text-white hover:bg-gray-800 py-3"
                        disabled={!bidAmount || parseFloat(bidAmount) < auction.minBid}
                      >
                        <Gavel className="w-4 h-4 mr-2" />
                        Place Bid
                      </Button>
                    </div>
                  )}

                  {isAdmin && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800 text-center">
                        <strong>Admin View:</strong> Bidding is disabled for admin accounts
                      </p>
                    </div>
                  )}

                  {!isAdmin && auction.buyNowPrice && (
                    <Button 
                      variant="outline"
                      className="w-full border-gray-300 py-3"
                    >
                      Buy Now - ${auction.buyNowPrice.toLocaleString()}
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 pt-4 border-t">
                  <Shield className="w-4 h-4" />
                  <span>Secure bidding with buyer protection</span>
                </div>
              </CardContent>
            </Card>

            {/* Bid History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Bid History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bidHistory.map((bid, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gray-200 text-xs">
                            {bid.bidder.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{bid.bidder}</div>
                          <div className="text-xs text-gray-500">{bid.time}</div>
                        </div>
                      </div>
                      <div className="font-semibold text-gray-900">
                        ${bid.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Seller Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seller</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback className="bg-gray-200">
                      {auction.seller.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{auction.seller.name}</div>
                    <div className="text-sm text-gray-600">
                      ⭐ {auction.seller.rating} • {auction.seller.reviews} reviews
                    </div>
                    <div className="text-xs text-gray-500">
                      Member since {auction.seller.memberSince}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}