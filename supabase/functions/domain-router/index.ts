import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    let hostname = url.hostname
    
    // If it's a direct call to the Edge Function, try to get hostname from the body
    if (hostname.includes('supabase.co')) {
      try {
        const body = await req.json()
        hostname = body.hostname || hostname
      } catch (e) {
        console.log('No JSON body found, using URL hostname')
      }
    }
    
    console.log('🌐 Domain router - Hostname:', hostname)
    
    // Skip for localhost
    if (hostname === 'localhost') {
      console.log('✅ Localhost detected - serving admin interface')
      return new Response('Continue to main app', { status: 200 })
    }

    // Check for admin domain
    if (hostname === 'admin.simpshopy.com') {
      console.log('✅ Admin domain detected - serving admin interface')
      return new Response('Continue to admin interface', { status: 200 })
    }

    // Skip for main domain (landing page)
    if (hostname === 'simpshopy.com' || hostname === 'www.simpshopy.com') {
      console.log('✅ Main domain detected - serving landing page')
      return new Response('Continue to landing page', { status: 200 })
    }

    // Skip for Vercel preview domains
    if (hostname.includes('vercel.app')) {
      console.log('✅ Vercel preview domain detected - serving admin interface')
      return new Response('Continue to main app', { status: 200 })
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    // Check if this is a subdomain (boutique.simpshopy.com)
    if (hostname.includes('simpshopy.com')) {
      const subdomain = hostname.split('.')[0]
      console.log('🔍 Checking subdomain:', subdomain)
      
      // Skip www subdomain
      if (subdomain === 'www') {
        console.log('🔍 www subdomain - redirecting to main domain')
        return new Response('Redirect to main domain', { status: 301 })
      }

      // Query store_domains table for subdomain
      const { data: storeDomain, error } = await supabaseClient
        .from('store_domains')
        .select(`
          store_id,
          domain_name,
          domain_type,
          is_active,
          verification_status,
          stores (
            id,
            name,
            slug,
            status,
            settings
          )
        `)
        .eq('domain_name', hostname)
        .eq('domain_type', 'subdomain')
        .eq('is_active', true)
        .eq('verification_status', 'verified')
        .single()

      if (error) {
        console.log('❌ Error querying store_domains:', error.message)
        return new Response('Store not found', { status: 404 })
      }

      if (storeDomain && storeDomain.stores) {
        console.log('✅ Store found for subdomain:', storeDomain.stores.name)
        return new Response(JSON.stringify({
          success: true,
          store: storeDomain.stores,
          domain: storeDomain,
          isSubdomain: true
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        })
      } else {
        console.log('❌ No store found for subdomain:', hostname)
        return new Response('Store not found', { status: 404 })
      }
    }

    // Check for custom domains (domains personnalisés)
    const { data: customDomain, error: customError } = await supabaseClient
      .from('store_domains')
      .select(`
        store_id,
        domain_name,
        domain_type,
        is_active,
        verification_status,
        stores (
          id,
          name,
          slug,
          status,
          settings
        )
      `)
      .eq('domain_name', hostname)
      .eq('domain_type', 'custom')
      .eq('is_active', true)
      .eq('verification_status', 'verified')
      .single()

    if (!customError && customDomain && customDomain.stores) {
      console.log('✅ Store found for custom domain:', customDomain.stores.name)
      return new Response(JSON.stringify({
        success: true,
        store: customDomain.stores,
        domain: customDomain,
        isSubdomain: false,
        isCustomDomain: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    console.log('❌ No matching domain found:', hostname)
    return new Response('Domain not found', { status: 404 })

  } catch (error) {
    console.error('❌ Domain router error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
}) 