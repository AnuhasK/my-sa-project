# Phase 1 Manual Testing Checklist
## User Management & Authentication

**Date:** October 20, 2025  
**Tester:** Manual Testing Session  
**Environment:** Development (Backend: http://localhost:5021, Frontend: Running)

---

## 🧪 Test Cases

### 1. User Registration
**Test ID:** AUTH-001  
**Priority:** High  
**Prerequisites:** None

**Steps:**
1. Navigate to the application home page
2. Click "Sign Up" or navigate to registration page
3. Fill in registration form:
   - Username: `testuser`
   - Email: `testuser@test.com`
   - Password: `Test123!`
   - Confirm Password: `Test123!`
4. Click "Register" button

**Expected Results:**
- ✅ User is registered successfully
- ✅ JWT token is stored in localStorage
- ✅ User is automatically logged in
- ✅ Redirect to home page or dashboard
- ✅ Header shows "Dashboard" and "Profile" buttons

**Status:** [ ] Pass [ ] Fail [ ] Not Tested

**Notes:**
_____________________________________________________________________

---

### 2. User Login
**Test ID:** AUTH-002  
**Priority:** High  
**Prerequisites:** User account exists

**Steps:**
1. Navigate to login page
2. Enter credentials:
   - Email: `testuser@test.com`
   - Password: `Test123!`
3. Click "Login" button

**Expected Results:**
- ✅ User is logged in successfully
- ✅ JWT token is stored in localStorage
- ✅ Redirect to dashboard
- ✅ Header shows logged-in state

**Status:** [ ] Pass [ ] Fail [ ] Not Tested

**Notes:**
_____________________________________________________________________

---

### 3. View User Dashboard
**Test ID:** DASH-001  
**Priority:** High  
**Prerequisites:** User is logged in

**Steps:**
1. Click "Dashboard" button in header
2. Observe the dashboard page

**Expected Results:**
- ✅ User profile information displays (username, email, member since)
- ✅ Statistics cards show real data:
  - Total Bids count
  - Won Auctions count
  - Total Spent amount
  - Saved Items (watchlist) count
- ✅ Active Bids section loads (may be empty)
- ✅ Won Auctions section loads (may be empty)
- ✅ Watchlist section loads
- ✅ No mock/hardcoded data visible

**Status:** [ ] Pass [ ] Fail [ ] Not Tested

**API Endpoints Used:**
- GET /api/auth/me
- GET /api/users/stats
- GET /api/users/active-bids
- GET /api/users/won-auctions
- GET /api/watchlist

**Notes:**
_____________________________________________________________________

---

### 4. View User Profile
**Test ID:** PROFILE-001  
**Priority:** High  
**Prerequisites:** User is logged in

**Steps:**
1. Click "Profile" button in header
2. Observe the profile page

**Expected Results:**
- ✅ Profile page loads successfully
- ✅ User avatar displays (or default avatar)
- ✅ Username displays correctly
- ✅ Email displays correctly
- ✅ Role displays (User or Admin)
- ✅ Member Since date displays
- ✅ Phone Number field shows (empty or populated)
- ✅ Address field shows (empty or populated)
- ✅ Bio field shows (empty or populated)
- ✅ "Edit Profile" button visible
- ✅ "Change Password" button visible

**Status:** [ ] Pass [ ] Fail [ ] Not Tested

**Notes:**
_____________________________________________________________________

---

### 5. Edit User Profile
**Test ID:** PROFILE-002  
**Priority:** High  
**Prerequisites:** User is logged in, on profile page

**Steps:**
1. Click "Edit Profile" button
2. Update fields:
   - Phone Number: `+1-555-0123`
   - Address: `123 Main St, Test City, TC 12345`
   - Bio: `This is a test bio for Phase 1 testing`
3. Click "Save Changes" button

**Expected Results:**
- ✅ Form enters edit mode
- ✅ Fields become editable
- ✅ "Save Changes" and "Cancel" buttons appear
- ✅ After save, success toast notification appears
- ✅ Profile updates persist (refresh page to verify)
- ✅ Form exits edit mode

**Status:** [ ] Pass [ ] Fail [ ] Not Tested

**API Endpoint:** PUT /api/auth/profile

**Notes:**
_____________________________________________________________________

---

### 6. Change Password
**Test ID:** PROFILE-003  
**Priority:** High  
**Prerequisites:** User is logged in, on profile page

**Steps:**
1. Click "Change Password" button
2. Password dialog appears
3. Fill in fields:
   - Current Password: `Test123!`
   - New Password: `NewTest456!`
   - Confirm New Password: `NewTest456!`
4. Click "Change Password" button in dialog

**Expected Results:**
- ✅ Password change dialog opens
- ✅ Three password fields are visible
- ✅ After submission, success toast appears
- ✅ Dialog closes automatically
- ✅ User can login with new password (test in next session)

**Status:** [ ] Pass [ ] Fail [ ] Not Tested

**API Endpoint:** POST /api/auth/change-password

**Notes:**
_____________________________________________________________________

---

### 7. Upload Profile Image
**Test ID:** PROFILE-004  
**Priority:** Medium  
**Prerequisites:** User is logged in, on profile page

**Steps:**
1. Click the upload icon on the avatar
2. Select an image file (JPG, PNG)
3. Wait for upload to complete

**Expected Results:**
- ✅ File picker opens
- ✅ Image uploads successfully
- ✅ Success toast notification appears
- ✅ Profile image updates immediately
- ✅ New image persists after refresh

**Status:** [ ] Pass [ ] Fail [ ] Not Tested

**API Endpoints:**
- POST /api/images/upload
- POST /api/auth/profile-image

**Notes:**
_____________________________________________________________________

---

### 8. User Logout
**Test ID:** AUTH-003  
**Priority:** High  
**Prerequisites:** User is logged in

**Steps:**
1. Click "Logout" button in header
2. Observe the result

**Expected Results:**
- ✅ User is logged out
- ✅ JWT token removed from localStorage
- ✅ Redirect to home page
- ✅ Header shows "Login" and "Sign Up" buttons
- ✅ Cannot access dashboard or profile pages

**Status:** [ ] Pass [ ] Fail [ ] Not Tested

**API Endpoint:** POST /api/auth/logout

**Notes:**
_____________________________________________________________________

---

### 9. Protected Routes
**Test ID:** AUTH-004  
**Priority:** High  
**Prerequisites:** User is logged out

**Steps:**
1. Try to navigate directly to `/dashboard` (by changing currentPage state)
2. Try to navigate to `/profile`

**Expected Results:**
- ✅ Redirected to login page
- ✅ Cannot access protected pages without authentication

**Status:** [ ] Pass [ ] Fail [ ] Not Tested

**Notes:**
_____________________________________________________________________

---

### 10. User Statistics Accuracy
**Test ID:** STATS-001  
**Priority:** High  
**Prerequisites:** User has some activity (bids, auctions, watchlist)

**Steps:**
1. Login as user with existing activity
2. Navigate to Dashboard
3. Verify statistics match database

**Expected Results:**
- ✅ Total Bids count is accurate
- ✅ Won Auctions count is accurate
- ✅ Total Spent is accurate
- ✅ Watchlist count is accurate
- ✅ No errors in console

**Status:** [ ] Pass [ ] Fail [ ] Not Tested

**Notes:**
_____________________________________________________________________

---

## 🔍 Edge Cases & Error Handling

### 11. Invalid Login Credentials
**Test ID:** ERROR-001  
**Priority:** Medium

**Steps:**
1. Try to login with wrong password
2. Try to login with non-existent email

**Expected Results:**
- ✅ Error message displays
- ✅ No console errors
- ✅ User not logged in

**Status:** [ ] Pass [ ] Fail [ ] Not Tested

---

### 12. Duplicate Email Registration
**Test ID:** ERROR-002  
**Priority:** Medium

**Steps:**
1. Try to register with existing email

**Expected Results:**
- ✅ Error message: "Email already registered"
- ✅ User not registered

**Status:** [ ] Pass [ ] Fail [ ] Not Tested

---

### 13. Weak Password
**Test ID:** ERROR-003  
**Priority:** Medium

**Steps:**
1. Try to register/change password with weak password (e.g., "123")

**Expected Results:**
- ✅ Validation error displays
- ✅ Password not accepted

**Status:** [ ] Pass [ ] Fail [ ] Not Tested

---

### 14. Password Mismatch
**Test ID:** ERROR-004  
**Priority:** Medium

**Steps:**
1. In change password dialog, enter different new passwords

**Expected Results:**
- ✅ Error message: "Passwords do not match"
- ✅ Password not changed

**Status:** [ ] Pass [ ] Fail [ ] Not Tested

---

### 15. Wrong Current Password
**Test ID:** ERROR-005  
**Priority:** Medium

**Steps:**
1. Try to change password with incorrect current password

**Expected Results:**
- ✅ Error message: "Current password is incorrect"
- ✅ Password not changed

**Status:** [ ] Pass [ ] Fail [ ] Not Tested

---

## 📱 Responsive Design Tests

### 16. Mobile View - Dashboard
**Test ID:** RESPONSIVE-001  
**Priority:** Medium

**Steps:**
1. Resize browser to mobile width (< 768px)
2. Navigate to dashboard

**Expected Results:**
- ✅ Layout adjusts properly
- ✅ Stats cards stack vertically
- ✅ Mobile menu works
- ✅ All content readable

**Status:** [ ] Pass [ ] Fail [ ] Not Tested

---

### 17. Mobile View - Profile
**Test ID:** RESPONSIVE-002  
**Priority:** Medium

**Steps:**
1. Resize browser to mobile width
2. Navigate to profile page

**Expected Results:**
- ✅ Form fields stack properly
- ✅ Buttons are accessible
- ✅ Avatar upload works

**Status:** [ ] Pass [ ] Fail [ ] Not Tested

---

## 🚀 Performance Tests

### 18. Page Load Times
**Test ID:** PERF-001  
**Priority:** Low

**Steps:**
1. Measure dashboard load time
2. Measure profile page load time

**Expected Results:**
- ✅ Dashboard loads in < 2 seconds
- ✅ Profile page loads in < 1 second
- ✅ API calls return in reasonable time

**Status:** [ ] Pass [ ] Fail [ ] Not Tested

---

## 📊 Test Summary

**Total Test Cases:** 18  
**Tests Passed:** ___ / 18  
**Tests Failed:** ___ / 18  
**Tests Not Executed:** ___ / 18  

**Critical Issues Found:**
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

**Minor Issues Found:**
1. _____________________________________________
2. _____________________________________________
3. _____________________________________________

**Overall Phase 1 Status:** [ ] Ready for Phase 2 [ ] Needs Fixes [ ] Major Issues

---

## 📝 Testing Notes

### Browser Tested:
- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari

### Screen Sizes Tested:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

### API Endpoints Verified:
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] GET /api/auth/me
- [ ] PUT /api/auth/profile
- [ ] POST /api/auth/change-password
- [ ] POST /api/auth/profile-image
- [ ] POST /api/auth/logout
- [ ] GET /api/users/stats
- [ ] GET /api/users/active-bids
- [ ] GET /api/users/won-auctions

---

## 🎯 Next Steps After Testing

1. **If All Tests Pass:**
   - Mark Phase 1 as 100% complete
   - Update PHASE1_COMPLETION_SUMMARY.md
   - Commit all changes to git
   - Begin Phase 2 planning

2. **If Tests Fail:**
   - Document all issues
   - Prioritize fixes (critical first)
   - Fix issues and retest
   - Update documentation

3. **Ready for Phase 2:**
   - Review Phase 2 requirements
   - Set up Phase 2 todo list
   - Begin Auction Core Features implementation

---

**Tester Signature:** _________________________  
**Date Completed:** _________________________
