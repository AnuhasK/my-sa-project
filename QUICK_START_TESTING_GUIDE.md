# 🚀 Quick Start Testing Guide - Phase 1

## Current Status
✅ **Backend:** Running on http://localhost:5021  
✅ **Frontend:** Running  
✅ **Database:** Migrations applied  
✅ **Routes:** UserProfile added to navigation  

---

## 🎯 Quick Test Flow (5 Minutes)

### Test 1: Register New User (2 min)
1. Open your browser to the frontend URL
2. Click "Sign Up" or "Register"
3. Fill in:
   - Username: `testuser1`
   - Email: `testuser1@test.com`
   - Password: `Test123!`
4. Click Register
5. **✅ Check:** You should be automatically logged in and see Dashboard/Profile buttons in header

### Test 2: View Dashboard (1 min)
1. Click "Dashboard" in header
2. **✅ Check:** See your username, email, and stats (all should be 0 for new user)
3. **✅ Check:** No console errors

### Test 3: View & Edit Profile (2 min)
1. Click "Profile" in header
2. **✅ Check:** See your profile page with avatar, username, email
3. Click "Edit Profile"
4. Add:
   - Phone: `555-0123`
   - Address: `123 Test St`
   - Bio: `Testing Phase 1`
5. Click "Save Changes"
6. **✅ Check:** See success toast notification
7. **✅ Check:** Changes are saved (refresh page to verify)

### Test 4: Logout (30 sec)
1. Click "Logout" in header
2. **✅ Check:** Redirected to home page
3. **✅ Check:** Header shows "Login" and "Sign Up" buttons

---

## 🔍 Detailed Testing (Use Checklist)

For comprehensive testing, follow:
**`PHASE1_MANUAL_TESTING_CHECKLIST.md`**

This includes:
- All 18 test cases
- Error handling tests  
- Responsive design tests
- Performance tests

---

## 📊 Expected API Calls

When you test, you should see these API calls in the Network tab:

**On Login/Register:**
- POST `/api/auth/login` or `/api/auth/register`
- GET `/api/auth/me` (to load user profile)

**On Dashboard:**
- GET `/api/auth/me`
- GET `/api/users/stats`
- GET `/api/users/active-bids`
- GET `/api/users/won-auctions`
- GET `/api/watchlist`

**On Profile Page:**
- GET `/api/auth/me`

**On Profile Update:**
- PUT `/api/auth/profile`

**On Password Change:**
- POST `/api/auth/change-password`

**On Logout:**
- POST `/api/auth/logout`

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot read property of null"
**Solution:** Make sure you're logged in before accessing Dashboard or Profile

### Issue: "Network Error" or "Failed to fetch"
**Solution:** 
1. Check backend is running on port 5021
2. Check CORS settings in backend
3. Check API_BASE_URL in frontend (.env or api.js)

### Issue: Stats show as "..." or 0
**Solution:** This is normal for new users. To see real stats:
1. Login as `admin@local` / `Admin123!` (seeded user)
2. Or create some test data (auctions, bids)

### Issue: Profile image upload doesn't work
**Solution:**
1. Check `/api/images/upload` endpoint is working
2. Check file size limits
3. Check supported formats (JPG, PNG)

---

## 📸 What Success Looks Like

### Dashboard
- Shows your username and email
- Shows 4 stat cards (Total Bids, Won Auctions, Total Spent, Saved Items)
- All numbers should be 0 for new user (not "..." or undefined)

### Profile Page
- Shows avatar (or default)
- Shows username, email, role
- Shows "Member since" date
- All fields are editable in edit mode
- "Edit Profile" and "Change Password" buttons visible

### After Profile Update
- Green toast notification appears
- Changes persist after page refresh
- No console errors

---

## 🎉 Phase 1 Complete When:

- [x] Routes added to navigation
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Dashboard shows real data (even if 0s)
- [ ] Profile page loads without errors
- [ ] Can edit profile and see changes
- [ ] Can change password
- [ ] Logout works correctly
- [ ] No console errors
- [ ] All 18 test cases pass (see checklist)

---

## 📝 Testing Notes Template

**Browser:** _______________  
**Date:** _______________  
**Time:** _______________  

**Quick Tests:**
- [ ] Register: Pass / Fail
- [ ] Dashboard: Pass / Fail  
- [ ] Profile: Pass / Fail
- [ ] Edit Profile: Pass / Fail
- [ ] Logout: Pass / Fail

**Issues Found:**
1. _______________________________
2. _______________________________
3. _______________________________

**Console Errors:**
_______________________________
_______________________________

**Network Errors:**
_______________________________
_______________________________

---

## 🚀 Next Steps

**If All Tests Pass:**
1. Update PHASE1_COMPLETION_SUMMARY.md status to 100%
2. Commit changes to git
3. Move to Phase 2 planning

**If Tests Fail:**
1. Document issues in checklist
2. Create bug fix todo list
3. Fix and retest

---

## 💡 Pro Tips

1. **Use Browser DevTools:**
   - Network tab: See API calls
   - Console tab: Check for errors
   - Application tab: Check localStorage for JWT token

2. **Test with Multiple Users:**
   - Register 2-3 test users
   - Test interactions between users

3. **Test Admin Account:**
   - Login as `admin@local` / `Admin123!`
   - Should redirect to admin dashboard

4. **Clear Data Between Tests:**
   - Clear localStorage: `localStorage.clear()`
   - Or use incognito/private browsing

---

**Ready to Start Testing?** Open your browser and follow the Quick Test Flow above! 🎯
