# Frontend Implementation Guide - Payment Flow

This guide provides ready-to-use code for implementing the admin transaction management and buyer delivery confirmation features.

---

## 🎯 Overview

**Backend Status**: ✅ Complete  
**Frontend Status**: 🚧 Needs Implementation

**APIs Ready to Use**:
- `PUT /api/transactions/{id}/shipping` - Update shipping info
- `PATCH /api/transactions/{id}/payment-status` - Update status (Shipped/Completed)
- `GET /api/transactions` - Get all transactions (existing)

---

## 📦 Part 1: Admin Transaction Management

### Step 1: Add API Methods to `frontend/src/services/api.js`

```javascript
// Add these methods to the api object

// Get all transactions (admin view)
async getAllTransactions(token) {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'GET',
    headers: this.getAuthHeaders(token),
  });
  return this.handleResponse(response);
},

// Update shipping information
async updateShippingInfo(transactionId, shippingData, token) {
  const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/shipping`, {
    method: 'PUT',
    headers: {
      ...this.getAuthHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(shippingData),
  });
  return this.handleResponse(response);
},

// Update transaction status (mark as Shipped or Completed)
async updateTransactionStatus(transactionId, status, token) {
  const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/payment-status`, {
    method: 'PATCH',
    headers: {
      ...this.getAuthHeaders(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paymentStatus: status }),
  });
  return this.handleResponse(response);
},
```

---

### Step 2: Create Admin Transaction Management Page

**File**: `frontend/src/pages/admin/TransactionManagement.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

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

interface ShippingFormData {
  shippingAddress: string;
  trackingNumber: string;
  shippingMethod: string;
  adminNotes: string;
}

export function TransactionManagement() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [shippingForm, setShippingForm] = useState<ShippingFormData>({
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
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
      alert('Failed to load transactions');
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
      loadTransactions(); // Refresh list
    } catch (error) {
      console.error('Error updating shipping:', error);
      alert('Failed to update shipping information');
    }
  };

  const handleMarkAsShipped = async (transactionId: number) => {
    if (!confirm('Mark this transaction as shipped?')) return;

    try {
      await api.updateTransactionStatus(transactionId, 'Shipped', token);
      alert('Transaction marked as shipped. Buyer has been notified.');
      loadTransactions(); // Refresh list
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
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      shipped: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="p-6">Loading transactions...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Transaction Management</h1>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        {['all', 'pending', 'paid', 'shipped', 'completed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {status} ({transactions.filter(t => 
              status === 'all' || t.paymentStatus.toLowerCase() === status
            ).length})
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Auction</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map(transaction => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">#{transaction.id}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="font-medium">{transaction.auctionTitle}</div>
                  <div className="text-gray-500 text-xs">Auction #{transaction.auctionId}</div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="font-medium">{transaction.buyerUsername}</div>
                  <div className="text-gray-500 text-xs">{transaction.buyerEmail}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                  ${transaction.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(transaction.paymentStatus)}`}>
                    {transaction.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(transaction.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {transaction.paymentStatus === 'Paid' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openShippingForm(transaction)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Add Shipping
                      </button>
                      <button
                        onClick={() => handleMarkAsShipped(transaction.id)}
                        className="text-green-600 hover:text-green-800"
                      >
                        Mark Shipped
                      </button>
                    </div>
                  )}
                  {transaction.paymentStatus === 'Shipped' && (
                    <div className="text-gray-500">
                      Tracking: {transaction.trackingNumber || 'N/A'}
                    </div>
                  )}
                  {transaction.paymentStatus === 'Completed' && (
                    <div className="text-green-600 font-semibold">✓ Completed</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No transactions found for this filter.
          </div>
        )}
      </div>

      {/* Shipping Form Modal */}
      {showShippingForm && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              Update Shipping Info - Transaction #{selectedTransaction.id}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Shipping Address</label>
                <textarea
                  value={shippingForm.shippingAddress}
                  onChange={(e) => setShippingForm({...shippingForm, shippingAddress: e.target.value})}
                  className="w-full border rounded-lg p-2"
                  rows={3}
                  placeholder="123 Main St, City, State 12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={shippingForm.trackingNumber}
                  onChange={(e) => setShippingForm({...shippingForm, trackingNumber: e.target.value})}
                  className="w-full border rounded-lg p-2"
                  placeholder="1Z999AA10123456784"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Shipping Method</label>
                <input
                  type="text"
                  value={shippingForm.shippingMethod}
                  onChange={(e) => setShippingForm({...shippingForm, shippingMethod: e.target.value})}
                  className="w-full border rounded-lg p-2"
                  placeholder="USPS Priority Mail"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Admin Notes</label>
                <textarea
                  value={shippingForm.adminNotes}
                  onChange={(e) => setShippingForm({...shippingForm, adminNotes: e.target.value})}
                  className="w-full border rounded-lg p-2"
                  rows={2}
                  placeholder="Packed securely, insured for $500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => handleUpdateShipping(selectedTransaction.id)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Save Shipping Info
              </button>
              <button
                onClick={() => {
                  setShowShippingForm(false);
                  setSelectedTransaction(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### Step 3: Add Route to Admin Navigation

**File**: `frontend/src/App.tsx` or your admin routing file

```typescript
// Add to admin routes
case 'transaction-management':
  return <TransactionManagement />;
```

**File**: `frontend/src/pages/admin/AdminDashboard.tsx` or navigation component

```typescript
// Add to admin navigation menu
<button onClick={() => setCurrentPage('transaction-management')}>
  <Package className="h-5 w-5" />
  <span>Transactions</span>
</button>
```

---

## 📦 Part 2: Buyer Delivery Confirmation

### Update UserDashboard Won Items Tab

**File**: `frontend/src/pages/user/UserDashboard.tsx`

Find the Won Items rendering section and update it:

```typescript
// Add this function inside the component
const handleMarkAsReceived = async (transactionId: number) => {
  if (!confirm('Confirm that you have received this item?')) {
    return;
  }

  try {
    await api.updateTransactionStatus(transactionId, 'Completed', token);
    alert('Thank you for confirming delivery!');
    // Refresh won auctions
    const wonData = await api.getWonAuctions(token);
    setWonAuctions(wonData);
  } catch (error) {
    console.error('Error marking as received:', error);
    alert('Failed to confirm delivery. Please try again.');
  }
};

// Update the rendering of won items
{wonAuctions.map((auction) => (
  <Card key={auction.id}>
    <CardContent className="p-4">
      {/* ... existing auction display code ... */}
      
      {/* Add shipping status display */}
      <div className="mt-4">
        {auction.paymentStatus === 'Pending' && (
          <button
            onClick={() => handlePayNow(auction.id)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Pay Now
          </button>
        )}

        {auction.paymentStatus === 'Paid' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 font-semibold">✓ Payment Confirmed</p>
            <p className="text-sm text-green-600">Waiting for shipment...</p>
          </div>
        )}

        {auction.paymentStatus === 'Shipped' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 font-semibold">📦 Item Shipped!</p>
            {auction.trackingNumber && (
              <p className="text-sm text-blue-600 mt-1">
                Tracking: <span className="font-mono">{auction.trackingNumber}</span>
              </p>
            )}
            <button
              onClick={() => handleMarkAsReceived(auction.id)}
              className="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Mark as Received
            </button>
          </div>
        )}

        {auction.paymentStatus === 'Completed' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-gray-800 font-semibold">✓ Order Completed</p>
            <p className="text-sm text-gray-600">Delivered successfully</p>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
))}
```

---

## 🎨 Optional Enhancements

### Add Status Timeline

```typescript
const StatusTimeline = ({ transaction }: { transaction: Transaction }) => {
  const steps = [
    { label: 'Order Placed', date: transaction.createdAt, completed: true },
    { label: 'Payment Received', date: transaction.paidDate, completed: !!transaction.paidDate },
    { label: 'Shipped', date: transaction.shippedDate, completed: !!transaction.shippedDate },
    { label: 'Delivered', date: transaction.completedDate, completed: !!transaction.completedDate },
  ];

  return (
    <div className="flex justify-between items-center">
      {steps.map((step, index) => (
        <div key={index} className="flex-1">
          <div className={`h-2 ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`} />
          <div className="mt-2 text-center">
            <p className="text-xs font-semibold">{step.label}</p>
            {step.date && (
              <p className="text-xs text-gray-500">
                {new Date(step.date).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
```

### Add Notification Toasts

```typescript
// Install react-hot-toast: npm install react-hot-toast

import toast from 'react-hot-toast';

// Replace alert() calls with:
toast.success('Shipping information updated successfully!');
toast.error('Failed to update shipping information');
toast.loading('Processing...');
```

---

## 📱 Mobile Responsive Considerations

```css
/* Add these Tailwind classes for mobile responsiveness */

/* For transaction table on mobile */
<div className="overflow-x-auto">
  <table className="min-w-full">
    {/* ... table content ... */}
  </table>
</div>

/* For shipping form modal on mobile */
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
  <div className="bg-white rounded-lg p-4 md:p-6 max-w-md w-full max-h-screen overflow-y-auto">
    {/* ... form content ... */}
  </div>
</div>

/* For status badges on mobile */
<span className="px-2 py-1 text-xs md:text-sm">
  {status}
</span>
```

---

## 🧪 Testing Checklist

### Admin Transaction Management:
- [ ] Can view all transactions
- [ ] Filter by status works (Pending, Paid, Shipped, Completed)
- [ ] Can open shipping form for Paid transactions
- [ ] Can save shipping information
- [ ] Can mark transaction as Shipped
- [ ] Buyer receives notification when marked as Shipped
- [ ] Tracking number appears in buyer's view

### Buyer Delivery Confirmation:
- [ ] Won Items tab shows payment status
- [ ] "Pay Now" button appears for Pending
- [ ] "Waiting for shipment" message for Paid
- [ ] Tracking number displays when Shipped
- [ ] "Mark as Received" button works
- [ ] Admin receives notification when marked as Completed
- [ ] Status updates to Completed in UI

---

## 🚀 Quick Start

1. **Add API methods** to `services/api.js`
2. **Create** `TransactionManagement.tsx` in `pages/admin/`
3. **Update** `UserDashboard.tsx` with delivery confirmation UI
4. **Add routes** to your router
5. **Test** with Stripe test payments

**Estimated Implementation Time**: 4-6 hours

---

## 📞 Need Help?

Refer to:
- `docs/PAYMENT_FLOW_IMPLEMENTATION_STATUS.md` - Full backend status
- `docs/QUICK_FIXES_IMPLEMENTATION.md` - Backend changes made
- `docs/STRIPE_SETUP.md` - Stripe configuration guide

All backend APIs are ready and tested! 🎉
