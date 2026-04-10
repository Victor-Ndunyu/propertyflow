(function () {
  function unavailable(message) {
    return async function unavailableCall() {
      return {
        data: null,
        error: new Error(message)
      };
    };
  }

  const sdk = window.supabase;
  if (!sdk || typeof sdk.createClient !== 'function') {
    console.warn('Supabase browser bundle is missing. Browser API disabled.');
    window.propertyFlowApi = {
      available: false,
      client: null,
      fetchProperties: unavailable('Supabase browser bundle not loaded.'),
      createProperty: unavailable('Supabase browser bundle not loaded.'),
      updateProperty: unavailable('Supabase browser bundle not loaded.'),
      fetchRemovalRequests: unavailable('Supabase browser bundle not loaded.'),
      createRemovalRequest: unavailable('Supabase browser bundle not loaded.'),
      updateRemovalRequest: unavailable('Supabase browser bundle not loaded.'),
      fetchAgentProfiles: unavailable('Supabase browser bundle not loaded.'),
      upsertAgentProfile: unavailable('Supabase browser bundle not loaded.'),
      fetchAgentVerifications: unavailable('Supabase browser bundle not loaded.'),
      createAgentVerification: unavailable('Supabase browser bundle not loaded.'),
      updateAgentVerification: unavailable('Supabase browser bundle not loaded.'),
      fetchDeals: unavailable('Supabase browser bundle not loaded.'),
      createDeal: unavailable('Supabase browser bundle not loaded.'),
      updateDeal: unavailable('Supabase browser bundle not loaded.'),
      fetchEscrowMilestones: unavailable('Supabase browser bundle not loaded.'),
      updateEscrowMilestone: unavailable('Supabase browser bundle not loaded.'),
      fetchCommissionEvents: unavailable('Supabase browser bundle not loaded.'),
      updateCommissionEvent: unavailable('Supabase browser bundle not loaded.'),
      fetchRiskAlerts: unavailable('Supabase browser bundle not loaded.'),
      createRiskAlert: unavailable('Supabase browser bundle not loaded.'),
      updateRiskAlert: unavailable('Supabase browser bundle not loaded.'),
      signIn: unavailable('Supabase browser bundle not loaded.'),
      signOut: unavailable('Supabase browser bundle not loaded.'),
      getCurrentUser: unavailable('Supabase browser bundle not loaded.')
    };
    return;
  }

  const supabaseUrl = 'https://zhbvpzpiptqmsbwmvmee.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoYnZwenBpcHRxbXNid212bWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MTI2ODIsImV4cCI6MjA5MTE4ODY4Mn0.nzJJp2YkLuhFRVql5jfMpurxsh0qFXl0vOIf4shWmZU';
  const client = sdk.createClient(supabaseUrl, supabaseKey);

  async function fetchProperties() {
    return client
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async function createProperty(propertyData) {
    return client
      .from('properties')
      .insert([propertyData])
      .select();
  }

  async function updateProperty(propertyId, changes) {
    return client
      .from('properties')
      .update(changes)
      .eq('id', propertyId)
      .select();
  }

  async function fetchRemovalRequests() {
    return client
      .from('removal_requests')
      .select('id,agent_id,property_id,reason,status,created_at,reviewed_at,reviewed_by')
      .order('created_at', { ascending: false });
  }

  async function createRemovalRequest(requestData) {
    return client
      .from('removal_requests')
      .insert([requestData])
      .select();
  }

  async function updateRemovalRequest(requestId, changes) {
    return client
      .from('removal_requests')
      .update(changes)
      .eq('id', requestId)
      .select();
  }

  async function fetchAgentProfiles() {
    return client
      .from('agent_profiles')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async function upsertAgentProfile(profileData) {
    return client
      .from('agent_profiles')
      .upsert([profileData], { onConflict: 'agent_id' })
      .select();
  }

  async function fetchAgentVerifications() {
    return client
      .from('agent_verifications')
      .select('*')
      .order('submitted_at', { ascending: false });
  }

  async function createAgentVerification(verificationData) {
    return client
      .from('agent_verifications')
      .insert([verificationData])
      .select();
  }

  async function updateAgentVerification(verificationId, changes) {
    return client
      .from('agent_verifications')
      .update(changes)
      .eq('id', verificationId)
      .select();
  }

  async function fetchDeals() {
    return client
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async function createDeal(dealData) {
    return client
      .from('deals')
      .insert([dealData])
      .select();
  }

  async function updateDeal(dealId, changes) {
    return client
      .from('deals')
      .update(changes)
      .eq('id', dealId)
      .select();
  }

  async function fetchEscrowMilestones() {
    return client
      .from('escrow_milestones')
      .select('*')
      .order('sort_order', { ascending: true });
  }

  async function updateEscrowMilestone(milestoneId, changes) {
    return client
      .from('escrow_milestones')
      .update(changes)
      .eq('id', milestoneId)
      .select();
  }

  async function fetchCommissionEvents() {
    return client
      .from('commission_events')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async function updateCommissionEvent(eventId, changes) {
    return client
      .from('commission_events')
      .update(changes)
      .eq('id', eventId)
      .select();
  }

  async function fetchRiskAlerts() {
    return client
      .from('risk_alerts')
      .select('*')
      .order('created_at', { ascending: false });
  }

  async function createRiskAlert(alertData) {
    return client
      .from('risk_alerts')
      .insert([alertData])
      .select();
  }

  async function updateRiskAlert(alertId, changes) {
    return client
      .from('risk_alerts')
      .update(changes)
      .eq('id', alertId)
      .select();
  }

  async function signIn(email, password) {
    return client.auth.signInWithPassword({
      email,
      password
    });
  }

  async function signOut() {
    return client.auth.signOut();
  }

  async function getCurrentUser() {
    return client.auth.getUser();
  }

  window.propertyFlowApi = {
    available: true,
    client,
    fetchProperties,
    createProperty,
    updateProperty,
    fetchRemovalRequests,
    createRemovalRequest,
    updateRemovalRequest,
    fetchAgentProfiles,
    upsertAgentProfile,
    fetchAgentVerifications,
    createAgentVerification,
    updateAgentVerification,
    fetchDeals,
    createDeal,
    updateDeal,
    fetchEscrowMilestones,
    updateEscrowMilestone,
    fetchCommissionEvents,
    updateCommissionEvent,
    fetchRiskAlerts,
    createRiskAlert,
    updateRiskAlert,
    signIn,
    signOut,
    getCurrentUser
  };
})();
