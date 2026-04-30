/**
 * browser-api.js
 *
 * BROWSER-SIDE API WRAPPER
 *
 * Security notes:
 * - This file only reads public browser config from window.PROPERTYFLOW_CONFIG
 * - The browser client always uses the Supabase anon key
 * - Service-role keys must never be used here
 */

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
  const propertyFlowConfig = window.PROPERTYFLOW_CONFIG || {};
  const appMode = propertyFlowConfig.appMode === 'demo' ? 'demo' : 'supabase';
  const supabaseConfig = propertyFlowConfig.supabase || {};

  function buildUnavailableApi(message) {
    return {
      appMode,
      available: false,
      client: null,
      fetchSession: unavailable(message),
      getCurrentUser: unavailable(message),
      fetchProperties: unavailable(message),
      createProperty: unavailable(message),
      updateProperty: unavailable(message),
      fetchRemovalRequests: unavailable(message),
      createRemovalRequest: unavailable(message),
      updateRemovalRequest: unavailable(message),
      fetchAgentProfiles: unavailable(message),
      upsertAgentProfile: unavailable(message),
      fetchUserProfile: unavailable(message),
      upsertProfile: unavailable(message),
      ensureCurrentUserProfile: unavailable(message),
      fetchAgentVerifications: unavailable(message),
      createAgentVerification: unavailable(message),
      updateAgentVerification: unavailable(message),
      fetchDeals: unavailable(message),
      createDeal: unavailable(message),
      updateDeal: unavailable(message),
      fetchEscrowMilestones: unavailable(message),
      updateEscrowMilestone: unavailable(message),
      fetchCommissionEvents: unavailable(message),
      updateCommissionEvent: unavailable(message),
      fetchRiskAlerts: unavailable(message),
      createRiskAlert: unavailable(message),
      updateRiskAlert: unavailable(message),
      signIn: unavailable(message),
      signUp: unavailable(message),
      signOut: unavailable(message),
      uploadPropertyImage: unavailable(message),
      onAuthStateChange() {
        return {
          data: {
            subscription: {
              unsubscribe() {}
            }
          }
        };
      }
    };
  }

  if (!sdk || typeof sdk.createClient !== 'function') {
    console.warn('Supabase browser bundle is missing. Browser API disabled.');
    window.propertyFlowApi = buildUnavailableApi('Supabase browser bundle not loaded.');
    return;
  }

  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    console.error('PROPERTYFLOW_CONFIG.supabase is missing. Ensure config.js loads before browser-api.js.');
    window.propertyFlowApi = buildUnavailableApi('Supabase config not loaded.');
    return;
  }

  const client = sdk.createClient(supabaseConfig.url, supabaseConfig.anonKey);

  function defaultAgentName(user, metadata = {}) {
    return metadata.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Agent';
  }

  function defaultAgencyName(user, metadata = {}) {
    return metadata.agency || user?.user_metadata?.agency || 'Independent';
  }

  async function fetchSession() {
    return client.auth.getSession();
  }

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
      .select('agent_id,full_name,agency_name,verification_status,trust_score,created_at,updated_at')
      .order('created_at', { ascending: false });
  }

  async function upsertAgentProfile(profileData) {
    return client
      .from('agent_profiles')
      .upsert([profileData], { onConflict: 'agent_id' })
      .select();
  }

  async function fetchUserProfile(userId) {
    return client
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
  }

  async function upsertProfile(profileData) {
    const safeProfile = {
      ...profileData,
      role: profileData?.role === 'admin' ? 'admin' : 'agent'
    };

    return client
      .from('profiles')
      .upsert([safeProfile], { onConflict: 'user_id' })
      .select();
  }

  async function ensureCurrentUserProfile(user, metadata = {}) {
    if (!user?.id) {
      return { data: null, error: new Error('User is required before provisioning a profile.') };
    }

    const { error: profileError } = await upsertProfile({
      user_id: user.id,
      role: 'agent'
    });

    if (profileError) {
      return { data: null, error: profileError };
    }

    const { error: agentProfileError } = await upsertAgentProfile({
      agent_id: user.id,
      full_name: defaultAgentName(user, metadata),
      agency_name: defaultAgencyName(user, metadata)
    });

    if (agentProfileError) {
      return { data: null, error: agentProfileError };
    }

    return fetchUserProfile(user.id);
  }

  async function fetchAgentVerifications() {
    return client
      .from('agent_verifications')
      .select('id,agent_id,legal_name,agency_name,status,submitted_at,notes')
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
      .select('id,property_id,agent_id,client_name,agreed_amount,commission_amount,stage,escrow_status,commission_status,created_at,properties(title),agent_profiles(full_name)')
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
      .select('id,deal_id,label,amount,status,sort_order,created_at')
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
      .select('id,deal_id,amount,status,due_at,settled_at,created_at')
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
      .select('id,agent_id,property_id,severity,title,description,created_at,status')
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

  async function signUp(email, password, metadata = {}) {
    const response = await client.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    const signedInUser = response?.data?.session?.user || null;
    if (!signedInUser) {
      return response;
    }

    const { error: bootstrapError } = await ensureCurrentUserProfile(signedInUser, metadata);
    if (bootstrapError) {
      return { data: null, error: bootstrapError };
    }

    return response;
  }

  async function signOut() {
    return client.auth.signOut();
  }

  async function getCurrentUser() {
    const { data, error } = await client.auth.getSession();
    return {
      data: {
        user: data?.session?.user || null,
        session: data?.session || null
      },
      error
    };
  }

  function onAuthStateChange(callback) {
    return client.auth.onAuthStateChange(callback);
  }

  async function uploadPropertyImage(userId, file) {
    if (!userId) {
      return { data: null, error: new Error('Sign in before uploading an image.') };
    }

    if (!(file instanceof File)) {
      return { data: null, error: new Error('Please choose an image file to upload.') };
    }

    if (!file.type || !file.type.startsWith('image/')) {
      return { data: null, error: new Error('Only image files can be uploaded.') };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { data: null, error: new Error('Image files must be 10 MB or smaller.') };
    }

    const bucket = 'property-images';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const filePath = `${userId}/${Date.now()}-${safeName}`;

    const { error: uploadError } = await client.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      return { data: null, error: uploadError };
    }

    const { data: publicData } = client.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      data: {
        path: filePath,
        publicUrl: publicData?.publicUrl || null
      },
      error: null
    };
  }

  window.propertyFlowApi = {
    appMode,
    available: true,
    client,
    fetchSession,
    fetchProperties,
    createProperty,
    updateProperty,
    fetchRemovalRequests,
    createRemovalRequest,
    updateRemovalRequest,
    fetchAgentProfiles,
    upsertAgentProfile,
    fetchUserProfile,
    upsertProfile,
    ensureCurrentUserProfile,
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
    signUp,
    signOut,
    getCurrentUser,
    onAuthStateChange,
    uploadPropertyImage
  };
})();
