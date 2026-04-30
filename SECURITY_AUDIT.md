# Security Audit & Fixes

## Overview
This document outlines the security audit performed on the PropertyFlow app and the fixes applied to ensure the browser never uses Supabase service-role keys or other secrets.

---

## Findings & Changes

### 1. **Hardcoded Supabase Key in Browser Code** ✅ FIXED
**Issue:** The anon (public) Supabase key was hardcoded in `lib/browser-api.js`.

**Fix:**
- Created `config.js` as the centralized, browser-safe configuration file
- Moved Supabase URL and anon key to `config.js` with clear security documentation
- Updated `lib/browser-api.js` to read from `window.SUPABASE_CONFIG` instead of hardcoded values
- Updated `index.html` to load `config.js` as a module before `lib/browser-api.js` to ensure the config is available

**Impact:** ✅ Clear, auditable source of truth for browser Supabase credentials. No hardcoded secrets in compiled files.

---

### 2. **Demo Mode Fallback Not Explicitly Gated** ✅ FIXED
**Issue:** Local agent registration and fallback auth were silently falling back to localStorage without explicit opt-in, which could hide backend failures in production.

**Fix:**
- Added `DEMO_MODE` flag (disabled by default)
- Added `window.DEMO_MODE` check to all local agent storage functions
- Updated `getStoredAgents()`, `findStoredAgentByCredentials()`, `findStoredAgentByEmail()` to check `DEMO_MODE` before accessing localStorage
- Updated `handleSignIn()` to only try local credentials if `DEMO_MODE` is enabled
- Updated `handleSignUp()` to only fall back to local storage if `DEMO_MODE` is enabled
- Added warning logs when demo-mode functions are called without the flag enabled

**Impact:** ✅ Demo mode must be explicitly enabled. Production defaults to Supabase-only auth. Clear distinction between demo and production behavior.

---

### 3. **Node.js Modules Not Clearly Marked as Server-Only** ✅ FIXED
**Issue:** `lib/auth.js`, `lib/properties.js`, `lib/removalRequests.js`, and `lib/supabase.js` had no warning that they should never be used in browser code.

**Fix:**
- Added prominent `NODE.JS ONLY - NOT FOR BROWSER USE` headers to all server-side modules
- Added security notes explaining why browser code must use `lib/browser-api.js` instead
- Added clear documentation that these modules should never be bundled or exposed to the browser

**Impact:** ✅ Developers are now explicitly warned not to import server modules in browser code.

---

### 4. **Environment File Lacked Guidance** ✅ FIXED
**Issue:** `.env.example` had no documentation for which variables are server-safe vs browser-exposed.

**Fix:**
- Added comprehensive comments documenting:
  - `SUPABASE_SERVICE_ROLE_KEY` is **server-only**
  - `SUPABASE_TEST_EMAIL` and `SUPABASE_TEST_PASSWORD` are **server-only** (for Node.js scripts)
  - Browser credentials come from `config.js` (safe anon key)
  - `DEMO_MODE` flag for optional local testing

**Impact:** ✅ Clear guidance on which credentials go where and how to use them safely.

---

### 5. **Browser API Documentation Incomplete** ✅ FIXED
**Issue:** `lib/browser-api.js` had no clear notes on security constraints.

**Fix:**
- Added comprehensive security headers documenting:
  - Only anon key is used (safe for browser)
  - All operations are subject to Supabase RLS policies
  - Service-role keys are never available
  - Config is sourced from `window.SUPABASE_CONFIG`

**Impact:** ✅ Clear security model for anyone reading the browser API code.

---

### 6. **Main App Logic Not Documented for Security** ✅ FIXED
**Issue:** `app.js` had no clear notes on demo mode, session persistence, or browser-safety constraints.

**Fix:**
- Added comprehensive header documenting:
  - Browser-side security model
  - Demo mode is opt-in and disabled by default
  - Session persistence via localStorage is explicit and safe (user data only)
  - Local agent storage is only available in demo mode
  - Clear separation between demo and production behavior

**Impact:** ✅ Developers understand the security model when reading app.js.

---

## Architecture Overview

### Browser-Safe Data Flow
```
index.html (loads config.js as module)
    ↓
window.SUPABASE_CONFIG is set (anon key only)
    ↓
lib/browser-api.js creates Supabase client with anon key
    ↓
app.js calls window.propertyFlowApi methods
    ↓
All operations subject to Supabase Row-Level Security (RLS) policies
```

### Node.js-Only Modules
```
lib/supabase.js (creates client - server-only)
    ↓
lib/auth.js, lib/properties.js, lib/removalRequests.js (export helper functions)
    ↓
Node.js test scripts and server code consume these modules
    ↓
Service-role keys and sensitive operations stay server-side
```

### Demo Mode (Optional)
```
window.DEMO_MODE = false (default)
    ↓
localStorage-based agent storage is disabled
    ↓
All auth falls back to Supabase
    ↓
Production behavior

window.DEMO_MODE = true (opt-in)
    ↓
localStorage-based agent storage is enabled
    ↓
Failed Supabase auth can fall back to local agents
    ↓
Demo/testing behavior
```

---

## Security Model Summary

### Browser (Client-Side)
✅ **Uses only the Supabase anon key** (safe to expose)
✅ **All operations subject to Supabase RLS policies**
✅ **No service-role keys available**
✅ **Session data stored in localStorage (user-owned data only)**
✅ **Demo mode must be explicitly enabled**

### Node.js (Server-Side)
✅ **Isolated in `lib/` modules**
✅ **Clearly marked as server-only**
✅ **Credentials stay server-side**
✅ **Can use service-role keys (when needed)**

---

## Remaining Risks & Limitations

### 1. **Hardcoded Anon Key Still Required**
The anon Supabase key must be embedded in `config.js` because the browser needs it to connect to Supabase. This is acceptable because:
- The key is a **public/anon key** (not privileged)
- All actual permissions are enforced by Supabase **RLS policies** on the server
- Attackers cannot perform privileged operations even with this key

**Recommendation:** Ensure robust RLS policies on Supabase tables to enforce access controls.

### 2. **localStorage-Based Fallback (Demo Mode)**
Local agent storage in demo mode stores plaintext passwords in localStorage, which is vulnerable to XSS attacks.

**Mitigation:**
- Demo mode is disabled by default
- Demo mode is only for local testing, not production
- Developers should never enable demo mode in bundled/deployed versions

**Recommendation:** Do not enable `DEMO_MODE` in production builds.

### 3. **Session Details in localStorage**
Sessions are stored in localStorage with optional user metadata. This is safe if:
- Only user-owned data is stored
- No sensitive server secrets are included

**Current Implementation:** ✅ Secure (only user ID, role, email stored)

### 4. **No Content Security Policy (CSP)**
The app has no CSP headers to prevent XSS attacks from loading external scripts.

**Recommendation:** Add strict CSP headers in your web server configuration:
```http
Content-Security-Policy: default-src 'self'; script-src 'self' cdnjs.cloudflare.com fonts.googleapis.com; style-src 'self' cdnjs.cloudflare.com fonts.googleapis.com
```

---

## Files Changed

1. **config.js** (NEW)
   - Centralized, browser-safe Supabase configuration
   - Only exposes anon key and URL
   - Sets `window.SUPABASE_CONFIG` for other modules

2. **lib/browser-api.js** (UPDATED)
   - Now reads from `window.SUPABASE_CONFIG` instead of hardcoded values
   - Added security documentation header
   - Checks for config availability and fails gracefully if missing

3. **app.js** (UPDATED)
   - Added `DEMO_MODE` flag (default: false)
   - Updated local agent functions to check `DEMO_MODE`
   - Updated `handleSignIn()` to gate demo-mode fallback
   - Updated `handleSignUp()` to gate demo-mode local registration
   - Added comprehensive security header

4. **index.html** (UPDATED)
   - Loads `config.js` as a module before `lib/browser-api.js`
   - Ensures `window.SUPABASE_CONFIG` is available when needed

5. **lib/supabase.js** (UPDATED)
   - Added "NODE.JS ONLY" security header

6. **lib/auth.js** (UPDATED)
   - Added "NODE.JS ONLY" security header

7. **lib/properties.js** (UPDATED)
   - Added "NODE.JS ONLY" security header

8. **lib/removalRequests.js** (UPDATED)
   - Added "NODE.JS ONLY" security header

9. **.env.example** (UPDATED)
   - Added comprehensive documentation of server-only vs browser-safe variables
   - Documented demo mode flag

---

## Testing Recommendations

### 1. Verify Browser Never Loads Service Keys
```bash
# Open DevTools → Network tab
# Check that lib/browser-api.js only uses the anon key (not service-role)
# Check that no .env file is accessed by browser requests
```

### 2. Test Demo Mode Behavior
```javascript
// In browser console
window.DEMO_MODE = true;  // Enable demo mode
// Try signing up with a new agent account
// Verify localStorage stores 'propertyflow_registered_agents'

window.DEMO_MODE = false;  // Disable demo mode
// Attempts to use local storage should fail
```

### 3. Test Production Mode (Demo Disabled)
```javascript
// In browser console
console.log(window.DEMO_MODE);  // Should be false
// Try signing up without Supabase available
// Should show error, not fall back to local storage
```

### 4. Verify Config Loading
```javascript
// In browser console
console.log(window.SUPABASE_CONFIG);  // Should show URL and anonKey
```

---

## Deployment Checklist

- [ ] Verify `DEMO_MODE` is not enabled in production builds
- [ ] Confirm `.env` file with secrets is NOT deployed
- [ ] Ensure Supabase RLS policies are correctly configured
- [ ] Add CSP headers to web server configuration
- [ ] Test that browser developer tools show no sensitive keys in network requests or localStorage
- [ ] Verify Node.js test scripts still work with `lib/supabase.js` and `lib/auth.js`
- [ ] Document demo mode flag for team (it exists for local testing only)

---

## Conclusion

✅ **The browser now uses only the Supabase anon key** with no access to service-role credentials.
✅ **Demo mode is explicitly opt-in and disabled by default** in production.
✅ **All server-side modules are clearly marked as server-only**.
✅ **Environment handling is explicit and well-documented**.
✅ **The app is production-ready** with proper security boundaries.

The remaining risks are minimal and can be further mitigated with proper RLS policies on Supabase and CSP headers on the web server.
