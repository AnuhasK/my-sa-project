import { useState, useEffect } from 'react';
import { Search, Filter, MoreHorizontal, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, Plus, Loader2, Lock } from 'lucide-react';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card';
import { Badge } from '../../components/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/tabs';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

interface AuctionManagementProps {
  setCurrentPage?: (page: string) => void;
}

interface Auction {
  id: number;
  title: string;
  description: string;
  currentPrice: number;
  startTime: string;
  endTime: string;
  status: string;
  categoryId: number;
  categoryName?: string;
  sellerId?: number;
  sellerUsername?: string;
  bidCount?: number;
  primaryImageUrl?: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

export function AuctionManagement({ setCurrentPage }: AuctionManagementProps) {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch auctions from backend
  useEffect(() => {
    fetchAuctions();
    fetchCategories();
  }, [token]);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:5021/api/auctions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch auctions');
      }

      const data = await response.json();
      setAuctions(data); // Keep all auctions including deleted ones
    } catch (err: any) {
      console.error('Error fetching auctions:', err);
      setError(err.message);
      toast.error('Failed to load auctions');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5021/api/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const data = await response.json();
      setCategories(data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleDeleteAuction = async (auctionId: number) => {
    if (!confirm('Are you sure you want to delete this auction?')) return;

    try {
      const response = await fetch(`http://localhost:5021/api/auctions/${auctionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Try to get error message from response
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Failed to delete auction';
        throw new Error(errorMessage);
      }

      toast.success('Auction deleted successfully');
      await fetchAuctions();
    } catch (err: any) {
      console.error('Error deleting auction:', err);
      toast.error(err.message || 'Failed to delete auction');
    }
  };

  const handleChangeStatus = async (auctionId: number, newStatus: string) => {
    if (!confirm(`Are you sure you want to change this auction status to ${newStatus}?`)) return;

    try {
      const response = await fetch(`http://localhost:5021/api/admin/auctions/${auctionId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || 'Failed to change auction status';
        throw new Error(errorMessage);
      }

      toast.success(`Auction status changed to ${newStatus}`);
      await fetchAuctions();
    } catch (err: any) {
      console.error('Error changing auction status:', err);
      toast.error(err.message || 'Failed to change auction status');
    }
  };

  const handleCloseAuction = async (auctionId: number, auctionTitle: string) => {
    if (!confirm(`Close auction "${auctionTitle}" and create transaction for winner?`)) return;

    try {
      const response = await fetch(`http://localhost:5021/api/auctions/${auctionId}/close`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to close auction');
      }

      toast.success('Auction closed and transaction created successfully!');
      await fetchAuctions();
    } catch (err: any) {
      console.error('Error closing auction:', err);
      toast.error(err.message || 'Failed to close auction');
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'Pending':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'Closed':
      case 'Sold':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'Suspended':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const filterAuctionsByTab = (tab: string) => {
    switch (tab) {
      case 'active':
        return auctions.filter(a => a.status === 'Open');
      case 'pending':
        return auctions.filter(a => a.status === 'Pending');
      case 'completed':
        return auctions.filter(a => a.status === 'Closed' || a.status === 'Sold');
      case 'flagged':
        return auctions.filter(a => a.status === 'Suspended' || a.status === 'Deleted');
      default:
        // "All" tab - exclude deleted auctions
        return auctions.filter(a => a.status !== 'Deleted');
    }
  };

  const filteredAuctions = filterAuctionsByTab(activeTab).filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || auction.categoryId.toString() === categoryFilter;
    const matchesStatus = statusFilter === 'all' || auction.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = [
    { label: 'Total Auctions', value: auctions.filter(a => a.status !== 'Deleted').length, color: 'text-gray-900' },
    { label: 'Open', value: auctions.filter(a => a.status === 'Open').length, color: 'text-green-600' },
    { label: 'Pending Approval', value: auctions.filter(a => a.status === 'Pending').length, color: 'text-yellow-600' },
    { label: 'Closed/Sold', value: auctions.filter(a => a.status === 'Closed' || a.status === 'Sold').length, color: 'text-blue-600' }
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
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                  <SelectItem value="Deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Open</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Closed/Sold</TabsTrigger>
              <TabsTrigger value="flagged">Flagged</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600">Loading auctions...</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertTriangle className="w-12 h-12 text-red-400 mb-2" />
                  <p className="text-red-600">{error}</p>
                  <Button onClick={fetchAuctions} className="mt-4">Retry</Button>
                </div>
              ) : filteredAuctions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-gray-600">No auctions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Auction</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Current Price</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAuctions.map((auction) => (
                        <TableRow key={auction.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-gray-900">
                                {auction.title}
                              </div>
                              <div className="text-sm text-gray-500">ID: {auction.id}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {auction.categoryName || categories.find(c => c.id === auction.categoryId)?.name || 'Unknown'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(auction.status)}
                              {getStatusBadge(auction.status)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="font-medium">
                                ${auction.currentPrice?.toLocaleString() || '0'}
                              </div>
                              <div className="text-gray-500">
                                {auction.bidCount || 0} bids
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {new Date(auction.startTime).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600">
                              {new Date(auction.endTime).toLocaleDateString()}
                            </div>
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
                              
                              {/* Change Status Section */}
                              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">Change Status</div>
                              {auction.status !== 'Open' && (
                                <DropdownMenuItem 
                                  className="text-green-600"
                                  onClick={() => handleChangeStatus(auction.id, 'Open')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Set as Open
                                </DropdownMenuItem>
                              )}
                              {auction.status !== 'Pending' && (
                                <DropdownMenuItem 
                                  className="text-yellow-600"
                                  onClick={() => handleChangeStatus(auction.id, 'Pending')}
                                >
                                  <AlertTriangle className="w-4 h-4 mr-2" />
                                  Set as Pending
                                </DropdownMenuItem>
                              )}
                              {auction.status !== 'Closed' && (
                                <DropdownMenuItem 
                                  className="text-blue-600"
                                  onClick={() => handleChangeStatus(auction.id, 'Closed')}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Set as Closed
                                </DropdownMenuItem>
                              )}
                              
                              <div className="my-1 h-px bg-gray-200" />
                              
                              {/* Close Auction & Create Transaction */}
                              {(auction.status === 'Open' || auction.status === 'Closed') && auction.bidCount && auction.bidCount > 0 && (
                                <DropdownMenuItem 
                                  className="text-indigo-600 font-medium"
                                  onClick={() => handleCloseAuction(auction.id, auction.title)}
                                >
                                  <Lock className="w-4 h-4 mr-2" />
                                  Close & Create Transaction
                                </DropdownMenuItem>
                              )}
                              
                              <div className="my-1 h-px bg-gray-200" />
                              
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteAuction(auction.id)}
                              >
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
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}