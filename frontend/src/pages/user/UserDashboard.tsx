import { useState, useEffect } from 'react';
import { User, Heart, Gavel, Bell, Settings, Eye, Clock, DollarSign, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '../../components/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/tabs';
import { Badge } from '../../components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/avatar';
import { AuctionCard } from './AuctionCard';
import { api } from '../../services/api';

interface UserDashboardProps {
  setCurrentPage: (page: string) => void;
  setSelectedAuction: (id: string) => void;
}

export function UserDashboard({ setCurrentPage, setSelectedAuction }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [watchedAuctions, setWatchedAuctions] = useState<any[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);

  // Fetch watchlist when component mounts or when tab changes to watching
  useEffect(() => {
    if (activeTab === 'watching' || activeTab === 'overview') {
      fetchWatchlist();
    }
  }, [activeTab]);

  const fetchWatchlist = async () => {
    try {
      setLoadingWatchlist(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found');
        return;
      }

      const watchlistData = await api.getWatchlist(token);
      console.log('Fetched watchlist:', watchlistData);

      // Transform backend data to match frontend expectations
      const transformedData = watchlistData.map((item: any) => ({
        id: item.auctionId.toString(),
        title: item.title,
        currentBid: item.currentBid,
        timeLeft: formatTimeLeft(new Date(item.endDate)),
        imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1695528589305-5103f5c52306?w=400',
        views: 0, // Not available in backend DTO currently
        category: item.categoryName || 'General',
        isEnding: item.isEnding
      }));

      setWatchedAuctions(transformedData);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoadingWatchlist(false);
    }
  };

  // Helper function to format time left
  const formatTimeLeft = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Mock user data
  const userData = {
    name: 'John Smith',
    email: 'john.smith@email.com',
    memberSince: '2022',
    avatar: null,
    stats: {
      totalBids: 47,
      wonAuctions: 12,
      totalSpent: 15420,
      savedItems: watchedAuctions.length // Use real watchlist count
    }
  };

  const activeBids = [
    {
      id: '1',
      title: 'Vintage Omega Speedmaster Professional',
      myBid: 2750,
      currentBid: 2850,
      status: 'outbid',
      timeLeft: '2d 14h 32m',
      imageUrl: 'img/products/watch.jpg'
    },
    {
      id: '3',
      title: 'Leica M3 35mm Film Camera',
      myBid: 890,
      currentBid: 890,
      status: 'winning',
      timeLeft: '1d 8h 15m',
      imageUrl: 'img/products/camera.jpg'
    }
  ];

  const wonAuctions = [
    {
      id: '10',
      title: 'Art Deco Table Lamp',
      finalBid: 425,
      wonDate: '3 days ago',
      imageUrl: 'img/products/lamp.jpg',
      status: 'delivered'
    },
    {
      id: '11',
      title: 'Vintage Polaroid Camera',
      finalBid: 180,
      wonDate: '1 week ago',
      imageUrl: 'img/products/camera.jpg',
      status: 'shipped'
    }
  ];

  const notifications = [
    {
      id: '1',
      type: 'outbid',
      title: 'You were outbid on Vintage Omega Speedmaster',
      time: '5 minutes ago',
      read: false
    },
    {
      id: '2',
      type: 'ending-soon',
      title: 'Auction ending soon: Mid-Century Modern Chair',
      time: '1 hour ago',
      read: false
    },
    {
      id: '3',
      type: 'won',
      title: 'Congratulations! You won Art Deco Table Lamp',
      time: '3 days ago',
      read: true
    }
  ];

  const handleAuctionClick = (id: string) => {
    setSelectedAuction(id);
    setCurrentPage('auction-details');
  };

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case 'winning': return 'bg-green-100 text-green-800';
      case 'outbid': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDeliveryStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={userData.avatar} />
              <AvatarFallback className="bg-gray-200 text-2xl">
                {userData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{userData.name}</h1>
              <p className="text-gray-600">{userData.email}</p>
              <p className="text-sm text-gray-500">Member since {userData.memberSince}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Gavel className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{userData.stats.totalBids}</div>
                <div className="text-sm text-gray-600">Total Bids</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{userData.stats.wonAuctions}</div>
                <div className="text-sm text-gray-600">Won Auctions</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">${userData.stats.totalSpent.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{userData.stats.savedItems}</div>
                <div className="text-sm text-gray-600">Saved Items</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bids">My Bids</TabsTrigger>
            <TabsTrigger value="watching">Watching</TabsTrigger>
            <TabsTrigger value="won">Won Items</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Bids */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Active Bids</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setActiveTab('bids')}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeBids.slice(0, 2).map((bid) => (
                    <div key={bid.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={bid.imageUrl}
                        alt={bid.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{bid.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-600">Your bid: ${bid.myBid}</span>
                          <Badge className={getBidStatusColor(bid.status)}>
                            {bid.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{bid.timeLeft} left</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Watched Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recently Watched</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setActiveTab('watching')}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {watchedAuctions.map((auction) => (
                    <div 
                      key={auction.id} 
                      className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => handleAuctionClick(auction.id)}
                    >
                      <img
                        src={auction.imageUrl}
                        alt={auction.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{auction.title}</h3>
                        <p className="text-sm text-gray-600">Current bid: ${auction.currentBid}</p>
                        <p className="text-xs text-gray-500">{auction.timeLeft} left</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent Activity</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setActiveTab('notifications')}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className={`flex items-center space-x-3 p-3 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                      <div className={`w-2 h-2 rounded-full ${notification.read ? 'bg-gray-400' : 'bg-blue-500'}`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Bids Tab */}
          <TabsContent value="bids" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Bids</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeBids.map((bid) => (
                    <div key={bid.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={bid.imageUrl}
                          alt={bid.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{bid.title}</h3>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-600">Your bid: ${bid.myBid}</span>
                            <span className="text-sm text-gray-600">Current: ${bid.currentBid}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{bid.timeLeft} remaining</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getBidStatusColor(bid.status)}>
                          {bid.status}
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => handleAuctionClick(bid.id)}
                          className="bg-black text-white hover:bg-gray-800"
                        >
                          {bid.status === 'outbid' ? 'Bid Again' : 'View'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Watching Tab */}
          <TabsContent value="watching" className="space-y-6">
            {loadingWatchlist ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading watchlist...</p>
              </div>
            ) : watchedAuctions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No items in watchlist</h3>
                  <p className="text-gray-600 mb-4">Start watching auctions to see them here</p>
                  <Button onClick={() => setCurrentPage('auctions')}>Browse Auctions</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {watchedAuctions.map((auction) => (
                  <AuctionCard
                    key={auction.id}
                    {...auction}
                    onClick={() => handleAuctionClick(auction.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Won Items Tab */}
          <TabsContent value="won" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Won Auctions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wonAuctions.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">{item.title}</h3>
                          <p className="text-sm text-gray-600">Final bid: ${item.finalBid}</p>
                          <p className="text-xs text-gray-500">Won {item.wonDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getDeliveryStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`p-4 rounded-lg border ${notification.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}