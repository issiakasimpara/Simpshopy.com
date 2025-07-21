import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const url = new URL(req.url);
    const hostname = url.searchParams.get('hostname');

    if (!hostname) {
      return new Response(
        JSON.stringify({ error: 'Hostname parameter required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Looking up domain: ${hostname}`);

    // Check if this is a custom domain
    const { data: customDomain, error: domainError } = await supabase
      .from('custom_domains')
      .select(`
        id,
        custom_domain,
        verified,
        ssl_enabled,
        store_id,
        stores (
          id,
          name,
          description,
          logo_url,
          settings,
          status
        )
      `)
      .eq('custom_domain', hostname)
      .eq('verified', true)
      .single();

    if (domainError || !customDomain) {
      // Check if this is the main domain or a subdomain
      if (hostname.includes('simpshopy.com') || hostname.includes('localhost')) {
        return new Response(
          JSON.stringify({
            isMainDomain: true,
            hostname,
            message: 'Main application domain',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({
          error: 'Domain not found or not verified',
          hostname,
          suggestion: 'Please verify your domain configuration',
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get store products and additional data
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        images,
        status,
        category_id,
        categories (
          id,
          name,
          description
        )
      `)
      .eq('store_id', customDomain.store_id)
      .eq('status', 'active');

    // Get site template for the store (latest published version)
    const { data: siteTemplate, error: templateError } = await supabase
      .from('site_templates')
      .select('template_data, is_published, updated_at')
      .eq('store_id', customDomain.store_id)
      .eq('is_published', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const storeData = {
      domain: customDomain,
      store: customDomain.stores,
      products: products || [],
      siteTemplate: siteTemplate?.template_data || null,
      metadata: {
        totalProducts: products?.length || 0,
        storeActive: customDomain.stores?.status === 'active',
        sslEnabled: customDomain.ssl_enabled,
        lastUpdated: new Date().toISOString(),
      },
    };

    return new Response(
      JSON.stringify({
        success: true,
        hostname,
        ...storeData,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Domain router error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});