import { useState, useEffect } from 'react';
import { Download, TrendingUp, Users, DollarSign, Gavel, Calendar, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card';
import { Button } from '../../components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { adminApi } from '../../services/adminApi';
import { toast } from 'sonner';

export function Reports() {
  const { token } = useAuth();
  const [timeRange, setTimeRange] = useState('30days');
  const [loading, setLoading] = useState(true);
  
  // State for analytics data
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topPerformingAuctions, setTopPerformingAuctions] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        
        // Fetch all analytics data in parallel
        const [revenue, userGrowth, categories, topAuctions, analyticsStats] = await Promise.all([
          adminApi.getRevenueData(token, 9),
          adminApi.getUserGrowthData(token, 9),
          adminApi.getCategoryDistribution(token),
          adminApi.getTopPerformingAuctions(token, 5),
          adminApi.getAnalyticsStats(token)
        ]);
        
        setRevenueData(revenue);
        setUserGrowthData(userGrowth);
        setCategoryData(categories);
        setTopPerformingAuctions(topAuctions);
        
        // Format stats from analytics stats
        const statsData = analyticsStats as any;
        setStats([
          {
            title: 'Total Revenue',
            value: statsData.totalRevenueFormatted,
            change: `${statsData.revenueChange >= 0 ? '+' : ''}${statsData.revenueChange.toFixed(1)}%`,
            changeType: statsData.revenueChange >= 0 ? 'positive' : 'negative',
            icon: DollarSign
          },
          {
            title: 'Completed Auctions',
            value: statsData.completedAuctions.toLocaleString(),
            change: `${statsData.auctionsChange >= 0 ? '+' : ''}${statsData.auctionsChange.toFixed(1)}%`,
            changeType: statsData.auctionsChange >= 0 ? 'positive' : 'negative',
            icon: Gavel
          },
          {
            title: 'Active Users',
            value: statsData.activeUsers.toLocaleString(),
            change: `${statsData.usersChange >= 0 ? '+' : ''}${statsData.usersChange.toFixed(1)}%`,
            changeType: statsData.usersChange >= 0 ? 'positive' : 'negative',
            icon: Users
          },
          {
            title: 'Average Bid Value',
            value: statsData.averageBidValueFormatted,
            change: `${statsData.bidValueChange >= 0 ? '+' : ''}${statsData.bidValueChange.toFixed(1)}%`,
            changeType: statsData.bidValueChange >= 0 ? 'positive' : 'negative',
            icon: TrendingUp
          }
        ]);
        
      } catch (err: any) {
        console.error('Error fetching analytics data:', err);
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [token]);

  const exportReport = (type: string) => {
    // Mock export functionality
    console.log(`Exporting ${type} report...`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Track platform performance and insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => exportReport('full')}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">Loading analytics data...</span>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                      <span className="text-sm text-gray-500 ml-1">vs last period</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Monthly Revenue</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => exportReport('revenue')}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Bar dataKey="revenue" fill="#374151" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Auction Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Line 
                      type="monotone" 
                      dataKey="auctions" 
                      stroke="#374151" 
                      strokeWidth={2}
                      dot={{ fill: '#374151', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Growth Over Time</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => exportReport('users')}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#374151" 
                    strokeWidth={3}
                    dot={{ fill: '#374151', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Auction Categories Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm font-medium text-gray-900">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{category.value}%</div>
                        <div className="text-xs text-gray-500">of total auctions</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Performing Auctions</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => exportReport('performance')}>
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Auction Title</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Final Bid</TableHead>
                    <TableHead>Total Bids</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPerformingAuctions.map((auction, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium text-gray-900">{auction.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">{auction.seller}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">{auction.category}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-900">${auction.finalBid.toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">{auction.bids} bids</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </>
      )}
    </div>
  );
}