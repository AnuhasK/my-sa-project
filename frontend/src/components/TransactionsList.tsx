import { useState, useEffect } from 'react';
import { DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Transaction {
  id: number;
  auctionId: number;
  auctionTitle: string;
  otherPartyUsername: string;
  amount: number;
  paymentStatus: string;
  createdAt: string;
}

interface TransactionsListProps {
  type: 'buyer' | 'seller';
}

export function TransactionsList({ type }: TransactionsListProps) {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [type]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const data = type === 'buyer' 
        ? await api.getBuyerTransactions(token)
        : await api.getSellerTransactions(token);
      
      setTransactions(data);
    } catch (err) {
      setError('Failed to load transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (transactionId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      await api.updatePaymentStatus(transactionId, newStatus, token);
      await fetchTransactions(); // Refresh the list
    } catch (err) {
      console.error('Error updating payment status:', err);
      alert('Failed to update payment status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Pending': { variant: 'outline', icon: Clock, color: 'text-yellow-600' },
      'Paid': { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
      'Failed': { variant: 'destructive', icon: XCircle, color: 'text-red-600' },
      'Refunded': { variant: 'secondary', icon: AlertCircle, color: 'text-gray-600' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Pending'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-gray-500">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
          <p className="text-gray-600">
            {type === 'buyer' 
              ? 'Transactions will appear here when you win auctions'
              : 'Transactions will appear here when your auctions are sold'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <Card key={transaction.id}>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {transaction.auctionTitle}
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">
                      {type === 'buyer' ? 'Seller' : 'Buyer'}:
                    </span> {transaction.otherPartyUsername}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span> {formatDate(transaction.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium">Transaction ID:</span> #{transaction.id}
                  </p>
                </div>
              </div>

              <div className="text-right space-y-3">
                <div className="text-2xl font-bold text-gray-900">
                  ${transaction.amount.toFixed(2)}
                </div>
                
                <div>{getStatusBadge(transaction.paymentStatus)}</div>

                {type === 'buyer' && transaction.paymentStatus === 'Pending' && (
                  <div className="space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdatePaymentStatus(transaction.id, 'Paid')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark as Paid
                    </Button>
                  </div>
                )}

                {type === 'seller' && transaction.paymentStatus === 'Paid' && (
                  <div className="text-xs text-gray-500">
                    Payment received
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
