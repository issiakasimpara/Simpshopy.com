import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    let hostname = url.hostname
    
    // Si c'est un appel direct à l'Edge Function, essayer de récupérer le hostname du body
    if (hostname.includes('supabase.co')) {
      try {
        const body = await req.json()
        hostname = body.hostname || hostname
      } catch (e) {
        // Si pas de body JSON, utiliser l'hostname de l'URL
        console.log('No JSON body found, using URL hostname')
      }
    }
    
    console.log('🌐 Domain router - Hostname:', hostname)

    // Skip for localhost or main domain (admin interface)
    if (hostname === 'localhost' || hostname === 'simpshopy.com' || hostname.includes('vercel.app')) {
      console.log('✅ Main domain detected - serving admin interface')
      return new Response('Continue to main app', { status: 200 })
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Check if this is a subdomain (boutique.simpshopy.com)
    if (hostname.includes('simpshopy.com')) {
      const subdomain = hostname.split('.')[0]
      console.log('🔍 Checking subdomain:', subdomain)

      // Skip www subdomain
      if (subdomain === 'www') {
        console.log('✅ www subdomain - redirecting to main domain')
        return new Response(null, {
          status: 302,
          headers: {
            'Location': 'https://simpshopy.com',
            ...corsHeaders
          }
        })
      }

      // Find the store for this subdomain using the new store_domains table
      const { data: storeDomain, error: domainError } = await supabaseClient
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

      if (domainError || !storeDomain) {
        console.log('❌ Store not found for subdomain:', hostname)
        return new Response('Store not found', { status: 404 })
      }

      // Check if store is active
      if (storeDomain.stores.status !== 'active') {
        console.log('❌ Store is not active:', storeDomain.stores.slug)
        return new Response('Store is not active', { status: 404 })
      }

      console.log('✅ Store found for subdomain:', storeDomain.stores.name)

      // Return store data for the frontend to render
      return new Response(JSON.stringify({
        success: true,
        store: storeDomain.stores,
        domain: storeDomain,
        isSubdomain: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
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

    if (!customError && customDomain) {
      console.log('✅ Custom domain found:', customDomain.stores.name)

      // Return store data for the frontend to render
      return new Response(JSON.stringify({
        success: true,
        store: customDomain.stores,
        domain: customDomain,
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
    return new Response('Internal error', { status: 500 })
  }
}) 