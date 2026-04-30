/**
 * lib/properties.js
 * 
 * NODE.JS ONLY - NOT FOR BROWSER USE
 * 
 * Property CRUD operations for Node.js test scripts.
 * Should NEVER be imported in browser code.
 * Browser property calls use lib/browser-api.js.
 */

import { supabase } from './supabase.js'

export async function fetchProperties() {

  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })

  return { data, error }

}

export async function createProperty(propertyData) {

  const { data, error } = await supabase
    .from('properties')
    .insert([propertyData])
    .select()

  return { data, error }

}

export async function updateProperty(propertyId, changes) {

  const { data, error } = await supabase
    .from('properties')
    .update(changes)
    .eq('id', propertyId)
    .select()

  return { data, error }

}
