import { useState, useEffect } from 'react';
import { User, Heart, Gavel, Bell, Settings, Eye, Clock, DollarSign, Trophy, ArrowRight, Receipt, AlertCircle, CheckCircle, XCircle, Truck } from 'lucide-react';
import { Button } from '../../components/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/tabs';
import { Badge } from '../../components/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/avatar';
import { AuctionCard } from './AuctionCard';
import { api } from '../../services/api';
import { TransactionsList } from '../../components/TransactionsList';
import { useAuth } from '../../contexts/AuthContext';

interface UserDashboardProps {
  setCurrentPage: (page: string) => void;
  setSelectedAuction: (id: string) => void;
}

export function UserDashboard({ setCurrentPage, setSelectedAuction }: UserDashboardProps) {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [watchedAuctions, setWatchedAuctions] = useState<any[]>([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [activeBids, setActiveBids] = useState<any[]>([]);
  const [wonAuctions, setWonAuctions] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingBids, setLoadingBids] = useState(false);

  // Fetch user profile and stats when component mounts
  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
    fetchNotifications();
  }, []);

  // Fetch data when tabs change
  useEffect(() => {
    if (activeTab === 'bids' || activeTab === 'overview') {
      fetchActiveBids();
    }
    if (activeTab === 'won' || activeTab === 'overview') {
      fetchWonAuctions();
    }
    if (activeTab === 'overview') {
      fetchWatchlist(); // Still fetch for overview tab display
    }
  }, [activeTab]);

  const fetchUserProfile = async () => {
    try {
      if (!token) return;

      const profile = await api.getCurrentUser(token);
      setUserData({
        name: profile.username,
        email: profile.email,
        memberSince: new Date(profile.createdAt).getFullYear().toString(),
        avatar: profile.profileImageUrl,
        role: profile.role
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserStats = async () => {
    try {
      setLoadingStats(true);
      if (!token) return;

      const stats = await api.getUserStats(token);
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchActiveBids = async () => {
    try {
      setLoadingBids(true);
      if (!token) return;

      const bids = await api.getUserActiveBids(token);
      console.log('Fetched active bids:', bids); // Debug log
      setActiveBids(bids.map((bid: any) => ({
        id: bid.auctionId.toString(),
        title: bid.title,
        myBid: bid.myBid,
        currentBid: bid.currentBid,
        status: bid.status,
        timeLeft: formatTimeLeft(new Date(bid.timeLeft)),
        imageUrl: 'https://images.unsplash.com/photo-1695528589305-5103f5c52306?w=400'
      })));
    } catch (error) {
      console.error('Error fetching active bids:', error);
      setActiveBids([]);
    } finally {
      setLoadingBids(false);
    }
  };

  const fetchWonAuctions = async () => {
    try {
      if (!token) return;

      // Use the transaction API to get won auctions
      const transactions = await api.getBuyerTransactions(token);
      setWonAuctions(transactions.map((transaction: any) => ({
        id: transaction.auctionId.toString(),
        transactionId: transaction.id,
        title: transaction.auctionTitle,
        finalBid: transaction.amount,
        wonDate: formatTimeAgo(new Date(transaction.createdAt)),
        imageUrl: transaction.auctionImageUrl || '/img/placeholder-auction.jpg',
        status: transaction.paymentStatus.toLowerCase(), // 'Pending', 'Paid', 'Shipped', 'Completed'
        paymentStatus: transaction.paymentStatus
      })));
    } catch (error) {
      console.error('Error fetching won auctions:', error);
      setWonAuctions([]);
    }
  };

  const fetchWatchlist = async () => {
    try {
      setLoadingWatchlist(true);
      if (!token) {
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

  // Helper function to format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      if (!token) return;

      const notificationsData = await api.getNotifications(token, 1, 20);
      console.log('Fetched notifications data:', notificationsData); // Debug log
      
      // Check if notificationsData is an array directly (not wrapped in an object)
      const notificationsList = Array.isArray(notificationsData) ? notificationsData : notificationsData.items || [];
      
      setNotifications(notificationsList.map((notif: any) => ({
        id: notif.id.toString(),
        type: notif.type.toLowerCase(),
        title: notif.title,
        message: notif.message,
        time: formatTimeAgo(new Date(notif.createdAt)),
        read: notif.isRead
      })));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

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

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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
              <AvatarImage src={userData?.avatar} />
              <AvatarFallback className="bg-gray-200 text-2xl">
                {userData?.name ? userData.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{userData?.name || 'Loading...'}</h1>
              <p className="text-gray-600">{userData?.email || ''}</p>
              <p className="text-sm text-gray-500">Member since {userData?.memberSince || 'N/A'}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <Gavel className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {loadingStats ? '...' : (userStats?.totalBids || 0)}
                </div>
                <div className="text-sm text-gray-600">Total Bids</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {loadingStats ? '...' : (userStats?.wonAuctions || 0)}
                </div>
                <div className="text-sm text-gray-600">Won Auctions</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {loadingStats ? '...' : `$${(userStats?.totalSpent || 0).toLocaleString()}`}
                </div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {loadingStats ? '...' : (userStats?.watchlistCount || 0)}
                </div>
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
            <TabsTrigger value="won">Won Items</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
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
                  {activeBids.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No active bids</p>
                  ) : (
                    activeBids.slice(0, 2).map((bid) => (
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
                    ))
                  )}
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
                      onClick={() => setCurrentPage('watchlist')}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {watchedAuctions.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No watched items</p>
                  ) : (
                    watchedAuctions.slice(0, 3).map((auction) => (
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
                    ))
                  )}
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
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No notifications</p>
                  ) : (
                    notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className={`flex items-center space-x-3 p-3 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                        <div className={`w-2 h-2 rounded-full ${notification.read ? 'bg-gray-400' : 'bg-blue-500'}`} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Bids Tab */}
          <TabsContent value="bids" className="space-y-6">
            {loadingBids ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-600">Loading your bids...</p>
                </CardContent>
              </Card>
            ) : activeBids.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Gavel className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active bids</h3>
                  <p className="text-gray-600 mb-4">Start bidding on auctions to see them here</p>
                  <Button onClick={() => setCurrentPage('auctions')}>Browse Auctions</Button>
                </CardContent>
              </Card>
            ) : (
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
            )}
          </TabsContent>

          {/* Won Items Tab */}
          <TabsContent value="won" className="space-y-6">
            {wonAuctions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Trophy className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No won auctions yet</h3>
                  <p className="text-gray-600 mb-4">Place winning bids to see your purchases here</p>
                  <Button onClick={() => setCurrentPage('auctions')}>Browse Auctions</Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Won Auctions & Orders</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Track your winning bids and payment status</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {wonAuctions.map((item) => (
                      <div key={item.transactionId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div>
                              <h3 className="font-medium text-gray-900">{item.title}</h3>
                              <p className="text-sm text-gray-600">Final bid: ${item.finalBid.toFixed(2)}</p>
                              <p className="text-xs text-gray-500">Won {item.wonDate}</p>
                              <p className="text-xs text-gray-500">Order #{item.transactionId}</p>
                            </div>
                          </div>
                          <Badge className={getPaymentStatusColor(item.paymentStatus)}>
                            {item.paymentStatus}
                          </Badge>
                        </div>
                        
                        {/* Status-based action messages */}
                        <div className="bg-gray-50 rounded-lg p-3 mt-3">
                          {item.paymentStatus === 'Pending' && (
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Payment Required</p>
                                <p className="text-xs text-gray-600 mt-1">Please contact the admin to complete payment and arrange delivery.</p>
                                <Button 
                                  size="sm" 
                                  className="mt-2 bg-black text-white hover:bg-gray-800"
                                  onClick={() => {/* Navigate to contact admin or open modal */}}
                                >
                                  Contact Admin
                                </Button>
                              </div>
                            </div>
                          )}
                          {item.paymentStatus === 'Paid' && (
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Payment Confirmed</p>
                                <p className="text-xs text-gray-600 mt-1">Your payment has been received. Item will be shipped soon.</p>
                              </div>
                            </div>
                          )}
                          {item.paymentStatus === 'Shipped' && (
                            <div className="flex items-start space-x-2">
                              <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Item Shipped</p>
                                <p className="text-xs text-gray-600 mt-1">Your item is on the way! Check tracking information for updates.</p>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="mt-2"
                                  onClick={() => {/* Show tracking details */}}
                                >
                                  Track Package
                                </Button>
                              </div>
                            </div>
                          )}
                          {item.paymentStatus === 'Completed' && (
                            <div className="flex items-start space-x-2">
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Order Completed</p>
                                <p className="text-xs text-gray-600 mt-1">This order has been delivered and completed.</p>
                              </div>
                            </div>
                          )}
                          {item.paymentStatus === 'Cancelled' && (
                            <div className="flex items-start space-x-2">
                              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">Order Cancelled</p>
                                <p className="text-xs text-gray-600 mt-1">This order has been cancelled. Contact admin for details.</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-end space-x-2 mt-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAuctionClick(item.id)}
                          >
                            View Auction
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            {loadingNotifications ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-gray-600">Loading notifications...</p>
                </CardContent>
              </Card>
            ) : notifications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications yet</h3>
                  <p className="text-gray-600">You'll see updates about your bids and auctions here</p>
                </CardContent>
              </Card>
            ) : (
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
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            {notification.message && (
                              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                            )}
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
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  My Purchases
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">View and manage your auction purchases and orders</p>
              </CardHeader>
              <CardContent>
                <TransactionsList type="buyer" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}