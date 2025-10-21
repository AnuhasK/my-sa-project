import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Heart, Share2, Eye, Gavel, Shield, TrendingUp, Link2, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Badge } from '../../components/badge';
import { Avatar, AvatarFallback } from '../../components/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card';
import { CountdownTimer } from './CountdownTimer';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import * as signalR from '@microsoft/signalr';

// Helper to convert relative image URLs to full URLs
const getImageUrl = (relativeUrl: string | undefined) => {
  if (!relativeUrl || relativeUrl.startsWith('http')) return relativeUrl;
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5021/api';
  const baseUrl = apiBase.replace(/\/api$/, '');
  return `${baseUrl}${relativeUrl}`;
};

interface AuctionDetailsPageProps {
  auctionId: string;
  setCurrentPage: (page: string) => void;
  isAdmin?: boolean;
}

export function AuctionDetailsPage({ auctionId, setCurrentPage, isAdmin = false }: AuctionDetailsPageProps) {
  const { user, token } = useAuth();
  const [bidAmount, setBidAmount] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidHistory, setBidHistory] = useState<any[]>([]);
  const [watchersCount, setWatchersCount] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showShareMenu && !target.closest('.share-menu-container')) {
        setShowShareMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  // Check if auction is in watchlist on mount
  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (token) {
        try {
          console.log(`🔍 Checking watchlist status for auction ${auctionId}`);
          const watched = await api.checkWatchlist(auctionId, token);
          console.log(`Watchlist status for auction ${auctionId}:`, watched);
          setIsWatching(watched);
        } catch (error) {
          console.error('Error checking watchlist status:', error);
          setIsWatching(false); // Default to not watched on error
        }
      }
    };
    
    const fetchWatchersCount = async () => {
      try {
        const count = await api.getWatchersCount(auctionId);
        console.log(`Watchers count for auction ${auctionId}:`, count);
        setWatchersCount(count);
      } catch (error) {
        console.error('Error fetching watchers count:', error);
      }
    };
    
    checkWatchlistStatus();
    fetchWatchersCount();
  }, [auctionId, token]);

  // Handle watchlist toggle
  const handleWatchlistToggle = async () => {
    try {
      const currentToken = localStorage.getItem('token');
      console.log('Watchlist toggle clicked on details page');
      console.log('Current state - isWatching:', isWatching);
      console.log('Token exists:', !!currentToken);
      
      if (!currentToken) {
        alert('Please login to add items to your watchlist');
        return;
      }

      if (isWatching) {
        console.log(`Attempting to remove auction ${auctionId} from watchlist`);
        try {
          await api.removeFromWatchlist(auctionId, currentToken);
          setIsWatching(false);
          setWatchersCount(prev => Math.max(0, prev - 1));
          console.log('Removed from watchlist');
        } catch (removeError: any) {
          console.error('Remove failed:', removeError);
          // If it's a 404, it means it wasn't in the watchlist to begin with
          if (removeError.message?.includes('404') || removeError.message?.includes('not found')) {
            console.log('Item was not in watchlist, syncing state');
            setIsWatching(false); // Sync the state
          } else {
            throw removeError; // Re-throw other errors
          }
        }
      } else {
        console.log(`Attempting to add auction ${auctionId} to watchlist`);
        await api.addToWatchlist(auctionId, currentToken);
        setIsWatching(true);
        setWatchersCount(prev => prev + 1);
        console.log('Added to watchlist');
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      alert('Failed to update watchlist. Please try again.');
    }
  };

  // Share functionality
  const getShareUrl = () => {
    return `${window.location.origin}/#auction-details-${auctionId}`;
  };

  const handleShareFacebook = () => {
    const url = getShareUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    setShowShareMenu(false);
  };

  const handleShareWhatsApp = () => {
    const url = getShareUrl();
    const text = `Check out this auction: ${auction?.title}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    setShowShareMenu(false);
  };

  const handleShareTwitter = () => {
    const url = getShareUrl();
    const text = `Check out this auction: ${auction?.title}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    setShowShareMenu(false);
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy link');
    }
    setShowShareMenu(false);
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
          images: auctionData.imageUrls && auctionData.imageUrls.length > 0 ? auctionData.imageUrls : ['/img/placeholder-auction.jpg'],
          category: auctionData.categoryName || 'Uncategorized',
          status: auctionData.status || 'Open',
          condition: auctionData.condition || 'Good',
          views: auctionData.views || 0,
          watchers: auctionData.watchers || 0,
          bids: auctionData.bidCount || 0,
          description: auctionData.description || 'No description available.'
        };
        
        setAuction(transformedAuction);
        
        // Also fetch bid history if available
        try {
          const bidsData = await api.getBidsForAuction(auctionId);
          console.log('Raw bids data from API:', bidsData);
          
          const transformedBids = bidsData.map((bid: any) => {
            console.log('Transforming bid:', bid);
            // Handle both camelCase (System.Text.Json default) and PascalCase
            return {
              bidder: bid.bidderName || bid.BidderName || 'Anonymous',
              amount: bid.amount || bid.Amount || 0,
              time: formatTimeAgo(bid.timestamp || bid.Timestamp)
            };
          });
          
          console.log('Transformed bids:', transformedBids);
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

  // SignalR real-time updates
  useEffect(() => {
    if (!auctionId) return;

    // Create SignalR connection
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5021/hubs/auction')
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    // Start connection and join auction group
    connection.start()
      .then(() => {
        console.log('SignalR connected');
        return connection.invoke('JoinAuction', auctionId);
      })
      .then(() => {
        console.log(`Joined auction group: ${auctionId}`);
      })
      .catch(err => console.error('SignalR connection error:', err));

    // Listen for bid placed events
    connection.on('BidPlaced', (data: any) => {
      console.log('Real-time bid received:', data);
      
      // Handle both camelCase and PascalCase from SignalR
      const bidAmount = data.amount || data.Amount;
      console.log('Extracted bid amount:', bidAmount);
      
      if (!bidAmount) {
        console.error('No valid amount in SignalR data:', data);
        return;
      }
      
      // Update auction current price and bid count
      setAuction((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentBid: bidAmount,
          minBid: bidAmount + 50,
          bids: prev.bids + 1
        };
      });

      // Refresh bid history
      api.getBidsForAuction(auctionId)
        .then(bidsData => {
          const transformedBids = bidsData.map((bid: any) => ({
            bidder: bid.bidderName || bid.BidderName || 'Anonymous',
            amount: bid.amount || bid.Amount || 0,
            time: formatTimeAgo(bid.timestamp || bid.Timestamp)
          }));
          setBidHistory(transformedBids);
        })
        .catch(err => console.error('Error refreshing bid history:', err));
    });

    // Cleanup on unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current.invoke('LeaveAuction', auctionId)
          .catch(err => console.error('Error leaving auction:', err));
        connectionRef.current.stop()
          .catch(err => console.error('Error stopping SignalR:', err));
      }
    };
  }, [auctionId]);

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    try {
      if (!dateString) return 'Just now';
      
      // Ensure the date string is treated as UTC if it doesn't have timezone info
      let normalizedDateString = dateString;
      if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('T')) {
        // If it's just a date without timezone, assume UTC
        normalizedDateString = dateString + 'Z';
      } else if (dateString.includes('T') && !dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
        // If it has T but no timezone indicator, add Z
        normalizedDateString = dateString + 'Z';
      }
      
      const date = new Date(normalizedDateString);
      if (isNaN(date.getTime())) return 'Just now';
      
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      return 'Just now';
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Just now';
    }
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
        category: auctionData.categoryName || 'Uncategorized',
        status: auctionData.status || 'Open',
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
          bidder: bid.bidderName || bid.BidderName || 'Anonymous',
          amount: bid.amount || bid.Amount || 0,
          time: formatTimeAgo(bid.timestamp || bid.Timestamp)
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
                  src={getImageUrl(auction.images[selectedImage])}
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
                  
                  {/* Share Button with Dropdown */}
                  <div className="relative share-menu-container">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="bg-white/90"
                      onClick={() => setShowShareMenu(!showShareMenu)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    
                    {showShareMenu && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <button
                          onClick={handleShareFacebook}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-sm"
                        >
                          <Facebook className="w-4 h-4 text-blue-600" />
                          <span>Share on Facebook</span>
                        </button>
                        <button
                          onClick={handleShareWhatsApp}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-sm"
                        >
                          <MessageCircle className="w-4 h-4 text-green-600" />
                          <span>Share on WhatsApp</span>
                        </button>
                        <button
                          onClick={handleShareTwitter}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-sm"
                        >
                          <Twitter className="w-4 h-4 text-blue-400" />
                          <span>Share on Twitter</span>
                        </button>
                        <hr className="my-2" />
                        <button
                          onClick={handleCopyLink}
                          className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-2 text-sm"
                        >
                          <Link2 className="w-4 h-4 text-gray-600" />
                          <span>Copy Link</span>
                        </button>
                      </div>
                    )}
                  </div>
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
                      src={getImageUrl(image)}
                      alt={`View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Item Description */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none">
                    <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                      {auction.description}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Bidding */}
          <div className="space-y-6">
            {/* Auction Info Card */}
            <Card>
              <CardHeader>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="w-fit">
                      {auction.category}
                    </Badge>
                    {auction.status && (
                      <Badge 
                        className={`w-fit ${
                          auction.status === 'Open' ? 'bg-green-100 text-green-800' :
                          auction.status === 'Closed' ? 'bg-gray-100 text-gray-800' :
                          auction.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {auction.status}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl leading-tight">{auction.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{auction.views} views</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleWatchlistToggle}
                      className={`flex items-center space-x-1 p-2 rounded-full transition-all duration-200 z-10 ${
                        isWatching ? 'bg-red-500 text-white' : 'bg-black/60 text-white hover:bg-black/80'
                      }`}
                      title={isWatching ? 'Remove from watchlist' : 'Add to watchlist'}
                    >
                      <Heart className={`w-4 h-4 ${isWatching ? 'fill-current' : ''}`} />
                      <span>{watchersCount} watching</span>
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Bid */}
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Current Bid</div>
                  <div className="text-3xl font-bold text-gray-900">
                    ${auction.currentBid ? auction.currentBid.toLocaleString() : '0'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {auction.bids || 0} bids
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
                    <span className="font-medium">${auction.minBid ? auction.minBid.toLocaleString() : '0'}</span>
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
                      Buy Now - ${auction.buyNowPrice ? auction.buyNowPrice.toLocaleString() : '0'}
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
                  {bidHistory.length > 0 ? bidHistory.map((bid, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gray-200 text-xs">
                            {bid.bidder?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{bid.bidder || 'Anonymous'}</div>
                          <div className="text-xs text-gray-500">{bid.time || 'Just now'}</div>
                        </div>
                      </div>
                      <div className="font-semibold text-gray-900">
                        ${bid.amount ? bid.amount.toLocaleString() : '0'}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-gray-500">
                      No bids yet. Be the first to bid!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}