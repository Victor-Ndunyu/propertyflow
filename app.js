const api = window.propertyFlowApi || null;
const DEFAULT_AGENT = {
  name: 'John Doe',
  agency: 'PropertyFlow Select',
  initials: 'JD'
};
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1200&q=80';
const COMMISSION_RATE = 0.02;
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

const state = {
  currentUser: null,
  userRole: null, // 'agent' or 'admin'
  userEmail: null,
  loginRole: 'agent', // role being attempted for login
  currentView: 'marketplace', // 'marketplace', 'agent', 'admin'
  activeMarketTab: 'all',
  search: '',
  type: 'all',
  deal: 'all',
  properties: [
    {
      id: 1,
      title: 'Luxury Villa - Beverly Hills',
      price: '$1,200,000',
      priceValue: 1200000,
      type: 'Villa',
      dealType: 'Sale',
      location: 'Beverly Hills, CA',
      beds: 5,
      baths: 6,
      status: 'Featured',
      agent: 'Michael Chen',
      agency: 'Prestige Homes',
      initials: 'MC',
      verified: true,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 2,
      title: 'Modern Apartment with Skyline View',
      price: '$3,200/mo',
      priceValue: 3200,
      type: 'Apartment',
      dealType: 'Rent',
      location: 'Downtown, Nairobi',
      beds: 2,
      baths: 2,
      status: 'Hot',
      agent: 'Sarah Johnson',
      agency: 'Urban Nest',
      initials: 'SJ',
      verified: true,
      image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 3,
      title: 'Contemporary Family House',
      price: '$680,000',
      priceValue: 680000,
      type: 'House',
      dealType: 'Sale',
      location: 'Kilimani, Nairobi',
      beds: 4,
      baths: 3,
      status: 'New',
      agent: 'Amina Njeri',
      agency: 'BlueKey Realty',
      initials: 'AN',
      verified: true,
      image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 4,
      title: 'Premium Commercial Office Suite',
      price: '$8,500/mo',
      priceValue: 8500,
      type: 'Commercial',
      dealType: 'Rent',
      location: 'Westlands, Nairobi',
      beds: 0,
      baths: 2,
      status: 'Verified',
      agent: 'David Otieno',
      agency: 'Prime Commercials',
      initials: 'DO',
      verified: true,
      image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 5,
      title: 'Penthouse Suite Above the City',
      price: '$2,800,000',
      priceValue: 2800000,
      type: 'Apartment',
      dealType: 'Sale',
      location: 'Miami, FL',
      beds: 4,
      baths: 4,
      status: 'Featured',
      agent: 'Elena Torres',
      agency: 'Skyline Estates',
      initials: 'ET',
      verified: true,
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 6,
      title: 'Garden House with Private Courtyard',
      price: '$2,700/mo',
      priceValue: 2700,
      type: 'House',
      dealType: 'Rent',
      location: 'Karen, Nairobi',
      beds: 3,
      baths: 3,
      status: 'Featured',
      agent: DEFAULT_AGENT.name,
      agency: DEFAULT_AGENT.agency,
      initials: DEFAULT_AGENT.initials,
      verified: true,
      image: 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1200&q=80'
    }
  ],
  listings: [
    { property: 'Luxury Villa - Beverly Hills', price: '$1,200,000', status: 'Active', inquiries: 7, protection: 'Protected' },
    { property: 'Modern Apartment with Skyline View', price: '$720,000', status: 'Pending', inquiries: 4, protection: 'Protected' },
    { property: 'Penthouse Suite Above the City', price: '$2,800,000', status: 'Active', inquiries: 8, protection: 'Protected' },
    { property: 'Garden House with Private Courtyard', price: '$2,700/mo', status: 'Sold', inquiries: 12, protection: 'Locked' }
  ],
  removalRequests: [
    { agent: DEFAULT_AGENT.name, property: 'Luxury Villa - Miami', reason: 'Sold externally (violation flagged)', submitted: '2 hours ago', status: 'Pending Review' },
    { agent: 'Jane Smith', property: 'Apartment - NYC', reason: 'Owner decided to rent instead', submitted: '5 hours ago', status: 'Pending Review' },
    { agent: 'Amina Njeri', property: 'Family House - Karen', reason: 'Listing duplicate correction', submitted: 'Yesterday', status: 'Pending Review' }
  ],
  agents: [
    { name: DEFAULT_AGENT.name, listings: 12, deals: 4, trust: 98, status: 'Verified' },
    { name: 'Sarah Johnson', listings: 9, deals: 7, trust: 96, status: 'Verified' },
    { name: 'Amina Njeri', listings: 14, deals: 5, trust: 94, status: 'Verified' },
    { name: 'David Otieno', listings: 6, deals: 3, trust: 91, status: 'Review clear' }
  ],
  deals: [
    { id: '#DEAL-2024-001', property: 'Luxury Villa - Beverly Hills', buyer: 'Michael Chen', amount: '$1,200,000', amountValue: 1200000, fee: '$24,000', status: 'Negotiation', escrowStage: 'Inspection' },
    { id: '#DEAL-2024-002', property: 'Modern Apartment', buyer: 'Sarah Johnson', amount: '$720,000', amountValue: 720000, fee: '$14,400', status: 'Contract signed', escrowStage: 'Escrow setup' },
    { id: '#DEAL-2024-003', property: 'Penthouse Suite', buyer: 'Olivia Brown', amount: '$2,800,000', amountValue: 2800000, fee: '$56,000', status: 'Payment pending', escrowStage: 'Funds clearing' },
    { id: '#DEAL-2024-004', property: 'Garden House', buyer: 'Ahmed Ali', amount: '$2,700/mo', amountValue: 2700, fee: '$54', status: 'Completed', escrowStage: 'Settled' }
  ],
  escrowMilestones: [
    { id: 1, property: 'Luxury Villa - Beverly Hills', step: 'Initial deposit', status: 'Completed' },
    { id: 2, property: 'Modern Apartment', step: 'Title search', status: 'In progress' },
    { id: 3, property: 'Penthouse Suite', step: 'Escrow hold', status: 'Pending' }
  ],
  agentVerifications: [
    { id: 101, agent: DEFAULT_AGENT.name, status: 'Verified', submitted: '3 days ago', note: 'KYC and branding audit passed.' },
    { id: 102, agent: 'David Otieno', status: 'Review clear', submitted: '1 day ago', note: 'License pending renewal.' }
  ],
  riskAlerts: [
    {
      id: 1,
      time: 'Today',
      property: 'Modern Apartment with Skyline View',
      agent: 'Sarah Johnson',
      reason: 'Potential off-platform negotiation detected',
      severity: 'high'
    }
  ],
  logs: [
    { time: '10 mins ago', type: 'alerts', user: 'ALERT', content: 'Agent John Doe attempted to remove listing citing external sale - platform fee not paid. Property: Luxury Villa Miami | Value: $1.2M | Lost Fee: $24,000' },
    { time: '1 hour ago', type: 'commission', user: 'SUCCESS', content: 'Deal #1234 completed - commission of $18,000 processed. Agent: Sarah Johnson' },
    { time: '3 hours ago', type: 'circumvention', user: 'WATCH', content: 'Messaging patterns indicated possible external negotiation attempt on Modern Apartment.' },
    { time: 'Yesterday', type: 'commission', user: 'SUCCESS', content: 'New commission payout batch finalized for 4 completed deals.' },
    { time: 'Yesterday', type: 'alerts', user: 'INFO', content: 'Removal request queue reached 5 items. Admin review recommended.' }
  ],
  inquiries: [
    { time: 'Today', property: 'Luxury Villa - Beverly Hills', sender: 'Michael Chen', msg: 'Is the villa still available for a private viewing this weekend?' },
    { time: 'Today', property: 'Modern Apartment with Skyline View', sender: 'Grace W.', msg: 'Can I schedule a tour and get the lease terms?' },
    { time: 'Yesterday', property: 'Garden House with Private Courtyard', sender: 'Daniel K.', msg: 'What is included in the monthly rent?' }
  ]
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function showToast(message, type = 'success') {
  const toast = $('#toast');
  const text = $('#toastText');
  if (!toast || !text) return;

  const icon = toast.querySelector('i');
  text.textContent = message;
  toast.className = `toast ${type}`;

  if (icon) {
    icon.className =
      type === 'success' ? 'fa-solid fa-circle-check' :
      type === 'error' ? 'fa-solid fa-circle-xmark' :
      type === 'warning' ? 'fa-solid fa-triangle-exclamation' :
      'fa-solid fa-circle-info';
  }

  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function openModal(id) {
  const el = $('#' + id);
  if (el) el.classList.add('active');
}

function closeModal(id) {
  const el = $('#' + id);
  if (el) el.classList.remove('active');
}

// NEW VIEW MANAGEMENT FUNCTIONS
function navigateToView(viewName) {
  // Hide all views
  $$('.page-view').forEach(view => view.style.display = 'none');
  
  // Show the requested view
  const targetView = $('#' + (viewName === 'agent' ? 'agent-dashboard' : viewName === 'admin' ? 'admin-dashboard' : 'marketplace'));
  if (targetView) {
    targetView.style.display = 'block';
  }
  
  // Update current view state
  state.currentView = viewName;
  document.body.dataset.view = viewName;
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Update navigation
  $$('.nav-link').forEach(link => link.classList.remove('active'));
  if (viewName === 'marketplace') {
    document.querySelector('[data-nav="marketplace"]')?.classList.add('active');
  }
}

function setLoginRole(role) {
  state.loginRole = role;
  // Update role selector buttons styling
  const agentBtn = $('#loginRoleAgent');
  const adminBtn = $('#loginRoleAdmin');
  if (agentBtn && adminBtn) {
    if (role === 'agent') {
      agentBtn.style.background = 'rgba(37, 99, 235, 0.2)';
      agentBtn.style.borderColor = 'rgba(37, 99, 235, 0.4)';
      agentBtn.style.color = '#60a5fa';
      adminBtn.style.background = 'rgba(255,255,255,.08)';
      adminBtn.style.borderColor = 'rgba(255,255,255,.15)';
      adminBtn.style.color = 'var(--text)';
    } else {
      adminBtn.style.background = 'rgba(37, 99, 235, 0.2)';
      adminBtn.style.borderColor = 'rgba(37, 99, 235, 0.4)';
      adminBtn.style.color = '#60a5fa';
      agentBtn.style.background = 'rgba(255,255,255,.08)';
      agentBtn.style.borderColor = 'rgba(255,255,255,.15)';
      agentBtn.style.color = 'var(--text)';
    }
  }
  if ($('#loginEmail')) $('#loginEmail').placeholder = role === 'agent' ? 'agent@propertyflow.com' : 'admin@propertyflow.com';
}

function showView(viewId) {
  $$('.page-view').forEach((view) => view.classList.remove('active'));
  const target = $('#' + viewId);
  if (target) target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showAgentTab(tab) {
  $$('.agent-tab').forEach((el) => el.classList.remove('active'));
  const target = $('#agent-' + tab);
  if (target) target.classList.add('active');

  $$('.sidebar-menu a[data-agent-tab]').forEach((link) => link.classList.remove('active'));
  const activeLink = document.querySelector(`.sidebar-menu a[data-agent-tab="${tab}"]`);
  if (activeLink) activeLink.classList.add('active');
}

function showAdminTab(tab) {
  $$('.admin-tab').forEach((el) => el.classList.remove('active'));
  const target = $('#' + tab);
  if (target) target.classList.add('active');

  $$('.sidebar-menu a[data-admin-tab]').forEach((link) => link.classList.remove('active'));
  const activeLink = document.querySelector(`.sidebar-menu a[data-admin-tab="${tab}"]`);
  if (activeLink) activeLink.classList.add('active');
}

function inferInitials(value) {
  const parts = String(value || '').trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return DEFAULT_AGENT.initials;
  return parts.map((part) => part[0]).join('').toUpperCase();
}

function toTitleCase(value) {
  return String(value || '')
    .replace(/[_-]/g, ' ')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeDealType(value) {
  return String(value || 'sale').trim().toLowerCase() === 'rent' ? 'Rent' : 'Sale';
}

function normalizePropertyType(value) {
  const normalized = toTitleCase(value || 'House');
  return normalized || 'House';
}

function parsePriceValue(value) {
  const digits = String(value || '').replace(/[^0-9.]/g, '');
  if (!digits) return null;
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPrice(value, dealType) {
  if (value == null || value === '') return 'Price on request';

  if (typeof value === 'number') {
    const formatted = currencyFormatter.format(value);
    return dealType === 'Rent' ? `${formatted}/mo` : formatted;
  }

  const trimmed = String(value).trim();
  if (trimmed.startsWith('$')) {
    return trimmed;
  }

  const parsed = parsePriceValue(trimmed);
  if (parsed == null) return trimmed;

  const formatted = currencyFormatter.format(parsed);
  return /\/\s*mo/i.test(trimmed) || dealType === 'Rent' ? `${formatted}/mo` : formatted;
}

function buildListing(property) {
  return {
    property: property.title,
    price: property.price,
    status: 'Active',
    inquiries: 0,
    protection: 'Protected'
  };
}

function normalizeStatusToken(value) {
  return String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function normalizeRemovalStatus(value) {
  const token = normalizeStatusToken(value);
  if (token === 'approved') return 'Approved';
  if (token === 'rejected') return 'Rejected';
  return 'Pending Review';
}

function removalStatusClass(status) {
  const normalized = normalizeRemovalStatus(status);
  return normalized === 'Approved' ? 'active' : normalized === 'Rejected' ? 'alert' : 'pending';
}

function statusClass(status) {
  if (!status) return 'pending';
  const token = normalizeStatusToken(status);
  if (token === 'completed' || token === 'verified' || token === 'active') return 'active';
  if (token === 'negotiation' || token === 'pending' || token === 'in_progress' || token === 'payment_pending') return 'pending';
  if (token === 'rejected' || token === 'alert' || token === 'watch') return 'alert';
  return 'pending';
}

function isPropertyRemoved(property) {
  return normalizeStatusToken(property?.status) === 'removed';
}

function isPendingRemovalRequest(request) {
  return normalizeRemovalStatus(request?.status) === 'Pending Review';
}

function formatUserLabel(id, fallback = 'Agent') {
  if (!id) return fallback;
  return `${fallback} ${String(id).slice(0, 8)}`;
}

function formatRelativeTime(value) {
  if (!value) return 'Just now';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Just now';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

function findPropertyById(propertyId) {
  return state.properties.find((property) => String(property.id) === String(propertyId));
}

function findPropertyByTitle(title) {
  return state.properties.find((property) => property.title === title);
}

function removeListingByPropertyTitle(title) {
  state.listings = state.listings.filter((listing) => listing.property !== title);
  renderAgentListings();
}

function updateRemovalRequestBadge() {
  const badge = document.querySelector('[data-admin-tab="admin-approvals"] .badge');
  if (!badge) return;
  const pendingCount = state.removalRequests.filter(isPendingRemovalRequest).length;
  badge.textContent = String(pendingCount);
}

function normalizePropertyRecord(record) {
  const dealType = normalizeDealType(record.deal_type ?? record.dealType);
  const type = normalizePropertyType(record.property_type ?? record.type);
  const agent = record.agent_name || record.agent || DEFAULT_AGENT.name;
  const agency = record.agency_name || record.agency || DEFAULT_AGENT.agency;
  const priceValue = parsePriceValue(record.price ?? record.price_value ?? record.priceValue) ?? null;

  return {
    id: record.id ?? Date.now(),
    title: record.title || 'Untitled Property',
    price: formatPrice(record.price ?? record.priceValue ?? '', dealType),
    priceValue: priceValue,
    type,
    dealType,
    location: record.location || 'Location unavailable',
    beds: Number(record.bedrooms ?? record.beds ?? 0),
    baths: Number(record.bathrooms ?? record.baths ?? 0),
    status: record.status || 'New',
    agent,
    agency,
    initials: record.agent_initials || record.initials || inferInitials(agent),
    verified: record.verified !== false,
    image: record.image_url || record.image || FALLBACK_IMAGE,
    description: record.description || ''
  };
}

function normalizeRemovalRequest(record) {
  const propertyId = record.property_id ?? record.propertyId ?? null;
  const property = propertyId ? findPropertyById(propertyId) : null;
  const agentId = record.agent_id ?? record.agentId ?? null;

  return {
    id: record.id ?? `local-${Date.now()}`,
    agentId,
    propertyId,
    agent: property?.agent || record.agent || formatUserLabel(agentId, DEFAULT_AGENT.name),
    property: property?.title || record.property || (propertyId ? `Property #${propertyId}` : 'Unknown property'),
    reason: record.reason || '',
    submitted: record.submitted || formatRelativeTime(record.created_at ?? record.createdAt),
    status: normalizeRemovalStatus(record.status),
    createdAt: record.created_at ?? record.createdAt ?? new Date().toISOString(),
    reviewedAt: record.reviewed_at ?? record.reviewedAt ?? null,
    reviewedBy: record.reviewed_by ?? record.reviewedBy ?? null
  };
}

function normalizeDealRecord(record) {
  const amountValue = parsePriceValue(record.amount ?? record.amount_value ?? record.amountValue) ?? 0;
  const feeValue = Math.round(amountValue * COMMISSION_RATE);
  const fee = amountValue ? currencyFormatter.format(feeValue) : record.fee || '$0';
  const stage = record.escrow_stage || record.escrowStage || 'Setup';

  return {
    id: record.id ?? `#DEAL-${Date.now()}`,
    property: record.property || 'Unknown property',
    buyer: record.buyer || record.buyer_name || '-',
    amount: formatPrice(record.amount ?? record.amountValue ?? amountValue, record.dealType || 'Sale'),
    amountValue,
    fee,
    status: record.status || 'Negotiation',
    escrowStage: stage,
    agent: record.agent || record.agent_name || DEFAULT_AGENT.name
  };
}

function normalizeAgentVerification(record) {
  return {
    id: record.id ?? `verify-${Date.now()}`,
    agent: record.agent_name || record.agent || DEFAULT_AGENT.name,
    status: String(record.status || 'pending').toLowerCase() === 'verified' ? 'Verified' : String(record.status || 'pending').toLowerCase() === 'rejected' ? 'Review clear' : 'Pending verification',
    submitted: record.submitted_at || record.submittedAt || 'Unknown',
    note: record.note || record.reason || ''
  };
}

function normalizeRiskAlert(record) {
  return {
    id: record.id ?? `risk-${Date.now()}`,
    time: record.time || formatRelativeTime(record.created_at || record.createdAt),
    property: record.property || 'Unknown property',
    agent: record.agent || DEFAULT_AGENT.name,
    reason: record.reason || record.description || 'Risk event detected',
    severity: record.severity || 'medium'
  };
}

function syncAgentVerificationStatus() {
  if (!state.agentVerifications || !state.agentVerifications.length) return;
  const lookup = state.agentVerifications.reduce((acc, item) => {
    acc[item.agent] = item;
    return acc;
  }, {});

  state.agents = state.agents.map((agent) => {
    const verification = lookup[agent.name];
    if (verification) {
      return {
        ...agent,
        status: verification.status,
        verified: verification.status === 'Verified'
      };
    }
    return agent;
  });
}

function syncRemovalRequestPresentation() {
  state.removalRequests = state.removalRequests.map((request) => normalizeRemovalRequest(request));
  renderAdminRemovalTable();
  renderRemovalRequests();
}

function addAuditLog(type, user, content) {
  state.logs.unshift({
    time: 'Just now',
    type,
    user,
    content
  });
  renderAuditLog(getActiveLogFilter());
}

function addRiskAlert(alert) {
  const normalized = normalizeRiskAlert(alert);
  state.riskAlerts.unshift(normalized);
  addAuditLog('circumvention', 'SYSTEM', `${normalized.reason} for ${normalized.property} by ${normalized.agent}.`);

  if (api?.available && api.createRiskAlert) {
    void api.createRiskAlert({
      property: normalized.property,
      agent: normalized.agent,
      reason: normalized.reason,
      severity: normalized.severity,
      created_at: new Date().toISOString()
    });
  }
}

function detectCircumvention(reason, propertyTitle, agentName) {
  const triggerWords = /external|cash|outside|off[-\s]?platform|direct|bypass|skip|private|commission free|untracked/i;
  if (!reason || !triggerWords.test(reason)) return false;

  addRiskAlert({
    property: propertyTitle,
    agent: agentName,
    reason: `Potential circumvention activity detected in removal request: "${reason}"`,
    severity: 'high'
  });
  return true;
}

function resetListingForm() {
  ['#newTitle', '#newPrice', '#newLocation', '#newImage', '#newDesc', '#newBeds', '#newBaths'].forEach((selector) => {
    const field = $(selector);
    if (field) field.value = '';
  });
}

function updateAuthUi() {
  const loginBtn = $('#openLoginBtn');
  const userMenuBtn = $('#userMenuBtn');
  const userMenu = $('#userMenu');
  const agentPortalBtn = $('#agentPortalBtn');
  const adminPortalBtn = $('#adminPortalBtn');

  if (state.currentUser && state.userRole) {
    // User is authenticated
    if (loginBtn) {
      loginBtn.style.display = 'none';
    }
    if (userMenuBtn) {
      userMenuBtn.style.display = 'inline-flex';
      const email = state.currentUser.email || state.userEmail || 'Account';
      const userLabel = $('#userLabel');
      if (userLabel) userLabel.textContent = email.split('@')[0];
    }

    // Show portal buttons based on role
    if (state.userRole === 'agent' && agentPortalBtn) {
      agentPortalBtn.style.display = 'inline-flex';
    }
    if (state.userRole === 'admin' && adminPortalBtn) {
      adminPortalBtn.style.display = 'inline-flex';
    }

    // Update avatar and name in dashboard sidebar
    if (state.userRole === 'agent') {
      const avatar = $('#agentAvatarInitials');
      const name = $('#agentDisplayName');
      if (avatar) avatar.textContent = inferInitials(state.currentUser.email);
      if (name) name.textContent = state.currentUser.email?.split('@')[0] || 'Agent';
    }
  } else {
    // User is not authenticated
    if (loginBtn) {
      loginBtn.style.display = 'inline-flex';
    }
    if (userMenuBtn) {
      userMenuBtn.style.display = 'none';
    }
    if (userMenu) {
      userMenu.style.display = 'none';
    }
    if (agentPortalBtn) {
      agentPortalBtn.style.display = 'none';
    }
    if (adminPortalBtn) {
      adminPortalBtn.style.display = 'none';
    }
  }
}

// Toggle user menu dropdown
function toggleUserMenu() {
  const userMenu = $('#userMenu');
  if (userMenu) {
    userMenu.style.display = userMenu.style.display === 'none' ? 'block' : 'none';
  }
}

async function restoreCurrentUser() {
  if (!api?.available || !api?.getCurrentUser) return;

  const { data, error } = await api.getCurrentUser();
  if (error) {
    console.error(error);
    return;
  }

  state.currentUser = data?.user || null;
  updateAuthUi();
}

function propertyCard(property) {
  return `
    <article class="property-card" data-id="${property.id}">
      <div class="property-image">
        <img src="${property.image}" alt="${property.title}" loading="lazy" />
        <div class="property-badge ${property.dealType === 'Sale' ? 'sale' : ''}">${property.dealType}</div>
        ${property.verified ? '<div class="verified-badge" title="Verified listing"><i class="fa-solid fa-check"></i></div>' : ''}
      </div>
      <div class="property-info">
        <div class="property-price">${property.price}</div>
        <h3 class="property-title">${property.title}</h3>
        <div class="property-location"><i class="fa-solid fa-location-dot"></i> ${property.location}</div>
        <div class="property-meta">
          <span class="feature"><i class="fa-solid fa-bed"></i> ${property.beds} beds</span>
          <span class="feature"><i class="fa-solid fa-bath"></i> ${property.baths} baths</span>
          <span class="feature"><i class="fa-solid fa-house"></i> ${property.type}</span>
        </div>
        <div class="property-agent">
          <div class="agent-info">
            <div class="agent-avatar">${property.initials}</div>
            <div class="agent-details">
              <h4>${property.agent}</h4>
              <p>${property.agency}</p>
            </div>
          </div>
          <button class="btn btn-secondary" data-inquire="${property.id}">Inquire</button>
        </div>
      </div>
    </article>
  `;
}

function renderProperties() {
  const grid = $('#propertiesGrid');
  if (!grid) return;

  const searchTerm = state.search.trim().toLowerCase();
  const filtered = state.properties.filter((property) => {
    if (isPropertyRemoved(property)) return false;

    const searchFields = [property.title, property.location, property.type, property.agent, property.agency]
      .filter(Boolean)
      .map((value) => String(value).toLowerCase());

    const matchesSearch = !searchTerm || searchFields.some((value) => value.includes(searchTerm));
    const matchesType = state.type === 'all' || property.type === state.type;
    const matchesDeal = state.deal === 'all' || property.dealType === state.deal;
    const matchesTab = state.activeMarketTab === 'all' || property.dealType === state.activeMarketTab;

    return matchesSearch && matchesType && matchesDeal && matchesTab;
  });

  grid.innerHTML = filtered.length
    ? filtered.map(propertyCard).join('')
    : `
      <div class="glass-card empty-state" style="grid-column:1/-1;">
        <i class="fa-solid fa-house-circle-xmark"></i>
        <h3>No properties found</h3>
        <p>Try a different search or filter.</p>
      </div>
    `;
}

async function loadProperties() {
  if (!api?.available || !api?.fetchProperties) {
    renderProperties();
    populateRemovalPropertySelect();
    return;
  }

  const { data, error } = await api.fetchProperties();
  if (error) {
    console.error(error);
    showToast('Using demo properties. Supabase could not load listings.', 'warning');
    renderProperties();
    populateRemovalPropertySelect();
    return;
  }

  state.properties = Array.isArray(data) ? data.map(normalizePropertyRecord) : state.properties;
  syncRemovalRequestPresentation();
  renderProperties();
  populateRemovalPropertySelect();
}

async function loadRemovalRequests() {
  if (!api?.available || !api?.fetchRemovalRequests) {
    renderAdminRemovalTable();
    renderRemovalRequests();
    return;
  }

  const { data, error } = await api.fetchRemovalRequests();
  if (error) {
    console.error(error);
    showToast('Using demo approvals. Supabase could not load removal requests.', 'warning');
    renderAdminRemovalTable();
    renderRemovalRequests();
    return;
  }

  state.removalRequests = Array.isArray(data) ? data.map((request) => normalizeRemovalRequest(request)) : state.removalRequests;
  renderAdminRemovalTable();
  renderRemovalRequests();
}

async function loadDeals() {
  if (!api?.available || !api?.fetchDeals) {
    renderAgentDeals();
    renderCommissions();
    renderAllDeals();
    return;
  }

  const { data, error } = await api.fetchDeals();
  if (error) {
    console.error(error);
    showToast('Unable to load deals from Supabase. Using local deal data.', 'warning');
    renderAgentDeals();
    renderCommissions();
    renderAllDeals();
    return;
  }

  state.deals = Array.isArray(data) ? data.map(normalizeDealRecord) : state.deals;
  renderAgentDeals();
  renderCommissions();
  renderAllDeals();
}

async function loadAgentVerifications() {
  if (!api?.available || !api?.fetchAgentVerifications) {
    syncAgentVerificationStatus();
    renderAgentManagement();
    return;
  }

  const { data, error } = await api.fetchAgentVerifications();
  if (error) {
    console.error(error);
    renderAgentManagement();
    return;
  }

  state.agentVerifications = Array.isArray(data) ? data.map(normalizeAgentVerification) : state.agentVerifications;
  syncAgentVerificationStatus();
  renderAgentManagement();
  renderEscrowPanel();
}

async function loadRiskAlerts() {
  if (!api?.available || !api?.fetchRiskAlerts) {
    renderAuditLog(getActiveLogFilter());
    return;
  }

  const { data, error } = await api.fetchRiskAlerts();
  if (error) {
    console.error(error);
    renderAuditLog(getActiveLogFilter());
    return;
  }

  state.riskAlerts = Array.isArray(data) ? data.map(normalizeRiskAlert) : state.riskAlerts;
  if (state.riskAlerts.length) {
    state.riskAlerts.forEach((alert) => addAuditLog('circumvention', 'SYSTEM', `${alert.reason} for ${alert.property}.`));
  }
}

function renderAgentListings() {
  const tbody = $('#agentListingsTable');
  if (!tbody) return;

  tbody.innerHTML = state.listings.map((listing) => `
    <tr>
      <td>${listing.property}</td>
      <td>${listing.price}</td>
      <td><span class="status-badge ${listing.status === 'Active' ? 'active' : listing.status === 'Pending' ? 'pending' : 'sold'}"><i class="fa-solid fa-circle"></i> ${listing.status}</span></td>
      <td>${listing.inquiries}</td>
      <td><span class="status-badge ${listing.protection === 'Protected' ? 'active' : 'pending'}"><i class="fa-solid fa-shield-halved"></i> ${listing.protection}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" data-toast="Listing edited.">Edit</button>
        <button class="btn btn-danger btn-sm" data-removal-for="${listing.property}">Remove</button>
      </td>
    </tr>
  `).join('');
}

function renderAgentDeals() {
  const tbody = document.querySelector('#agent-deals table.data-table tbody');
  if (!tbody) return;

  tbody.innerHTML = state.deals.map((deal) => {
    const stageLabel = deal.escrowStage ? `<span class="deal-stage">${deal.escrowStage}</span>` : '';
    const statusClassName = statusClass(deal.status);
    return `
      <tr>
        <td>${deal.id}</td>
        <td>${deal.property}</td>
        <td>${deal.buyer}</td>
        <td><span class="status-badge ${statusClassName}"><i class="fa-solid fa-handshake"></i> ${deal.status}</span></td>
        <td>${deal.fee}</td>
        <td>${stageLabel} <button class="btn btn-secondary btn-sm" data-toast="Deal stage refreshed.">Refresh</button></td>
      </tr>
    `;
  }).join('');
}

function renderCommissions() {
  const tbody = $('#commissionsTable');
  if (!tbody) return;

  tbody.innerHTML = state.deals.map((deal) => {
    const statusClassName = statusClass(deal.status);
    return `
      <tr>
        <td>${deal.id}</td>
        <td>${deal.amount}</td>
        <td>${deal.fee}</td>
        <td><span class="status-badge ${statusClassName}"><i class="fa-solid fa-coins"></i> ${deal.status}</span></td>
      </tr>
    `;
  }).join('');
}

function renderEscrowPanel() {
  const milestonesBody = $('#escrowMilestonesTable');
  if (milestonesBody) {
    milestonesBody.innerHTML = state.escrowMilestones.length
      ? state.escrowMilestones.map((item) => `
          <tr>
            <td>${item.property}</td>
            <td>${item.step}</td>
            <td><span class="status-badge ${statusClass(item.status)}"><i class="fa-solid fa-flag"></i> ${item.status}</span></td>
          </tr>
        `).join('')
      : `
          <tr>
            <td colspan="3" class="empty-state">No escrow milestones available.</td>
          </tr>
        `;
  }

  const verificationContainer = $('#verificationRequestsList');
  if (verificationContainer) {
    verificationContainer.innerHTML = state.agentVerifications.length
      ? state.agentVerifications.map((item) => `
          <div class="audit-item" style="margin-bottom:12px;">
            <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start; flex-wrap:wrap;">
              <div style="min-width:280px;">
                <strong>${item.agent}</strong>
                <div style="color:var(--muted); margin-top:6px;">${item.note || 'No note submitted.'}</div>
              </div>
              <span class="status-badge ${item.status === 'Verified' ? 'active' : item.status === 'Pending verification' ? 'pending' : 'alert'}"><i class="fa-solid fa-user-check"></i> ${item.status}</span>
            </div>
            <div style="margin-top:10px; color:var(--muted); font-size:.88rem;">Submitted: ${item.submitted}</div>
          </div>
        `).join('')
      : `
          <div class="empty-state">
            <i class="fa-solid fa-user-clock"></i>
            <h3>No verification requests</h3>
            <p>Submit a request to get certified on the platform.</p>
          </div>
        `;
  }
}

function toggleVerificationForm(show) {
  const form = $('#verificationRequestForm');
  if (!form) return;
  form.style.display = show ? 'block' : 'none';
}

async function submitVerificationRequest() {
  const notes = $('#verificationNotes')?.value.trim();
  if (!notes) {
    showToast('Add details for the verification request.', 'error');
    return;
  }

  await restoreCurrentUser();
  if (!state.currentUser) {
    showToast('Sign in before requesting verification.', 'warning');
    openModal('loginModal');
    return;
  }

  const payload = {
    agent_id: state.currentUser.id,
    agent_name: state.currentUser.email || DEFAULT_AGENT.name,
    status: 'pending_verification',
    note: notes,
    submitted_at: new Date().toISOString()
  };

  let createdRequest = normalizeAgentVerification(payload);
  if (api?.available && api?.createAgentVerification) {
    const { data, error } = await api.createAgentVerification(payload);
    if (error) {
      console.error(error);
      showToast(error.message || 'Failed to submit the verification request.', 'error');
      return;
    }
    createdRequest = normalizeAgentVerification(data?.[0] || payload);
  }

  state.agentVerifications.unshift(createdRequest);
  syncAgentVerificationStatus();
  renderAgentManagement();
  renderEscrowPanel();
  toggleVerificationForm(false);
  if ($('#verificationNotes')) $('#verificationNotes').value = '';
  showToast('Verification request submitted.', 'success');
}

function renderAdminRemovalTable() {
  const tbody = $('#adminRemovalTable');
  if (!tbody) return;

  const sortedRequests = [...state.removalRequests].sort((a, b) => {
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  tbody.innerHTML = sortedRequests.map((request) => `
    <tr>
      <td>${request.agent}</td>
      <td>${request.property}</td>
      <td>${request.reason}</td>
      <td>${request.submitted}</td>
      <td><span class="status-badge ${removalStatusClass(request.status)}"><i class="fa-solid fa-clock"></i> ${request.status}</span></td>
      <td>
        ${isPendingRemovalRequest(request)
          ? `<button class="btn btn-success btn-sm" data-approve-removal="${request.id}"><i class="fa-solid fa-check"></i></button>
             <button class="btn btn-danger btn-sm" data-reject-removal="${request.id}"><i class="fa-solid fa-xmark"></i></button>`
          : '<span style="color:var(--muted); font-size:.88rem;">Reviewed</span>'}
      </td>
    </tr>
  `).join('');

  updateRemovalRequestBadge();
}

function renderRemovalRequests() {
  const container = $('#removalRequestsList');
  if (!container) return;

  const pendingRequests = state.removalRequests
    .filter((request) => isPendingRemovalRequest(request))
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  container.innerHTML = pendingRequests.length
    ? pendingRequests.map((request) => `
      <div class="glass-card" style="padding:16px; margin-bottom:12px;">
        <div style="display:flex; justify-content:space-between; gap:12px; flex-wrap:wrap;">
          <div>
            <div style="font-weight:800; margin-bottom:4px;">${request.property}</div>
            <div style="color:var(--muted); font-size:.92rem">Requested by <strong>${request.agent}</strong> - ${request.submitted}</div>
          </div>
          <span class="status-badge ${removalStatusClass(request.status)}"><i class="fa-solid fa-clock"></i> ${request.status}</span>
        </div>
        <div class="mini-divider"></div>
        <div style="color:#cbd5e1">${request.reason}</div>
        <div class="modal-actions" style="margin-top:14px; justify-content:flex-start;">
          <button class="btn btn-success btn-sm" data-approve-removal="${request.id}"><i class="fa-solid fa-check"></i> Approve</button>
          <button class="btn btn-danger btn-sm" data-reject-removal="${request.id}"><i class="fa-solid fa-ban"></i> Reject</button>
        </div>
      </div>
    `).join('')
    : `
      <div class="empty-state">
        <i class="fa-solid fa-folder-open"></i>
        <h3>Nothing waiting</h3>
        <p>No removal requests right now.</p>
      </div>
    `;

  updateRemovalRequestBadge();
}

function renderAgentManagement() {
  const tbody = $('#agentManagementTable');
  if (!tbody) return;

  tbody.innerHTML = state.agents.map((agent) => `
    <tr>
      <td>${agent.name}</td>
      <td>${agent.listings}</td>
      <td>${agent.deals}</td>
      <td>${agent.trust}%</td>
      <td><span class="status-badge ${agent.status === 'Verified' ? 'active' : agent.status === 'Review clear' ? 'pending' : 'alert'}"><i class="fa-solid fa-user-check"></i> ${agent.status}</span></td>
    </tr>
  `).join('');
}

function renderAllDeals() {
  const tbody = $('#allDealsTable');
  if (!tbody) return;

  tbody.innerHTML = state.deals.map((deal) => {
    const stage = deal.escrowStage ? `Escrow: ${deal.escrowStage}` : '';
    const statusClassName = statusClass(deal.status);
    return `
      <tr>
        <td>${deal.id}</td>
        <td>${deal.property}</td>
        <td>${deal.buyer || '-'}</td>
        <td>${deal.amount}</td>
        <td>${deal.fee}</td>
        <td><span class="status-badge ${statusClassName}"><i class="fa-solid fa-handshake"></i> ${deal.status}</span> ${stage}</td>
      </tr>
    `;
  }).join('');
}

function renderAuditLog(filter = 'all') {
  const container = $('#auditLog');
  if (!container) return;

  const logs = filter === 'all' ? state.logs : state.logs.filter((log) => log.type === filter);
  container.innerHTML = logs.length
    ? logs.map((log) => `
      <div class="audit-item">
        <div class="audit-time">${log.time}</div>
        <div class="audit-content"><span class="audit-user">${log.user}:</span> ${log.content}</div>
      </div>
    `).join('')
    : `
      <div class="empty-state">
        <i class="fa-solid fa-magnifying-glass"></i>
        <h3>No logs here</h3>
        <p>That filter has nothing on it.</p>
      </div>
    `;
}

function renderInquiries() {
  const container = $('#inquiriesList');
  if (!container) return;

  container.innerHTML = state.inquiries.map((inquiry) => `
    <div class="audit-item">
      <div class="audit-time">${inquiry.time}</div>
      <div class="audit-content">
        <div style="font-weight:800; margin-bottom:4px;">${inquiry.sender} about ${inquiry.property}</div>
        <div style="color:#cbd5e1">${inquiry.msg}</div>
      </div>
    </div>
  `).join('');
}

function populateRemovalPropertySelect() {
  const select = $('#removalProperty');
  if (!select) return;

  const propertyNames = [...new Set(
    state.properties
      .filter((property) => !isPropertyRemoved(property))
      .map((property) => property.title)
  )];

  select.innerHTML = propertyNames.map((property) => `<option>${property}</option>`).join('');
}

async function handleSignIn() {
  if (!api?.available || !api?.signIn) {
    showToast('Supabase browser tools failed to load. Check the local script paths.', 'error');
    return;
  }

  const email = $('#loginEmail')?.value.trim();
  const password = $('#loginPassword')?.value || '';
  if (!email || !password) {
    showToast('Enter both email and password.', 'error');
    return;
  }

  const signInBtn = $('#signInBtn');
  if (signInBtn) signInBtn.disabled = true;

  const { data, error } = await api.signIn(email, password);

  if (signInBtn) signInBtn.disabled = false;

  if (error) {
    console.error(error);
    showToast(error.message || 'Sign in failed.', 'error');
    return;
  }

  state.currentUser = data?.user || data?.session?.user || null;
  state.userRole = state.loginRole; // Set role based on what user selected
  state.userEmail = email;
  
  // Persist to localStorage for session restore
  localStorage.setItem('propertyflow_session', JSON.stringify({
    user: state.currentUser,
    role: state.userRole,
    email: state.userEmail,
    timestamp: Date.now()
  }));
  
  updateAuthUi();
  await loadRemovalRequests();
  closeModal('loginModal');
  if ($('#loginEmail')) $('#loginEmail').value = '';
  if ($('#loginPassword')) $('#loginPassword').value = '';
  showToast(`Signed in as ${state.userRole === 'agent' ? 'Agent' : 'Admin'}.`, 'success');
  
  // Auto-navigate to appropriate portal
  setTimeout(() => {
    navigateToView(state.userRole === 'agent' ? 'agent' : 'admin');
  }, 500);
}

async function handleLogout() {
  if (api?.available && api?.signOut) {
    const { error } = await api.signOut();
    if (error) {
      console.error(error);
    }
  }

  state.currentUser = null;
  state.userRole = null;
  state.userEmail = null;
  
  // Clear persisted session
  localStorage.removeItem('propertyflow_session');
  
  updateAuthUi();
  navigateToView('marketplace');
  showToast('Signed out successfully.', 'success');
}

async function handleSignOut() {
  if (!api?.available || !api?.signOut) {
    state.currentUser = null;
    updateAuthUi();
    showToast('Signed out locally.', 'success');
    return;
  }

  const { error } = await api.signOut();
  if (error) {
    console.error(error);
    showToast(error.message || 'Sign out failed.', 'error');
    return;
  }

  state.currentUser = null;
  updateAuthUi();
  showToast('Signed out successfully.', 'success');
}

async function saveNewListing() {
  const title = $('#newTitle')?.value.trim();
  const price = $('#newPrice')?.value.trim();
  const type = $('#newType')?.value;
  const dealType = $('#newDealType')?.value;
  const location = $('#newLocation')?.value.trim();
  const beds = parseInt($('#newBeds')?.value || '0', 10);
  const baths = parseInt($('#newBaths')?.value || '0', 10);
  const image = $('#newImage')?.value.trim();
  const description = $('#newDesc')?.value.trim();

  if (!title || !price || !location || !image || !description) {
    showToast('Fill in every field before saving.', 'error');
    return;
  }

  await restoreCurrentUser();
  if (!state.currentUser) {
    showToast('Sign in before publishing a listing.', 'warning');
    openModal('loginModal');
    return;
  }

  const payload = {
    agent_id: state.currentUser.id,
    agent_name: state.currentUser.email || DEFAULT_AGENT.name,
    agency: DEFAULT_AGENT.agency,
    title,
    description,
    price: parsePriceValue(price) ?? price,
    deal_type: String(dealType || '').toLowerCase(),
    property_type: String(type || '').toLowerCase(),
    location,
    bedrooms: beds,
    bathrooms: baths,
    image_url: image,
    commission_rate: COMMISSION_RATE,
    protection_policy: 'Platform enforced',
    status: 'Pending review',
    created_at: new Date().toISOString()
  };

  const saveButton = $('#saveListingBtn');
  if (saveButton) saveButton.disabled = true;

  let createdProperty = null;
  if (api?.available && api?.createProperty) {
    const { data, error } = await api.createProperty(payload);
    if (saveButton) saveButton.disabled = false;
    if (error) {
      console.error(error);
      showToast(error.message || 'Failed to save listing.', 'error');
      return;
    }
    createdProperty = normalizePropertyRecord(data?.[0] || payload);
  } else {
    if (saveButton) saveButton.disabled = false;
    createdProperty = normalizePropertyRecord(payload);
    showToast('Saved listing locally because backend is unavailable.', 'warning');
  }

  state.properties.unshift(createdProperty);
  state.listings.unshift(buildListing(createdProperty));
  renderProperties();
  renderAgentListings();
  populateRemovalPropertySelect();
  closeModal('addListingModal');
  resetListingForm();
  showToast('Listing saved and published.', 'success');
}

async function submitRemovalRequest() {
  const propertyTitle = $('#removalProperty')?.value;
  const reason = $('#removalReason')?.value.trim();

  if (!reason) {
    showToast('Enter a valid reason.', 'error');
    return;
  }

  const property = findPropertyByTitle(propertyTitle);
  if (!property) {
    showToast('Choose a valid property to remove.', 'error');
    return;
  }

  if (isPropertyRemoved(property)) {
    showToast('That property has already been removed.', 'warning');
    return;
  }

  const hasPendingRequest = state.removalRequests.some((request) => {
    return String(request.propertyId) === String(property.id) && isPendingRemovalRequest(request);
  });

  if (hasPendingRequest) {
    showToast('That property already has a pending removal request.', 'warning');
    return;
  }

  await restoreCurrentUser();
  if (!state.currentUser) {
    showToast('Sign in before submitting a removal request.', 'warning');
    openModal('loginModal');
    return;
  }

  const requestPayload = {
    agent_id: state.currentUser.id,
    property_id: property.id,
    reason,
    status: 'pending_review',
    created_at: new Date().toISOString()
  };

  let createdRequest = null;
  if (api?.available && api?.createRemovalRequest) {
    const { data, error } = await api.createRemovalRequest(requestPayload);
    if (error) {
      console.error(error);
      showToast(error.message || 'Failed to submit the removal request.', 'error');
      return;
    }
    createdRequest = normalizeRemovalRequest({
      ...(data?.[0] || requestPayload),
      property: property.title,
      agent: state.currentUser.email || property.agent,
      reason,
      status: 'pending_review'
    });
  } else {
    createdRequest = normalizeRemovalRequest({
      ...requestPayload,
      id: `local-${Date.now()}`,
      property: property.title,
      agent: state.currentUser.email || property.agent,
      reason,
      status: 'pending_review'
    });
    showToast('Removal request queued locally.', 'warning');
  }

  state.removalRequests.unshift(createdRequest);
  renderRemovalRequests();
  renderAdminRemovalTable();
  closeModal('removalRequestModal');
  if ($('#removalReason')) $('#removalReason').value = '';
  addAuditLog('alerts', 'AGENT', `Removal request submitted for ${property.title}.`);
  detectCircumvention(reason, property.title, state.currentUser.email || property.agent);

  const page = document.body.dataset.page;
  if (page === 'admin') {
    showAdminTab('admin-approvals');
  } else if (page === 'agent') {
    showAgentTab('protection');
  }
}

async function approveRemoval(requestId) {
  const request = state.removalRequests.find((item) => String(item.id) === String(requestId));
  if (!request) return;

  await restoreCurrentUser();
  if (!state.currentUser) {
    showToast('Sign in before reviewing removal requests.', 'warning');
    openModal('loginModal');
    return;
  }

  if (api?.available && api?.updateRemovalRequest && api?.updateProperty) {
    const { error: requestError } = await api.updateRemovalRequest(request.id, {
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: state.currentUser.id
    });

    if (requestError) {
      console.error(requestError);
      showToast(requestError.message || 'Failed to approve the removal request.', 'error');
      return;
    }

    const { error: propertyError } = await api.updateProperty(request.propertyId, {
      status: 'Removed'
    });

    if (propertyError) {
      console.error(propertyError);
      showToast(propertyError.message || 'Request approved, but the property could not be hidden yet.', 'warning');
    }
  }

  request.status = 'Approved';
  request.reviewedAt = new Date().toISOString();
  request.reviewedBy = state.currentUser.id;

  const property = findPropertyByTitle(request.property);
  if (property) property.status = 'Removed';

  addAuditLog('alerts', 'ADMIN', `Removal approved for ${request.property}. Reason accepted: ${request.reason}`);
  await loadProperties();
  await loadRemovalRequests();
  removeListingByPropertyTitle(request.property);
  showToast('Removal approved.', 'success');
}

async function rejectRemoval(requestId) {
  const request = state.removalRequests.find((item) => String(item.id) === String(requestId));
  if (!request) return;

  await restoreCurrentUser();
  if (!state.currentUser) {
    showToast('Sign in before reviewing removal requests.', 'warning');
    openModal('loginModal');
    return;
  }

  if (api?.available && api?.updateRemovalRequest) {
    const { error } = await api.updateRemovalRequest(request.id, {
      status: 'rejected',
      reviewed_at: new Date().toISOString(),
      reviewed_by: state.currentUser.id
    });

    if (error) {
      console.error(error);
      showToast(error.message || 'Failed to reject the removal request.', 'error');
      return;
    }
  }

  request.status = 'Rejected';
  request.reviewedAt = new Date().toISOString();
  request.reviewedBy = state.currentUser.id;

  addAuditLog('alerts', 'ADMIN', `Removal rejected for ${request.property}. Review flagged.`);
  await loadRemovalRequests();
  showToast('Removal rejected.', 'warning');
}

function getActiveLogFilter() {
  return $('#adminLogTabs .tab.active')?.dataset.logFilter || 'all';
}

function bindEvents() {
  $$('.nav-links a[data-view]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showView(link.dataset.view);
    });
  });

  $('#openLoginBtn')?.addEventListener('click', () => {
    if (state.currentUser) {
      void handleLogout();
    } else {
      setLoginRole('agent'); // default to agent
      openModal('loginModal');
    }
  });

  $('#openAddListingBtn')?.addEventListener('click', () => openModal('addListingModal'));
  $('#openRemovalBtn')?.addEventListener('click', () => {
    populateRemovalPropertySelect();
    openModal('removalRequestModal');
  });
  $('#signInBtn')?.addEventListener('click', () => void handleSignIn());

  $$('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) overlay.classList.remove('active');
    });
  });

  $$('[data-close]').forEach((button) => {
    button.addEventListener('click', () => closeModal(button.dataset.close));
  });

  $('#searchInput')?.addEventListener('input', (event) => {
    state.search = event.target.value;
    renderProperties();
  });

  $('#typeFilter')?.addEventListener('change', (event) => {
    state.type = event.target.value;
    renderProperties();
  });

  $('#dealFilter')?.addEventListener('change', (event) => {
    state.deal = event.target.value;
    renderProperties();
  });

  $('#searchBtn')?.addEventListener('click', () => renderProperties());

  $$('#marketTabs .tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('#marketTabs .tab').forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');
      state.activeMarketTab = tab.dataset.tab;
      renderProperties();
    });
  });

  $$('.sidebar-menu a[data-agent-tab]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showAgentTab(link.dataset.agentTab);
    });
  });

  $$('.sidebar-menu a[data-admin-tab]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showAdminTab(link.dataset.adminTab);
      if (link.dataset.adminTab === 'admin-protection') renderAuditLog(getActiveLogFilter());
    });
  });

  $$('#adminLogTabs .tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('#adminLogTabs .tab').forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');
      renderAuditLog(tab.dataset.logFilter);
    });
  });

  document.addEventListener('click', (event) => {
    const toastButton = event.target.closest('[data-toast]');
    if (toastButton) showToast(toastButton.dataset.toast, 'success');

    const inquireButton = event.target.closest('[data-inquire]');
    if (inquireButton) {
      const property = state.properties.find((item) => String(item.id) === inquireButton.dataset.inquire);
      if (property) showToast(`Inquiry sent for ${property.title}.`, 'success');
    }

    const removalButton = event.target.closest('[data-removal-for]');
    if (removalButton) {
      populateRemovalPropertySelect();
      const select = $('#removalProperty');
      if (select) select.value = removalButton.dataset.removalFor;
      openModal('removalRequestModal');
    }

    const approveButton = event.target.closest('[data-approve-removal]');
    if (approveButton) void approveRemoval(approveButton.dataset.approveRemoval);

    const rejectButton = event.target.closest('[data-reject-removal]');
    if (rejectButton) void rejectRemoval(rejectButton.dataset.rejectRemoval);
  });

  $('#saveListingBtn')?.addEventListener('click', () => {
    void saveNewListing();
  });
  $('#submitRemovalBtn')?.addEventListener('click', () => {
    void submitRemovalRequest();
  });
  $('#openVerificationRequestBtn')?.addEventListener('click', () => {
    toggleVerificationForm(true);
  });
  $('#cancelVerificationBtn')?.addEventListener('click', () => {
    toggleVerificationForm(false);
  });
  $('#submitVerificationBtn')?.addEventListener('click', () => {
    void submitVerificationRequest();
  });

  $('#searchInput')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') renderProperties();
  });

  $('#loginPassword')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void handleSignIn();
    }
  });
}

// Admin dashboard render functions
function renderAdminActivityLog() {
  const container = $('#adminActivityLog');
  if (!container) return;
  
  const recentLogs = state.logs.slice(0, 6);
  container.innerHTML = recentLogs.length
    ? recentLogs.map((log) => `
      <div class="audit-item">
        <div class="audit-time">${log.time}</div>
        <div class="audit-content">
          <span class="audit-user" style="color: ${log.type === 'alerts' ? '#fca5a5' : log.type === 'commission' ? '#86efac' : '#fbbf24'}">${log.user}</span>
          ${log.content}
        </div>
      </div>
    `).join('')
    : '<p style="color: var(--muted); text-align: center; padding: 20px;">No recent activity</p>';
}

function renderAdminDealsTable() {
  const tbody = $('#adminDealsTable');
  if (!tbody) return;

  tbody.innerHTML = state.deals.map((deal) => {
    const riskLevel = deal.status === 'Negotiation' ? 'warning' : deal.status === 'Payment pending' ? 'danger' : 'success';
    return `
      <tr>
        <td>${deal.id}</td>
        <td>${deal.property}</td>
        <td>${deal.amount}</td>
        <td>${deal.fee}</td>
        <td><span class="status-badge ${statusClass(deal.status)}"><i class="fa-solid fa-handshake"></i> ${deal.status}</span></td>
        <td><span class="status-badge ${riskLevel}" style="width: fit-content;"><i class="fa-solid fa-triangle-exclamation"></i> ${riskLevel === 'danger' ? 'High' : riskLevel === 'warning' ? 'Medium' : 'Low'}</span></td>
      </tr>
    `;
  }).join('');
}

function renderAdminCommissionsTable() {
  const tbody = $('#adminCommissionsTable');
  if (!tbody) return;

  const agentCommissions = {};
  state.deals.forEach(deal => {
    const property = state.properties.find(p => p.title === deal.property);
    const agentName = property?.agent || 'Unknown';
    if (!agentCommissions[agentName]) {
      agentCommissions[agentName] = { completed: 0, totalFee: 0 };
    }
    if (deal.status === 'Completed') {
      agentCommissions[agentName].completed += 1;
      agentCommissions[agentName].totalFee += (deal.amountValue || 0) * COMMISSION_RATE;
    }
  });

  tbody.innerHTML = Object.entries(agentCommissions).map(([agent, data]) => `
    <tr>
      <td>${agent}</td>
      <td>${data.completed}</td>
      <td>${currencyFormatter.format(data.totalFee)}</td>
      <td><span class="status-badge active"><i class="fa-solid fa-check"></i> Paid</span></td>
    </tr>
  `).join('') || '<tr><td colspan="4" style="text-align: center; color: var(--muted);">No commission data</td></tr>';
}

function renderAdminEscrowTable() {
  const tbody = $('#adminEscrowTable');
  if (!tbody) return;

  tbody.innerHTML = state.escrowMilestones.map((milestone) => `
    <tr>
      <td>${milestone.property}</td>
      <td>${milestone.step}</td>
      <td>${currencyFormatter.format(123456)}</td>
      <td>${milestone.status === 'Completed' ? 'Ready' : 'In Progress'}</td>
    </tr>
  `).join('');
}

async function initCommon() {
  renderProperties();
  renderAgentListings();
  renderCommissions();
  renderEscrowPanel();
  renderAdminRemovalTable();
  renderRemovalRequests();
  renderAgentManagement();
  renderAllDeals();
  renderAuditLog('all');
  renderInquiries();
  renderAdminActivityLog();
  renderAdminDealsTable();
  renderAdminCommissionsTable();
  renderAdminEscrowTable();
  populateRemovalPropertySelect();
  bindEvents();
  
  // Add event listeners for new UI elements
  $('#userMenuBtn')?.addEventListener('click', toggleUserMenu);
  
  // Close user menu when clicking elsewhere
  document.addEventListener('click', (event) => {
    const userMenuBtn = $('#userMenuBtn');
    const userMenu = $('#userMenu');
    if (userMenuBtn && userMenu && !userMenuBtn.contains(event.target) && !userMenu.contains(event.target)) {
      userMenu.style.display = 'none';
    }
  });
  
  updateAuthUi();
  await restoreCurrentUser();
  await Promise.all([
    loadProperties(),
    loadRemovalRequests(),
    loadDeals(),
    loadAgentVerifications(),
    loadRiskAlerts()
  ]);
}

function restoreSessionFromStorage() {
  const session = localStorage.getItem('propertyflow_session');
  if (session) {
    try {
      const data = JSON.parse(session);
      // Check if session is not too old (24 hours)
      if (Date.now() - data.timestamp < 86400000) {
        state.currentUser = data.user;
        state.userRole = data.role;
        state.userEmail = data.email;
        return true;
      }
    } catch (e) {
      console.error('Failed to restore session:', e);
    }
    localStorage.removeItem('propertyflow_session');
  }
  return false;
}

async function initApp() {
  // Try to restore session first
  const hasSession = restoreSessionFromStorage();
  
  await initCommon();

  // Navigate to appropriate view
  if (hasSession && state.userRole) {
    setTimeout(() => {
      navigateToView(state.userRole === 'agent' ? 'agent' : 'admin');
    }, 100);
  } else {
    navigateToView('marketplace');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  void initApp();
});
