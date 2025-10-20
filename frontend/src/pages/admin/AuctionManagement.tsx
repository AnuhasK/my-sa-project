import { useState } from 'react';
import { Search, Filter, MoreHorizontal, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, Plus } from 'lucide-react';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card';
import { Badge } from '../../components/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/tabs';

interface AuctionManagementProps {
  setCurrentPage?: (page: string) => void;
}

export function AuctionManagement({ setCurrentPage }: AuctionManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');

  const auctions = [
    {
      id: 'AUC-001',
      title: 'Vintage Omega Speedmaster Professional',
      seller: 'TimeCollector',
      category: 'Watches',
      startDate: '2024-09-05',
      endDate: '2024-09-15',
      startingBid: 1500,
      currentBid: 2850,
      bids: 23,
      status: 'active',
      featured: true,
      views: 1247
    },
    {
      id: 'AUC-002',
      title: 'Mid-Century Modern Lounge Chair',
      seller: 'FurnitureExpert',
      category: 'Furniture',
      startDate: '2024-09-08',
      endDate: '2024-09-12',
      startingBid: 500,
      currentBid: 1250,
      bids: 18,
      status: 'ending-soon',
      featured: false,
      views: 892
    },
    {
      id: 'AUC-003',
      title: 'Original Oil Painting - Abstract Landscape',
      seller: 'ArtDealer',
      category: 'Art',
      startDate: '2024-09-10',
      endDate: '2024-09-20',
      startingBid: 800,
      currentBid: 1680,
      bids: 31,
      status: 'active',
      featured: true,
      views: 1456
    },
    {
      id: 'AUC-004',
      title: 'Rare Book Collection - First Editions',
      seller: 'BookCollector',
      category: 'Books',
      startDate: '2024-09-12',
      endDate: '2024-09-22',
      startingBid: 200,
      currentBid: 450,
      bids: 7,
      status: 'pending-approval',
      featured: false,
      views: 234
    },
    {
      id: 'AUC-005',
      title: 'Antique Silver Tea Set',
      seller: 'SilverSpecialist',
      category: 'Antiques',
      startDate: '2024-09-01',
      endDate: '2024-09-08',
      startingBid: 300,
      currentBid: 875,
      bids: 15,
      status: 'completed',
      featured: false,
      views: 687
    },
    {
      id: 'AUC-006',
      title: 'Designer Handbag - Limited Edition',
      seller: 'LuxuryItems',
      category: 'Fashion',
      startDate: '2024-09-14',
      endDate: '2024-09-24',
      startingBid: 600,
      currentBid: 0,
      bids: 0,
      status: 'upcoming',
      featured: false,
      views: 156
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
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'upcoming':
        return <Badge className="bg-purple-100 text-purple-800">Upcoming</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800">Suspended</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'ending-soon':
        return <Clock className="w-4 h-4 text-orange-600" />;
      case 'pending-approval':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'suspended':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const filterAuctionsByTab = (tab: string) => {
    switch (tab) {
      case 'active':
        return auctions.filter(a => a.status === 'active' || a.status === 'ending-soon');
      case 'pending':
        return auctions.filter(a => a.status === 'pending-approval');
      case 'completed':
        return auctions.filter(a => a.status === 'completed');
      case 'upcoming':
        return auctions.filter(a => a.status === 'upcoming');
      default:
        return auctions;
    }
  };

  const filteredAuctions = filterAuctionsByTab(activeTab).filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auction.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         auction.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || auction.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || auction.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = [
    { label: 'Total Auctions', value: auctions.length, color: 'text-gray-900' },
    { label: 'Active', value: auctions.filter(a => a.status === 'active' || a.status === 'ending-soon').length, color: 'text-green-600' },
    { label: 'Pending Approval', value: auctions.filter(a => a.status === 'pending-approval').length, color: 'text-yellow-600' },
    { label: 'Completed This Month', value: auctions.filter(a => a.status === 'completed').length, color: 'text-blue-600' }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Auction Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all auction listings</p>
        </div>
        <Button 
          className="bg-black text-white hover:bg-gray-800"
          onClick={() => setCurrentPage?.('admin-create-auction')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Auction
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <CardTitle>Auction Directory</CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search auctions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Watches">Watches</SelectItem>
                  <SelectItem value="Art">Art</SelectItem>
                  <SelectItem value="Furniture">Furniture</SelectItem>
                  <SelectItem value="Books">Books</SelectItem>
                  <SelectItem value="Antiques">Antiques</SelectItem>
                  <SelectItem value="Fashion">Fashion</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending-approval">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Auction</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Bids</TableHead>
                      <TableHead>Current Bid</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuctions.map((auction) => (
                      <TableRow key={auction.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900 flex items-center">
                              {auction.title}
                              {auction.featured && (
                                <Badge className="ml-2 bg-purple-100 text-purple-800 text-xs">
                                  Featured
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{auction.id}</div>
                            <div className="text-xs text-gray-400">{auction.views} views</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{auction.seller}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{auction.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(auction.status)}
                            {getStatusBadge(auction.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{auction.bids}</div>
                            <div className="text-gray-500">bids</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              ${auction.currentBid > 0 ? auction.currentBid.toLocaleString() : 'No bids'}
                            </div>
                            <div className="text-gray-500">
                              Start: ${auction.startingBid.toLocaleString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">{auction.endDate}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Auction
                              </DropdownMenuItem>
                              {auction.status === 'pending-approval' && (
                                <>
                                  <DropdownMenuItem className="text-green-600">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Showing {filteredAuctions.length} of {filterAuctionsByTab(activeTab).length} auctions
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="bg-black text-white">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    3
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}