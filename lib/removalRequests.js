import { supabase } from './supabase.js'

export async function fetchRemovalRequests() {

  const { data, error } = await supabase
    .from('removal_requests')
    .select('id,agent_id,property_id,reason,status,created_at,reviewed_at,reviewed_by')
    .order('created_at', { ascending: false })

  return { data, error }

}

export async function createRemovalRequest(requestData) {

  const { data, error } = await supabase
    .from('removal_requests')
    .insert([requestData])
    .select()

  return { data, error }

}

export async function updateRemovalRequest(requestId, changes) {

  const { data, error } = await supabase
    .from('removal_requests')
    .update(changes)
    .eq('id', requestId)
    .select()

  return { data, error }

}
