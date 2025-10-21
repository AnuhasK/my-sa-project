# Stripe Payment Integration Setup Guide

## Overview
This guide will help you set up Stripe payment integration for the Auction House application.

## Process Flow

### 1. **Auction Closes**
- Admin closes auction via Admin Dashboard → Auctions page
- Backend creates:
  - Transaction record with `PaymentStatus.Pending`
  - "Auction Won" notification to winner
  - Notification to admin/seller

### 2. **Winner Makes Payment**
- Winner receives notification
- Goes to Dashboard → "Won Items" tab
- Clicks "Pay Now" button
- Redirected to Stripe Checkout page

### 3. **Payment Processing**
- User completes payment on Stripe
- Stripe webhook notifies our backend
- Backend updates transaction to `PaymentStatus.Paid`
- Creates notifications for buyer and admin

### 4. **Order Fulfillment**
- Admin prepares item for shipping
- Admin updates status to "Shipped" via Transaction Management
- Buyer tracks order in "Won Items" tab
- Status eventually becomes "Completed"

---

## Setup Instructions

### Step 1: Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click "Sign up" and create an account
3. Verify your email address

### Step 2: Get API Keys

1. Log in to Stripe Dashboard
2. Click "Developers" in the left sidebar
3. Click "API keys"
4. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key"

### Step 3: Configure Backend

Update `backend/AuctionHouse.Api/appsettings.json`:

```json
{
  "Stripe": {
    "PublishableKey": "pk_test_YOUR_ACTUAL_KEY_HERE",
    "SecretKey": "sk_test_YOUR_ACTUAL_KEY_HERE",
    "WebhookSecret": "whsec_YOUR_WEBHOOK_SECRET_HERE"
  }
}
```

### Step 4: Setup Stripe CLI (for Webhook Testing)

#### Windows:
```powershell
# Download Stripe CLI
# Go to: https://github.com/stripe/stripe-cli/releases/latest
# Download: stripe_X.X.X_windows_x86_64.zip
# Extract and add to PATH or run from the folder

# Login to Stripe
stripe login

# Forward webhooks to localhost
stripe listen --forward-to http://localhost:5021/api/payments/webhook
```

This will output a webhook signing secret like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

Copy this `whsec_xxxxxxxxxxxxx` value and update it in `appsettings.json` under `Stripe:WebhookSecret`.

#### macOS/Linux:
```bash
# Install via Homebrew
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks
stripe listen --forward-to http://localhost:5021/api/payments/webhook
```

### Step 5: Test the Payment Flow

1. **Start the Backend**
   ```powershell
   cd backend/AuctionHouse.Api
   dotnet run
   ```

2. **Start Stripe CLI Listener** (in another terminal)
   ```powershell
   stripe listen --forward-to http://localhost:5021/api/payments/webhook
   ```

3. **Start the Frontend**
   ```powershell
   cd frontend
   npm run dev
   ```

4. **Test Payment**
   - Log in as admin
   - Close an auction that has bids
   - Log in as the winning bidder
   - Go to Dashboard → "Won Items" tab
   - Click "Pay Now"
   - Use Stripe test card: `4242 4242 4242 4242`
   - Use any future expiry date (e.g., 12/34)
   - Use any 3-digit CVC (e.g., 123)
   - Complete payment

5. **Verify Webhook**
   - Check Stripe CLI terminal - you should see webhook events
   - Check backend logs - should show payment confirmation
   - Refresh dashboard - transaction status should update to "Paid"

---

## Stripe Test Cards

Use these cards to test different scenarios:

| Card Number | Description |
|------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | Requires authentication |
| `4000 0000 0000 9995` | Insufficient funds |

For all test cards:
- Use any future expiry date (e.g., 12/34)
- Use any 3-digit CVC (e.g., 123)
- Use any ZIP code (e.g., 12345)

---

## Production Deployment

### 1. Switch to Live Mode

1. In Stripe Dashboard, toggle to "Live mode"
2. Get your live API keys from "Developers" → "API keys"
3. Update production configuration with live keys

### 2. Setup Production Webhooks

1. Go to Stripe Dashboard → "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Enter your production URL: `https://yourdomain.com/api/payments/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
5. Copy the webhook signing secret
6. Update production config with this secret

### 3. Security Checklist

✅ Never commit API keys to version control  
✅ Use environment variables or secrets management  
✅ Use HTTPS in production  
✅ Validate webhook signatures  
✅ Log all payment events  
✅ Handle webhook retries properly  
✅ Test error scenarios  

---

## Transaction Status Flow

```
Pending → (User pays) → Paid → (Admin ships) → Shipped → (User confirms) → Completed
                         ↓
                    (Cancel/Refund) → Cancelled
```

### Status Descriptions:

- **Pending**: Transaction created, awaiting payment
- **Paid**: Payment received, preparing for shipment
- **Shipped**: Item shipped to buyer
- **Completed**: Order delivered and completed
- **Cancelled**: Order cancelled or refunded

---

## Admin Transaction Management

Admins can update transaction status via:
1. Admin Dashboard → "Transactions" page
2. Find the transaction
3. Update status using dropdown
4. Buyer automatically receives notification

---

## Troubleshooting

### Webhook not working
- Ensure Stripe CLI is running
- Check webhook secret matches in appsettings.json
- Verify backend URL is correct
- Check firewall isn't blocking connections

### Payment not completing
- Check Stripe Dashboard → "Logs" for errors
- Verify test card number is correct
- Check browser console for JavaScript errors
- Ensure backend is running and accessible

### Transaction status not updating
- Verify webhook is being received (check Stripe CLI output)
- Check backend logs for errors
- Ensure database connection is working
- Verify transaction ID in webhook metadata

---

## Support

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Testing**: https://stripe.com/docs/testing
- **Webhook Testing**: https://stripe.com/docs/webhooks/test

---

## Configuration Summary

**Backend** (`appsettings.json`):
```json
{
  "Stripe": {
    "PublishableKey": "pk_test_...",
    "SecretKey": "sk_test_...",
    "WebhookSecret": "whsec_..."
  },
  "AppSettings": {
    "BaseUrl": "http://localhost:5021",
    "FrontendUrl": "http://localhost:5173"
  }
}
```

**Endpoint Created**:
- `POST /api/payments/create-checkout-session/{transactionId}` - Create payment session
- `POST /api/payments/webhook` - Handle Stripe webhooks

**Frontend Integration**:
- UserDashboard → Won Items tab → "Pay Now" button
- Payment success page at `/payment-success`
- Payment cancelled page at `/payment-cancelled`
