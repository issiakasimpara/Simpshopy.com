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
    const hostname = url.hostname
    
    console.log('🌐 Domain router - Hostname:', hostname)

    // Skip for localhost or simpshopy.com
    if (hostname === 'localhost' || hostname === 'simpshopy.com' || hostname.includes('vercel.app')) {
      return new Response('Continue to main app', { status: 200 })
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Find the store for this domain
    const { data: domain, error } = await supabaseClient
      .from('custom_domains')
      .select(`
        store_id,
        store_slug,
        verified,
        stores (
          name,
          slug
        )
      `)
      .eq('custom_domain', hostname)
      .eq('verified', true)
      .single()

    if (error || !domain) {
      console.log('❌ Domain not found or not verified:', hostname)
      return new Response('Domain not found', { status: 404 })
    }

    console.log('✅ Domain found:', domain)

    // Redirect to the store
    const storeUrl = `https://simpshopy.com/store/${domain.stores.slug}`
    
    return new Response(null, {
      status: 302,
      headers: {
        'Location': storeUrl,
        ...corsHeaders
      }
    })

  } catch (error) {
    console.error('❌ Domain router error:', error)
    return new Response('Internal error', { status: 500 })
  }
}) 