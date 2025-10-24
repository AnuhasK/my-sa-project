# Securing API Keys - Setup Instructions

## ✅ What I've Done

I've secured your API keys by:

1. **Created `appsettings.Secrets.json`** - Contains your actual API keys (NOT committed to Git)
2. **Updated `appsettings.json`** - Removed real secrets, now has placeholders
3. **Created `.env.example`** - Template showing what environment variables are needed
4. **Updated `.gitignore`** - Prevents sensitive files from being committed
5. **Updated `Program.cs`** - Loads secrets from the secure file

## 🚀 How to Use This Setup

### For Local Development:
- Your secrets are in `backend/AuctionHouse.Api/appsettings.Secrets.json`
- This file is automatically loaded and won't be committed to GitHub
- The app will work exactly as before

### For New Team Members:
1. Copy `.env.example` to create their own `appsettings.Secrets.json`
2. Replace placeholder values with real API keys
3. Never commit `appsettings.Secrets.json` to Git

### For Production/Deployment:
- Use environment variables or Azure Key Vault
- Set the configuration values in your hosting platform (Azure, AWS, etc.)

## ⚠️ IMPORTANT: Next Steps

1. **Rotate your Stripe keys** - Your current keys are exposed in Git history:
   - Go to https://dashboard.stripe.com/test/apikeys
   - Delete the old keys and generate new ones
   - Update `appsettings.Secrets.json` with new keys

2. **Generate a new JWT secret**:
   - Use a strong random string (at least 32 characters)
   - Update in `appsettings.Secrets.json`

3. **Before pushing to GitHub**:
   ```powershell
   git status
   ```
   Make sure `appsettings.Secrets.json` is NOT listed (should be ignored)

## 📁 File Structure

```
backend/AuctionHouse.Api/
├── appsettings.json              ← Safe to commit (placeholders only)
├── appsettings.Secrets.json      ← NOT committed (your real keys)
├── .env.example                  ← Safe to commit (template)
└── Program.cs                    ← Updated to load secrets
```

## 🔒 What's Protected

- Database connection string
- JWT secret key
- Stripe publishable key
- Stripe secret key
- Stripe webhook secret
