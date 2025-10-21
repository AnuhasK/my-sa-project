# Stripe Payment Integration - Setup Guide

## Complete Payment Workflow

### Process Flow:

1. **Auction Closes** (Admin action)
   - Backend creates Transaction with `PaymentStatus.Pending`
   - Winner receives "Auction Won" notification
   - Admin/Seller receives "Auction Sold" notification

2. **Winner Views Won Items**
   - Goes to Dashboard → Won Items tab
   - Sees auction with "Payment Required" status
   - Clicks "Pay Now with Stripe" button

3. **Stripe Checkout**
   - Frontend calls `/api/payments/create-checkout-session/{transactionId}`
   - Backend creates Stripe Checkout Session
   - User redirected to Stripe-hosted payment page
   - Secure payment processing by Stripe

4. **Payment Completion**
   - On success → Redirected to `/payment-success` page
   - On cancel → Redirected to `/payment-cancelled` page
   - Stripe sends webhook to `/api/payments/webhook`
   - Backend updates transaction status to `Paid`
   - Both buyer and admin receive "Payment Confirmed" notifications

5. **Order Fulfillment**
   - Admin prepares item for shipping
   - Admin updates transaction status to `Shipped`
   - Buyer receives "Item Shipped" notification
   - Once delivered, status becomes `Completed`

---

## Backend Setup

### 1. Install Stripe Package
```bash
cd backend/AuctionHouse.Api
dotnet add package Stripe.net
```

### 2. Get Stripe API Keys

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Create a Stripe account (use test mode for development)
3. Navigate to **Developers** → **API Keys**
4. Copy:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

### 3. Configure appsettings.json

Replace the placeholder keys in `backend/AuctionHouse.Api/appsettings.json`:

```json
{
  "Stripe": {
    "PublishableKey": "pk_test_YOUR_ACTUAL_KEY_HERE",
    "SecretKey": "sk_test_YOUR_ACTUAL_KEY_HERE",
    "WebhookSecret": "whsec_YOUR_WEBHOOK_SECRET_HERE"
  },
  "AppSettings": {
    "BaseUrl": "http://localhost:5021",
    "FrontendUrl": "http://localhost:5173"
  }
}
```

### 4. Setup Stripe Webhook (for local testing)

Install Stripe CLI:
```bash
# Windows (using Chocolatey)
choco install stripe-cli

# Or download from: https://github.com/stripe/stripe-cli/releases
```

Login to Stripe:
```bash
stripe login
```

Forward webhooks to your local server:
```bash
stripe listen --forward-to http://localhost:5021/api/payments/webhook
```

**Copy the webhook signing secret** (starts with `whsec_`) and add it to `appsettings.json`

### 5. Build and Run Backend
```bash
cd backend/AuctionHouse.Api
dotnet build
dotnet run
```

---

## Frontend Setup

### Files Added/Modified:

#### 1. **API Service** (`frontend/src/services/api.js`)
Added:
```javascript
async createCheckoutSession(transactionId, token) {
  const response = await fetch(`${API_BASE_URL}/payments/create-checkout-session/${transactionId}`, {
    method: 'POST',
    headers: this.getAuthHeaders(token),
  });
  return this.handleResponse(response);
}
```

#### 2. **Payment Success Page** (`frontend/src/pages/user/PaymentSuccess.tsx`)
- Displays success message
- Links back to dashboard
- Auto-detects Stripe session ID

#### 3. **Payment Cancelled Page** (`frontend/src/pages/user/PaymentCancelled.tsx`)
- Shows cancellation message
- Option to retry payment
- Returns to dashboard

#### 4. **UserDashboard Updated** (`frontend/src/pages/user/UserDashboard.tsx`)
- Added `handlePayNow()` function
- "Pay Now with Stripe" button on pending transactions
- Redirects to Stripe Checkout

#### 5. **App Routing** (`frontend/src/App.tsx`)
- Added `/payment-success` route
- Added `/payment-cancelled` route

---

## Testing the Payment Flow

### Test with Stripe Test Cards:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 9995` | Payment declined |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |

Use any future expiry date (e.g., 12/34) and any 3-digit CVC

### Complete Test Scenario:

1. **Start Backend**:
   ```bash
   cd backend/AuctionHouse.Api
   dotnet run
   ```

2. **Start Stripe Webhook Listener** (in separate terminal):
   ```bash
   stripe listen --forward-to http://localhost:5021/api/payments/webhook
   ```

3. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

4. **Test Flow**:
   - Login as a user who won an auction
   - Go to Dashboard → Won Items tab
   - Click "Pay Now with Stripe"
   - Use test card: `4242 4242 4242 4242`
   - Enter any future date and CVC
   - Complete payment
   - Verify redirect to success page
   - Check database: Transaction status should be "Paid"
   - Check notifications: Both buyer and admin should have payment confirmation

---

## Database Changes

### Transaction Statuses:
- `Pending` - Awaiting payment
- `Paid` - Payment received
- `Shipped` - Item shipped to buyer
- `Completed` - Order completed
- `Cancelled` - Order cancelled

### Notifications Created:
1. **On Auction Close**:
   - Winner: "Congratulations! You won the auction"
   - Seller/Admin: "Your auction sold successfully"

2. **On Payment Success**:
   - Buyer: "Payment Confirmed! Your item will be shipped soon"
   - Admin: "Payment Received. Prepare item for shipping"

---

## API Endpoints Added

### POST `/api/payments/create-checkout-session/{transactionId}`
- **Auth**: Required (Buyer only)
- **Description**: Creates Stripe Checkout Session
- **Returns**: `{ checkoutUrl: "https://checkout.stripe.com/..." }`

### POST `/api/payments/webhook`
- **Auth**: None (Stripe signature verification)
- **Description**: Handles Stripe webhook events
- **Events**: `checkout.session.completed`

---

## Admin Shipping Process

After payment is received, admin should:

1. **View Transaction**:
   - Go to Admin Dashboard → Transactions
   - Find the paid transaction

2. **Prepare Item**:
   - Package the auction item
   - Arrange shipping

3. **Update Status to "Shipped"**:
   - (This feature needs to be added to admin panel)
   - Updates transaction status
   - Sends "Item Shipped" notification to buyer

4. **Mark as Completed**:
   - After buyer receives item
   - Final status: `Completed`

---

## Security Considerations

### ✅ Implemented:
- JWT authentication on payment endpoint
- Buyer can only pay for their own transactions
- Stripe signature verification on webhooks
- HTTPS recommended for production
- Secure handling of sensitive data

### 🔒 Production Checklist:
- [ ] Use production Stripe keys
- [ ] Enable HTTPS/SSL
- [ ] Set webhook secret in environment variables
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Add fraud detection
- [ ] Implement refund functionality

---

## Troubleshooting

### Issue: "Webhook signature verification failed"
**Solution**: Make sure Stripe CLI is running and webhook secret matches appsettings.json

### Issue: "Payment session not created"
**Solution**: Check Stripe secret key is correct and has required permissions

### Issue: "Transaction not found"
**Solution**: Ensure auction was properly closed by admin and transaction was created

### Issue: "Redirected to payment-cancelled"
**Solution**: This is normal user behavior - they can retry from dashboard

---

## Next Steps

### Recommended Enhancements:

1. **Admin Shipping Management**:
   - Add "Mark as Shipped" button in admin panel
   - Tracking number input
   - Carrier selection

2. **Email Notifications**:
   - Payment confirmation emails
   - Shipping notifications
   - Receipt generation

3. **Refund System**:
   - Admin can issue refunds
   - Automatic transaction reversal
   - Refund notifications

4. **Payment History**:
   - Detailed payment logs
   - Download receipts
   - Payment method management

5. **Seller Payouts**:
   - Calculate seller earnings
   - Platform fee deduction
   - Automated payouts via Stripe Connect

---

## Questions?

- **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe Test Mode**: Use for development - no real charges
- **Stripe Dashboard**: Monitor all test payments
- **Webhook Logs**: View in Stripe Dashboard → Developers → Webhooks

