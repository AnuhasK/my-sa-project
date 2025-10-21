import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/card';
import { Button } from '../../components/button';
import { Input } from '../../components/input';
import { Label } from '../../components/label';
import { Textarea } from '../../components/textarea';

interface Transaction {
  id: number;
  auctionId: number;
  auctionTitle: string;
  buyerId: number;
  buyerUsername: string;
  buyerEmail: string;
  amount: number;
  paymentStatus: string;
  shippingAddress?: string;
  trackingNumber?: string;
  shippingMethod?: string;
  adminNotes?: string;
  createdAt: string;
  paidDate?: string;
  shippedDate?: string;
  completedDate?: string;
}

export function TransactionManagement() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [shippingForm, setShippingForm] = useState({
    shippingAddress: '',
    trackingNumber: '',
    shippingMethod: '',
    adminNotes: '',
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await api.getAllTransactions(token);
      console.log('Loaded transactions:', data);
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      alert('Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.paymentStatus.toLowerCase() === filter.toLowerCase();
  });

  const handleUpdateShipping = async (transactionId: number) => {
    try {
      await api.updateShippingInfo(transactionId, shippingForm, token);
      alert('Shipping information updated successfully');
      setShowShippingForm(false);
      setSelectedTransaction(null);
      loadTransactions();
    } catch (error) {
      console.error('Error updating shipping:', error);
      alert('Failed to update shipping information');
    }
  };

  const handleMarkAsShipped = async (transactionId: number) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    // Check if shipping info exists
    if (!transaction.trackingNumber) {
      alert('Please add shipping information first before marking as shipped.');
      openShippingForm(transaction);
      return;
    }

    if (!confirm('Mark this transaction as shipped? The buyer will be notified.')) return;

    try {
      // Use the existing shipping info to mark as shipped
      await api.markAsShipped(transactionId, {
        trackingNumber: transaction.trackingNumber,
        shippingMethod: transaction.shippingMethod,
        shippingAddress: transaction.shippingAddress,
        adminNotes: transaction.adminNotes
      }, token);
      alert('Transaction marked as shipped. Buyer has been notified.');
      loadTransactions();
    } catch (error) {
      console.error('Error marking as shipped:', error);
      alert('Failed to update transaction status');
    }
  };

  const openShippingForm = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShippingForm({
      shippingAddress: transaction.shippingAddress || '',
      trackingNumber: transaction.trackingNumber || '',
      shippingMethod: transaction.shippingMethod || '',
      adminNotes: transaction.adminNotes || '',
    });
    setShowShippingForm(true);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      paid: 'bg-green-100 text-green-800 border-green-300',
      shipped: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusCount = (status: string) => {
    if (status === 'all') return transactions.length;
    return transactions.filter(t => t.paymentStatus.toLowerCase() === status).length;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-3xl">Transaction Management</CardTitle>
          <p className="text-gray-600 mt-2">Manage payments, shipping, and order fulfillment</p>
        </CardHeader>
      </Card>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'pending', 'paid', 'shipped', 'completed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status} ({getStatusCount(status)})
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                    #{transaction.id}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900">{transaction.auctionTitle}</div>
                    <div className="text-gray-500 text-xs">Auction #{transaction.auctionId}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900">{transaction.buyerUsername}</div>
                    <div className="text-gray-500 text-xs">{transaction.buyerEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${transaction.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(transaction.paymentStatus)}`}>
                      {transaction.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {transaction.paymentStatus === 'Paid' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openShippingForm(transaction)}
                          variant="outline"
                          size="sm"
                        >
                          Add Shipping
                        </Button>
                        <Button
                          onClick={() => handleMarkAsShipped(transaction.id)}
                          size="sm"
                        >
                          Mark Shipped
                        </Button>
                      </div>
                    )}
                    {transaction.paymentStatus === 'Shipped' && (
                      <div className="text-gray-500 text-xs">
                        <div className="font-semibold text-blue-600 mb-1">📦 Shipped</div>
                        {transaction.trackingNumber && (
                          <div>Tracking: {transaction.trackingNumber}</div>
                        )}
                      </div>
                    )}
                    {transaction.paymentStatus === 'Completed' && (
                      <div className="text-green-600 font-semibold text-sm">✓ Completed</div>
                    )}
                    {transaction.paymentStatus === 'Pending' && (
                      <div className="text-yellow-600 text-sm">Waiting for payment...</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-5xl mb-4">📦</div>
              <p className="text-gray-500 text-lg">No transactions found for this filter.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Shipping Form Modal */}
      {showShippingForm && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Update Shipping Info</CardTitle>
              <p className="text-sm text-gray-600">
                Transaction #{selectedTransaction.id} - {selectedTransaction.auctionTitle}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="shippingAddress">Shipping Address</Label>
                <Textarea
                  id="shippingAddress"
                  value={shippingForm.shippingAddress}
                  onChange={(e) => setShippingForm({...shippingForm, shippingAddress: e.target.value})}
                  placeholder="123 Main St, City, State 12345"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="trackingNumber">Tracking Number</Label>
                <Input
                  id="trackingNumber"
                  type="text"
                  value={shippingForm.trackingNumber}
                  onChange={(e) => setShippingForm({...shippingForm, trackingNumber: e.target.value})}
                  placeholder="1Z999AA10123456784"
                />
              </div>

              <div>
                <Label htmlFor="shippingMethod">Shipping Method</Label>
                <Input
                  id="shippingMethod"
                  type="text"
                  value={shippingForm.shippingMethod}
                  onChange={(e) => setShippingForm({...shippingForm, shippingMethod: e.target.value})}
                  placeholder="USPS Priority Mail"
                />
              </div>

              <div>
                <Label htmlFor="adminNotes">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  value={shippingForm.adminNotes}
                  onChange={(e) => setShippingForm({...shippingForm, adminNotes: e.target.value})}
                  placeholder="Packed securely, insured for $500"
                  rows={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleUpdateShipping(selectedTransaction.id)}
                  className="flex-1"
                >
                  Save Shipping Info
                </Button>
                <Button
                  onClick={() => {
                    setShowShippingForm(false);
                    setSelectedTransaction(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
