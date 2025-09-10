import { useState } from 'react';
import { Download, TrendingUp, Users, DollarSign, Gavel, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export function Reports() {
  const [timeRange, setTimeRange] = useState('30days');

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 45000, auctions: 120 },
    { month: 'Feb', revenue: 52000, auctions: 135 },
    { month: 'Mar', revenue: 48000, auctions: 128 },
    { month: 'Apr', revenue: 61000, auctions: 142 },
    { month: 'May', revenue: 55000, auctions: 156 },
    { month: 'Jun', revenue: 67000, auctions: 167 },
    { month: 'Jul', revenue: 72000, auctions: 178 },
    { month: 'Aug', revenue: 69000, auctions: 184 },
    { month: 'Sep', revenue: 78000, auctions: 192 }
  ];

  const userGrowthData = [
    { month: 'Jan', users: 8420 },
    { month: 'Feb', users: 8890 },
    { month: 'Mar', users: 9240 },
    { month: 'Apr', users: 9650 },
    { month: 'May', users: 10120 },
    { month: 'Jun', users: 10580 },
    { month: 'Jul', users: 11200 },
    { month: 'Aug', users: 11680 },
    { month: 'Sep', users: 12150 }
  ];

  const categoryData = [
    { name: 'Art & Collectibles', value: 32, color: '#374151' },
    { name: 'Jewelry & Watches', value: 24, color: '#6B7280' },
    { name: 'Antiques', value: 18, color: '#9CA3AF' },
    { name: 'Electronics', value: 15, color: '#D1D5DB' },
    { name: 'Furniture', value: 11, color: '#E5E7EB' }
  ];

  const topPerformingAuctions = [
    {
      title: 'Vintage Rolex Submariner',
      seller: 'WatchExpert',
      finalBid: 8500,
      bids: 47,
      category: 'Watches'
    },
    {
      title: 'Original Picasso Sketch',
      seller: 'ArtGalleryNY',
      finalBid: 12000,
      bids: 89,
      category: 'Art'
    },
    {
      title: 'Antique Victorian Jewelry Set',
      seller: 'AntiqueDealer',
      finalBid: 6750,
      bids: 34,
      category: 'Jewelry'
    },
    {
      title: 'Mid-Century Eames Chair',
      seller: 'ModernFurniture',
      finalBid: 3200,
      bids: 23,
      category: 'Furniture'
    },
    {
      title: 'Rare First Edition Book Collection',
      seller: 'BookCollector',
      finalBid: 4500,
      bids: 31,
      category: 'Books'
    }
  ];

  const stats = [
    {
      title: 'Total Revenue',
      value: '$1,247,580',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: DollarSign
    },
    {
      title: 'Completed Auctions',
      value: '1,542',
      change: '+8.7%',
      changeType: 'positive' as const,
      icon: Gavel
    },
    {
      title: 'Active Users',
      value: '12,847',
      change: '+12.4%',
      changeType: 'positive' as const,
      icon: Users
    },
    {
      title: 'Average Bid Value',
      value: '$809',
      change: '-3.2%',
      changeType: 'negative' as const,
      icon: TrendingUp
    }
  ];

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
    </div>
  );
}