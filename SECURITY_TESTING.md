# Testing Guide: Office-Only Security Implementation

## Prerequisites
- Development server running (`npm run dev`)
- Admin account credentials
- Non-admin (employee) account credentials
- Current IP address: `192.168.18.6` (already configured)

---

## Test Scenario 1: Enable Lockdown Mode

### Steps:
1. **Login as Admin**
   - Go to `http://localhost:3000/login`
   - Login with admin credentials
   - ✅ Should succeed (admins bypass all restrictions)

2. **Navigate to Settings**
   - Click "Settings" in sidebar
   - Go to "Security" tab
   - Scroll to "Workplace Security (Office-Only)" section

3. **Verify Current Status**
   - Should see gray banner: "Lockdown Disabled"
   - IP field should show: `192.168.18.6`
   - Office hours should show: `09:00` - `21:00`

4. **Enable Lockdown**
   - Toggle "Enable Lockdown Mode" switch to ON
   - Click "Save Security Policy" button
   - ✅ Should see green "Security Deployed" confirmation
   - ✅ Banner should change to red gradient "🔒 Lockdown Active"

5. **Verify Sidebar Badge**
   - Check sidebar (bottom section)
   - ✅ Should see red security badge: "🔒 Lockdown Active"
   - ✅ Should have animated pulsing red dot

---

## Test Scenario 2: Test IP Restriction (Simulated)

Since you're on the authorized IP (`192.168.18.6`), we'll test by temporarily changing the authorized IP:

### Steps:
1. **Change Authorized IP** (while logged in as admin)
   - In Settings > Security
   - Change Office IP to: `192.168.1.100` (different IP)
   - Keep Lockdown Mode: ON
   - Click "Save Security Policy"

2. **Logout**
   - Click "Sign Out" in sidebar

3. **Attempt Login as Employee**
   - Go to `http://localhost:3000/login`
   - Login with employee (non-admin) credentials
   - ✅ **Expected**: Login should be **blocked**
   - ✅ **Expected**: Error message: "Access restricted to office network only"

4. **Check Browser Console** (F12)
   - ✅ Should see server log: `[Security] Login blocked for IP: 192.168.18.6`

5. **Restore Configuration** (Login as admin from another tab or use incognito)
   - Change Office IP back to: `192.168.18.6`
   - Save settings
   - ✅ Employee should now be able to login

---

## Test Scenario 3: Test Time Restriction

### Steps:
1. **Set Restrictive Office Hours** (as admin)
   - In Settings > Security
   - Set Office Hours Start: `23:00` (11 PM)
   - Set Office Hours End: `23:30` (11:30 PM)
   - Keep Lockdown Mode: ON
   - Keep Office IP: `192.168.18.6`
   - Click "Save Security Policy"

2. **Logout**
   - Sign out from admin account

3. **Attempt Login as Employee**
   - Current time is ~10:23 AM (Karachi Time ~8:23 PM)
   - Login with employee credentials
   - ✅ **Expected**: Login should be **blocked**
   - ✅ **Expected**: Error message: "Access restricted to office hours only"

4. **Check Browser Console**
   - ✅ Should see: `[Security] Login blocked outside hours: 20:23`

5. **Restore Normal Hours** (Login as admin)
   - Set Office Hours Start: `09:00`
   - Set Office Hours End: `21:00`
   - Save settings

---

## Test Scenario 4: Test Middleware Protection

This tests if an already-logged-in user gets blocked when lockdown is enabled:

### Steps:
1. **Disable Lockdown** (as admin)
   - Toggle Lockdown Mode: OFF
   - Save settings

2. **Login as Employee** (in a different browser/incognito)
   - Login should succeed
   - Navigate to dashboard

3. **Enable Lockdown with Different IP** (as admin in original window)
   - Change Office IP to: `192.168.1.100`
   - Toggle Lockdown Mode: ON
   - Save settings

4. **Navigate in Employee Session**
   - In employee window, try to navigate to any page (e.g., `/leads`)
   - ✅ **Expected**: Should be redirected to `/unauthorized?reason=ip`
   - ✅ **Expected**: Page shows "Network Access Denied"
   - ✅ **Expected**: Network Access card highlighted in purple with ⚠️

---

## Test Scenario 5: Test Unauthorized Page Variations

### IP Violation:
1. Trigger IP block (as shown in Scenario 2 or 4)
2. ✅ URL should be: `/unauthorized?reason=ip`
3. ✅ Title: "Network Access Denied"
4. ✅ Network Access card: Purple background
5. ✅ Message: "⚠️ Your network is not authorized"

### Time Violation:
1. Trigger time block (as shown in Scenario 3)
2. ✅ URL should be: `/unauthorized?reason=time`
3. ✅ Title: "Outside Office Hours"
4. ✅ Office Hours card: Blue background
5. ✅ Message: "⚠️ Access outside scheduled hours"

---

## Test Scenario 6: Admin Bypass

### Steps:
1. **Enable Lockdown with Impossible Settings**
   - Office IP: `192.168.1.100` (not your IP)
   - Office Hours: `23:00` - `23:30` (not current time)
   - Lockdown Mode: ON
   - Save settings

2. **Logout and Login as Admin**
   - ✅ **Expected**: Admin login should **succeed**
   - ✅ **Expected**: Full access to all pages

3. **Logout and Login as Employee**
   - ✅ **Expected**: Employee login should be **blocked**

---

## Test Scenario 7: Status Indicator Updates

### Steps:
1. **Open Two Browser Windows**
   - Window 1: Admin logged in, on Settings page
   - Window 2: Admin logged in, on Dashboard

2. **Toggle Lockdown in Window 1**
   - Enable Lockdown → Save
   - ✅ Settings page banner turns red immediately

3. **Refresh Window 2**
   - ✅ Sidebar badge should show "🔒 Lockdown Active"

4. **Disable Lockdown in Window 1**
   - Disable Lockdown → Save
   - ✅ Settings page banner turns gray immediately

5. **Refresh Window 2**
   - ✅ Sidebar badge should show "Disabled"

---

## Quick Test Checklist

- [ ] Lockdown mode can be enabled/disabled
- [ ] Status indicators update correctly (Settings banner + Sidebar badge)
- [ ] IP restriction blocks non-admin login
- [ ] Time restriction blocks non-admin login
- [ ] Middleware redirects already-logged-in users
- [ ] Unauthorized page shows correct violation reason
- [ ] Admin bypass works (admins always have access)
- [ ] Localhost bypass works (127.0.0.1 always allowed)
- [ ] Settings persist after page refresh

---

## Troubleshooting

### Employee Can Login Despite Lockdown
- Check if user has ADMIN role (admins bypass all restrictions)
- Verify lockdown toggle is ON and saved
- Check browser console for security logs
- Verify IP address matches exactly (no trailing spaces)

### Status Indicators Not Updating
- Hard refresh the page (Ctrl+F5)
- Check browser console for API errors
- Verify `/api/settings/branding` endpoint is accessible

### Time Restriction Not Working
- Remember: Times are in Karachi Time (UTC+5)
- Current server time: Check console logs for `[Security] Login blocked outside hours: HH:mm`
- Verify time format is `HH:mm` (24-hour format)

### Unauthorized Page Shows Wrong Reason
- Check URL query parameter: `?reason=ip` or `?reason=time`
- Verify middleware and login endpoint are returning correct `reason` field
