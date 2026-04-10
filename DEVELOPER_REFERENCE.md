# PropertyFlow App - Developer Reference Guide

## State Management

### Main State Object
```javascript
state = {
  currentUser: null,           // Supabase user object
  userRole: null,              // 'agent' or 'admin'
  userEmail: null,             // Current user's email
  loginRole: 'agent',          // Role being attempted for login
  currentView: 'marketplace',  // Current visible section
  activeMarketTab: 'all',      // Market listing tab filter
  search: '',                  // Search query
  type: 'all',                 // Property type filter
  deal: 'all',                 // Deal type filter (Sale/Rent)
  properties: [],              // All property listings
  listings: [],                // Agent listings (for agent portal)
  removalRequests: [],         // Pending removal requests
  agents: [],                  // List of all agents
  deals: [],                   // All deals in system
  escrowMilestones: [],        // Escrow tracking milestones
  agentVerifications: [],       // Agent verification requests
  riskAlerts: [],              // Risk alerts for admin
  logs: [],                    // System audit logs
  inquiries: []                // Client inquiries
};
```

## Authentication Functions

### `async handleSignIn()`
Signs in user with email/password. Sets userRole based on loginRole state.

```javascript
// Sets: state.currentUser, state.userRole, state.userEmail
// Persists session to localStorage
// Calls: updateAuthUi(), loadRemovalRequests()
// Auto-navigates to portal after success
```

**Usage**:
```javascript
// Triggered by click on #signInBtn
// Email/password from #loginEmail, #loginPassword
```

### `async handleLogout()`
Clears session and returns to public view.

```javascript
// Clears: state.currentUser, state.userRole, state.userEmail
// Removes: localStorage.propertyflow_session
// Calls: updateAuthUi(), navigateToView('marketplace')
// Shows: "Signed out successfully" toast
```

### `restoreSessionFromStorage()`
Restores session from localStorage if available and not expired.

```javascript
// Returns: boolean (session valid and restored)
// Restores: state.currentUser, state.userRole, state.userEmail
// Checks: 24-hour expiration window
// Called: At app startup in initApp()
```

### `setLoginRole(role)`
Sets the role for upcoming login attempt. Updates UI to indicate selected role.

```javascript
// Parameters: role = 'agent' | 'admin'
// Updates: state.loginRole
// Updates: UI styling of role selector buttons
// Updates: Login modal email placeholder
```

### `updateAuthUi()`
Shows/hides UI elements based on authentication state and user role.

```javascript
// Shows if authenticated:
//   - #userMenuBtn (with username)
//   - #agentPortalBtn (if role === 'agent')
//   - #adminPortalBtn (if role === 'admin')
// Hides if not authenticated:
//   - #userMenuBtn
//   - #agentPortalBtn
//   - #adminPortalBtn
//   - #userMenu
// Shows if not authenticated:
//   - #openLoginBtn
// Updates agent dashboard sidebar with user info
```

## Navigation Functions

### `navigateToView(viewName)`
Switches between main views: marketplace, agent, admin.

```javascript
// Parameters: viewName = 'marketplace' | 'agent' | 'admin'
// Hides: All other views
// Shows: Selected view
// Requires: User authenticated with correct role for portals
// Scrolls: To top smoothly
// Updates: state.currentView
// Updates: document.body.dataset.view
```

### `showView(viewId)` (Legacy)
Original view switching function. Kept for compatibility.

```javascript
// Parameters: viewId = element ID
// Scrolls to view with animation
// Updates: Active classes
```

### `showAgentTab(tab)`
Switches between agent portal tabs.

```javascript
// Parameters: tab = 'overview' | 'listings' | 'inquiries' | 'deals' | 'commissions' | 'escrow' | 'protection'
// Hides: All other agent tabs
// Shows: Selected tab
// Updates: Navigation menu active state
```

### `showAdminTab(tab)`
Switches between admin portal tabs.

```javascript
// Parameters: tab = 'admin-overview' | 'admin-agents' | 'admin-approvals' | 'admin-deals' | 'admin-commissions' | 'admin-escrow' | 'admin-alerts'
// Hides: All other admin tabs
// Shows: Selected tab
// Updates: Navigation menu active state
```

## UI Interaction Functions

### `toggleUserMenu()`
Toggles visibility of user menu dropdown.

```javascript
// Element: #userMenu
// Toggles: display: 'none' | 'block'
// Called: On #userMenuBtn click
// Auto-closes: When clicking outside
```

### `openModal(id)`
Opens modal overlay with animation.

```javascript
// Parameters: id = modal element ID
// Adds: 'active' class to trigger display and animation
// Examples: 'loginModal', 'addListingModal', 'removalRequestModal'
```

### `closeModal(id)`
Closes modal overlay with animation.

```javascript
// Parameters: id = modal element ID
// Removes: 'active' class
// Clears: Form fields (optional, via closeModal handlers)
```

## Rendering Functions (Admin)

### `renderAdminActivityLog()`
Populates admin activity log with recent system events.

```javascript
// Target: #adminActivityLog
// Source: state.logs (first 6 items)
// Shows: Time-stamped activity with color coding by type
// Colors: Red (alerts) | Green (commission) | Yellow (other)
```

### `renderAdminDealsTable()`
Populates admin deals monitoring table.

```javascript
// Target: #adminDealsTable tbody
// Columns: Deal ID | Property | Amount | Fee | Status | Risk Level
// Risk Levels: Low (green) | Medium (yellow) | High (red)
// Updates: On each relevant action
```

### `renderAdminCommissionsTable()`
Shows commission collection by agent.

```javascript
// Target: #adminCommissionsTable tbody
// Groups: Deals by agent
// Counts: Completed deals per agent
// Calculates: 2% platform fee per agent
// Shows: Payment status
```

### `renderAdminEscrowTable()`
Shows escrow milestone and fund status.

```javascript
// Target: #adminEscrowTable tbody
// Columns: Deal | Escrow Stage | Funds Held | Completion
// Updates: As deals progress through pipeline
// Shows: Stage completion status
```

## Event Listeners

### Navigation
- `.nav-link` click → `navigateToView()`
- `#openLoginBtn` click → `setLoginRole()` → `openModal('loginModal')`
- `#userMenuBtn` click → `toggleUserMenu()`

### Forms
- `#signInBtn` click → `handleSignIn()`
- `#loginPassword` Enter key → `handleSignIn()`
- `#searchInput` input → `renderProperties()`
- `#typeFilter` change → `renderProperties()`
- `#dealFilter` change → `renderProperties()`

### Modals
- Modal click outside → `closeModal()`
- `[data-close]` button → `closeModal()`

## Data Persistence

### LocalStorage Keys
```javascript
localStorage.propertyflow_session // User session (expires 24h)
```

### Session Structure
```javascript
{
  user: {
    id: string,
    email: string,
    ...supabaseUserData
  },
  role: 'agent' | 'admin',
  email: string,
  timestamp: number (milliseconds)
}
```

## Constants

```javascript
const DEFAULT_AGENT = {
  name: 'John Doe',
  agency: 'PropertyFlow Select',
  initials: 'JD'
};

const COMMISSION_RATE = 0.02; // 2%

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});
```

## CSS Classes

### State Classes
- `.active` - Element is active/selected
- `.shown` - Element is displayed
- `.hidden` - Element is hidden
- `.signed-in` - User is authenticated
- `.show` - Toast/notification visible

### Status Classes
- `.status-badge.active` - Success/active status (green)
- `.status-badge.pending` - Pending/in-progress (yellow)
- `.status-badge.alert` - Error/alert status (red)

### Responsive Classes
- `.properties-grid` - Auto-fills 290px+ columns
- `.form-row` - 2-column grid on desktop
- `.stats-grid` - 4-column grid on desktop
- `.dashboard` - flex layout with sidebar

## Error Handling

### Toast Notifications
```javascript
showToast(message, type);
// type: 'success' | 'error' | 'warning' | 'info'
// Auto-dismisses after 2.8 seconds
```

## Debugging

### Console Logging
- `state` - View current app state
- `localStorage.propertyflow_session` - View current session
- Search console for "ERROR" for system errors

### Common Issues
1. Portal not showing after login
   - Check `state.userRole` in console
   - Verify `state.currentUser` exists
   - Check `updateAuthUi()` is called

2. Session not persisting
   - Check `localStorage.propertyflow_session` exists
   - Verify session timestamp is recent
   - Check localStorage quota

3. View not switching
   - Verify `navigateToView()` is called
   - Check element IDs match
   - Monitor `state.currentView` in console

## Integration Points

### Supabase API
- `api.signIn(email, password)` - Authentication
- `api.signOut()` - Logout
- `api.getCurrentUser()` - Session restoration
- `api.getProperties()` - Load property data
- `api.createProperty()` - Add new property
- `api.createRemovalRequest()` - Submit removal
- `api.getRemovalRequests()` - Load requests
- `api.updateRemovalRequest()` - Approve/reject removal

### Frontend API
- `window.propertyFlowApi` - Supabase wrapper methods
- Defined in: `lib/browser-api.js`
- Requires: `vendor/supabase.js`

---

**Last Updated**: April 10, 2026
**Framework**: Vanilla JavaScript (ES6+)
**DOM Library**: None (native querySelector)
**Database**: Supabase PostgreSQL
