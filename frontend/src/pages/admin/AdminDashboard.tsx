import { 
  Users, 
  Gavel, 
  DollarSign, 
  TrendingUp, 
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';

interface AdminDashboardProps {
  setCurrentPage: (page: string) => void;
}

export function AdminDashboard({ setCurrentPage }: AdminDashboardProps) {
  const stats = [
    {
      title: 'Total Users',
      value: '12,847',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Active Auctions',
      value: '347',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: Gavel,
      color: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Monthly Revenue',
      value: '$89,432',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Platform Growth',
      value: '23.4%',
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: TrendingUp,
      color: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  const recentAuctions = [
    {
      id: '1',
      title: 'Vintage Omega Speedmaster Professional',
      seller: 'TimeCollector',
      currentBid: 2850,
      endTime: '2h 15m',
      status: 'active',
      bids: 23
    },
    {
      id: '2',
      title: 'Mid-Century Modern Lounge Chair',
      seller: 'FurnitureExpert',
      currentBid: 1250,
      endTime: '5h 42m',
      status: 'ending-soon',
      bids: 18
    },
    {
      id: '3',
      title: 'Original Oil Painting - Abstract',
      seller: 'ArtDealer',
      currentBid: 1680,
      endTime: '1d 8h',
      status: 'active',
      bids: 31
    },
    {
      id: '4',
      title: 'Leica M3 35mm Film Camera',
      seller: 'CameraShop',
      currentBid: 890,
      endTime: '3h 20m',
      status: 'pending-approval',
      bids: 12
    }
  ];

  const recentActivity = [
    {
      type: 'user-registered',
      message: 'New user registration: john.doe@email.com',
      time: '5 minutes ago',
      severity: 'info'
    },
    {
      type: 'auction-ended',
      message: 'Auction "Vintage Watch Collection" ended with final bid $3,200',
      time: '15 minutes ago',
      severity: 'success'
    },
    {
      type: 'dispute-reported',
      message: 'Payment dispute reported for auction #AUC-1247',
      time: '32 minutes ago',
      severity: 'warning'
    },
    {
      type: 'high-value-bid',
      message: 'High value bid placed: $5,500 on "Art Deco Sculpture"',
      time: '1 hour ago',
      severity: 'info'
    },
    {
      type: 'seller-verification',
      message: 'Seller verification completed for "AntiqueDealerNY"',
      time: '2 hours ago',
      severity: 'success'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'ending-soon':
        return <Badge className="bg-orange-100 text-orange-800">Ending Soon</Badge>;
      case 'pending-approval':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'dispute-reported':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'auction-ended':
      case 'seller-verification':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Eye className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Monitor your auction platform performance</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.changeType === 'positive' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm ml-1 ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">vs last month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Auctions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Auctions</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentPage('admin-auctions')}
                className="text-gray-600 hover:text-gray-900"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAuctions.map((auction) => (
                <div key={auction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{auction.title}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-sm text-gray-600">by {auction.seller}</span>
                      <span className="text-sm text-gray-600">•</span>
                      <span className="text-sm text-gray-600">{auction.bids} bids</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-medium text-gray-900">${auction.currentBid.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{auction.endTime} left</div>
                    {getStatusBadge(auction.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setCurrentPage('admin-notifications')}
                className="text-gray-600 hover:text-gray-900"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => setCurrentPage('admin-users')}
            >
              <Users className="w-6 h-6" />
              <span>Manage Users</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => setCurrentPage('admin-auctions')}
            >
              <Gavel className="w-6 h-6" />
              <span>Review Auctions</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => setCurrentPage('admin-reports')}
            >
              <TrendingUp className="w-6 h-6" />
              <span>View Reports</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col space-y-2"
              onClick={() => setCurrentPage('admin-support')}
            >
              <HelpCircle className="w-6 h-6" />
              <span>Support Tickets</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}