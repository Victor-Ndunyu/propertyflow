/**
 * Browser-safe configuration for PropertyFlow
 *
 * SECURITY RULES:
 * - This file contains ONLY public configuration
 * - NO service-role keys should ever be hardcoded here
 * - All values here are safe to expose in browser bundles
 * - Node-side scripts must stay separate and use environment variables
 */

export const PROPERTYFLOW_CONFIG = {
  appMode: 'supabase',
  supabase: {
    url: 'https://zhbvpzpiptqmsbwmvmee.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoYnZwenBpcHRxbXNid212bWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MTI2ODIsImV4cCI6MjA5MTE4ODY4Mn0.nzJJp2YkLuhFRVql5jfMpurxsh0qFXl0vOIf4shWmZU'
  }
};

export default PROPERTYFLOW_CONFIG;
