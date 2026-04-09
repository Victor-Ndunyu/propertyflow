import { supabase } from './supabase.js'

export async function signUp(email, password) {

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password
  })

  return { data, error }

}

export async function signIn(email, password) {

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  })

  return { data, error }

}

export async function signOut() {

  const { error } = await supabase.auth.signOut()

  return { error }

}