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
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card';
import { Button } from '../../components/button';
import { Badge } from '../../components/badge';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/adminApi';

interface AdminDashboardProps {
  setCurrentPage: (page: string) => void;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalAuctions: number;
  activeAuctions: number;
  totalRevenue: number;
  pendingApprovals: number;
  flaggedAuctions: number;
  recentTransactions: number;
}

interface RecentAuction {
  id: number;
  title: string;
  currentPrice: number;
  endTime: string;
  status: string;
  bidCount: number;
  categoryName?: string;
}

interface ActivityLog {
  id: number;
  type: string;
  message: string;
  severity: string;
  timeAgo: string;
}

export function AdminDashboard({ setCurrentPage }: AdminDashboardProps) {
  const { token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentAuctions, setRecentAuctions] = useState<RecentAuction[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch dashboard stats and activity logs in parallel
        const [statsData, activityData] = await Promise.all([
          adminApi.getDashboardStats(token),
          adminApi.getRecentActivityLogs(token, 5)
        ]);
        
        setStats(statsData as DashboardStats);
        setRecentActivity(activityData as ActivityLog[]);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const getDisplayStats = () => {
    if (!stats) return [];
    
    return [
      {
        title: 'Total Users',
        value: stats.totalUsers.toLocaleString(),
        change: '+12.5%',
        changeType: 'positive' as const,
        icon: Users,
        color: 'bg-blue-100',
        iconColor: 'text-blue-600',
        subtitle: `${stats.activeUsers} active`
      },
      {
        title: 'Active Auctions',
        value: stats.activeAuctions.toString(),
        change: '+8.2%',
        changeType: 'positive' as const,
        icon: Gavel,
        color: 'bg-green-100',
        iconColor: 'text-green-600',
        subtitle: `${stats.totalAuctions} total`
      },
      {
        title: 'Total Revenue',
        value: `$${stats.totalRevenue.toLocaleString()}`,
        change: '+15.3%',
        changeType: 'positive' as const,
        icon: DollarSign,
        color: 'bg-purple-100',
        iconColor: 'text-purple-600',
        subtitle: `${stats.recentTransactions} transactions`
      },
      {
        title: 'Pending Actions',
        value: (stats.pendingApprovals + stats.flaggedAuctions).toString(),
        change: stats.flaggedAuctions > 0 ? `${stats.flaggedAuctions} flagged` : 'All clear',
        changeType: stats.flaggedAuctions > 0 ? 'negative' as const : 'positive' as const,
        icon: AlertTriangle,
        color: 'bg-orange-100',
        iconColor: 'text-orange-600',
        subtitle: `${stats.pendingApprovals} approvals`
      }
    ];
  };

  // Fetch recent auctions
  useEffect(() => {
    const fetchRecentAuctions = async () => {
      if (!token) return;
      
      try {
        const response = await fetch('http://localhost:5021/api/auctions?sortBy=newest', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Get the 5 most recent auctions
          setRecentAuctions(data.slice(0, 5));
        }
      } catch (err) {
        console.error('Error fetching recent auctions:', err);
      }
    };

    fetchRecentAuctions();
  }, [token]);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <Badge className="bg-green-100 text-green-800">Open</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'Closed':
        return <Badge className="bg-blue-100 text-blue-800">Closed</Badge>;
      case 'Sold':
        return <Badge className="bg-purple-100 text-purple-800">Sold</Badge>;
      case 'Suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      case 'Deleted':
        return <Badge className="bg-gray-100 text-gray-800">Deleted</Badge>;
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">Loading dashboard statistics...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Error Loading Dashboard</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.location.reload()}
                  className="mt-3 border-red-300 text-red-700 hover:bg-red-100"
                >
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      {!loading && !error && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getDisplayStats().map((stat, index) => {
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
                      </div>
                      {stat.subtitle && (
                        <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                      )}
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
      )}

      {!loading && !error && stats && (
        <>
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
              {recentAuctions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No recent auctions
                </div>
              ) : (
                recentAuctions.map((auction) => (
                  <div key={auction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{auction.title}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-sm text-gray-600">{auction.categoryName || 'Uncategorized'}</span>
                        <span className="text-sm text-gray-600">•</span>
                        <span className="text-sm text-gray-600">{auction.bidCount || 0} bids</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="font-medium text-gray-900">${auction.currentPrice.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">{formatTimeLeft(auction.endTime)} left</div>
                      {getStatusBadge(auction.status)}
                    </div>
                  </div>
                ))
              )}
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
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timeAgo}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              )}
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
          </div>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  );
}