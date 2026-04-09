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
    const { data, error } = await client
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    return { data, error };
  }

  async function createProperty(propertyData) {
    const { data, error } = await client
      .from('properties')
      .insert([propertyData])
      .select();

    return { data, error };
  }

  async function updateProperty(propertyId, changes) {
    const { data, error } = await client
      .from('properties')
      .update(changes)
      .eq('id', propertyId)
      .select();

    return { data, error };
  }

  async function fetchRemovalRequests() {
    const { data, error } = await client
      .from('removal_requests')
      .select('id,agent_id,property_id,reason,status,created_at,reviewed_at,reviewed_by')
      .order('created_at', { ascending: false });

    return { data, error };
  }

  async function createRemovalRequest(requestData) {
    const { data, error } = await client
      .from('removal_requests')
      .insert([requestData])
      .select();

    return { data, error };
  }

  async function updateRemovalRequest(requestId, changes) {
    const { data, error } = await client
      .from('removal_requests')
      .update(changes)
      .eq('id', requestId)
      .select();

    return { data, error };
  }

  async function signIn(email, password) {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });

    return { data, error };
  }

  async function signOut() {
    const { error } = await client.auth.signOut();
    return { error };
  }

  async function getCurrentUser() {
    const { data, error } = await client.auth.getUser();
    return { data, error };
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
    signIn,
    signOut,
    getCurrentUser
  };
})();
