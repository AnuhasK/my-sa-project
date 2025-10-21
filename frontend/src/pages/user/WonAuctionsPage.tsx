import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Package, Clock, Truck, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';

interface WonAuction {
  id: number;
  auctionId: number;
  auctionTitle: string;
  otherPartyUsername: string;
  amount: number;
  paymentStatus: string;
  createdAt: string;
}

interface WonAuctionsPageProps {
  setCurrentPage: (page: string) => void;
  setSelectedAuction: (id: string) => void;
}

export function WonAuctionsPage({ setCurrentPage, setSelectedAuction }: WonAuctionsPageProps) {
  const { user, token } = useAuth();
  const [transactions, setTransactions] = useState<WonAuction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<WonAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  useEffect(() => {
    if (!user || !token) {
      setCurrentPage('login');
      return;
    }

    const fetchWonAuctions = async () => {
      try {
        setLoading(true);
        const data = await api.getBuyerTransactions(token);
        setTransactions(data);
        setFilteredTransactions(data);
      } catch (err: any) {
        console.error('Error fetching won auctions:', err);
        setError(err.message || 'Failed to load won auctions');
      } finally {
        setLoading(false);
      }
    };

    fetchWonAuctions();
  }, [user, token, setCurrentPage]);

  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredTransactions(transactions);
    } else {
      setFilteredTransactions(
        transactions.filter(t => t.paymentStatus === statusFilter)
      );
    }
  }, [statusFilter, transactions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Paid':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Shipped':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-5 h-5" />;
      case 'Paid':
        return <Package className="w-5 h-5" />;
      case 'Shipped':
        return <Truck className="w-5 h-5" />;
      case 'Completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'Cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNextSteps = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'Please contact admin to arrange payment';
      case 'Paid':
        return 'Payment received. Waiting for shipment';
      case 'Shipped':
        return 'Item has been shipped. Check tracking details';
      case 'Completed':
        return 'Order completed. Thank you!';
      case 'Cancelled':
        return 'Order has been cancelled';
      default:
        return 'Contact admin for more information';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your won auctions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Won Auctions</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Purchases</h1>
              <p className="text-gray-600">
                {transactions.length === 0 
                  ? 'No won auctions yet' 
                  : `You've won ${transactions.length} ${transactions.length === 1 ? 'auction' : 'auctions'}`
                }
              </p>
            </div>
            
            {/* Filter Dropdown */}
            {transactions.length > 0 && (
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            )}
          </div>

          {/* Status Summary */}
          {transactions.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-800">
                  {transactions.filter(t => t.paymentStatus === 'Pending').length}
                </div>
                <div className="text-sm text-yellow-600">Pending</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-800">
                  {transactions.filter(t => t.paymentStatus === 'Paid').length}
                </div>
                <div className="text-sm text-blue-600">Paid</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-800">
                  {transactions.filter(t => t.paymentStatus === 'Shipped').length}
                </div>
                <div className="text-sm text-purple-600">Shipped</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-800">
                  {transactions.filter(t => t.paymentStatus === 'Completed').length}
                </div>
                <div className="text-sm text-green-600">Completed</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-800">
                  {transactions.filter(t => t.paymentStatus === 'Cancelled').length}
                </div>
                <div className="text-sm text-red-600">Cancelled</div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {transactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Won Auctions Yet</h2>
            <p className="text-gray-500 mb-6">
              Start bidding on auctions to see your purchases here.
            </p>
            <button
              onClick={() => setCurrentPage('auctions')}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Browse Auctions
            </button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No {statusFilter} Orders</h2>
            <p className="text-gray-500 mb-6">
              No orders found with status: {statusFilter}
            </p>
          </div>
        ) : (
          /* Transaction Cards */
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left Section - Auction Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${getStatusColor(transaction.paymentStatus)}`}>
                          {getStatusIcon(transaction.paymentStatus)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {transaction.auctionTitle}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                            <span>Order #{transaction.id}</span>
                            <span>•</span>
                            <span>{formatDate(transaction.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={`${getStatusColor(transaction.paymentStatus)} border`}>
                              {transaction.paymentStatus}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {getNextSteps(transaction.paymentStatus)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Amount and Actions */}
                    <div className="flex flex-col items-end gap-3 md:min-w-[200px]">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Total Amount</div>
                        <div className="text-2xl font-bold text-gray-900">
                          ${transaction.amount.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 w-full">
                        <Button
                          onClick={() => {
                            setSelectedAuction(transaction.auctionId.toString());
                            setCurrentPage('auction-details');
                          }}
                          variant="outline"
                          className="w-full"
                        >
                          View Auction
                        </Button>
                        {transaction.paymentStatus === 'Pending' && (
                          <Button
                            onClick={() => {
                              // TODO: Implement contact admin functionality
                              alert('Contact Admin feature coming soon!');
                            }}
                            className="w-full bg-black text-white hover:bg-gray-800"
                          >
                            Contact Admin
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
