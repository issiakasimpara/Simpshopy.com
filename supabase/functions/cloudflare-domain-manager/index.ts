import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface CloudflareResponse {
  success: boolean;
  errors: any[];
  messages: any[];
  result?: any;
}

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, domainId, customDomain, storeId } = await req.json();

    const cloudflareApiToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
    const cloudflareZoneId = Deno.env.get('CLOUDFLARE_ZONE_ID');
    
    if (!cloudflareApiToken || !cloudflareZoneId) {
      return new Response(
        JSON.stringify({ error: 'Cloudflare API credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (action) {
      case 'add_domain': {
        // Generate verification token
        const verificationToken = `malibashopy-verif-${crypto.randomUUID().substring(0, 8)}`;
        
        // Add domain to Supabase
        const { data: domain, error: dbError } = await supabase
          .from('custom_domains')
          .insert({
            user_id: user.id,
            store_id: storeId,
            custom_domain: customDomain,
            verification_token: verificationToken,
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          return new Response(
            JSON.stringify({ error: 'Failed to save domain' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create CNAME record in Cloudflare
        const cnameResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/dns_records`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cloudflareApiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'CNAME',
            name: customDomain,
            content: 'malibashopy.com',
            ttl: 3600,
            proxied: true,
          }),
        });

        const cnameResult: CloudflareResponse = await cnameResponse.json();
        
        if (cnameResult.success) {
          // Update domain with Cloudflare record ID
          await supabase
            .from('custom_domains')
            .update({
              cloudflare_zone_id: cloudflareZoneId,
              cloudflare_record_id: cnameResult.result.id,
            })
            .eq('id', domain.id);
        }

        return new Response(
          JSON.stringify({
            success: true,
            domain,
            verificationToken,
            cloudflareConfigured: cnameResult.success,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'verify_domain': {
        // Get domain from database
        const { data: domain, error: domainError } = await supabase
          .from('custom_domains')
          .select('*')
          .eq('id', domainId)
          .eq('user_id', user.id)
          .single();

        if (domainError || !domain) {
          return new Response(
            JSON.stringify({ error: 'Domain not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify DNS via Cloudflare API
        const dnsResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/dns_records?name=${domain.custom_domain}`);
        const dnsResult: CloudflareResponse = await dnsResponse.json();

        let verified = false;
        if (dnsResult.success && dnsResult.result.length > 0) {
          const record = dnsResult.result[0];
          verified = record.content === 'malibashopy.com' || record.content.includes(domain.verification_token);
        }

        if (verified) {
          // Update domain as verified
          await supabase
            .from('custom_domains')
            .update({
              verified: true,
              ssl_enabled: true, // Enable SSL automatically via Cloudflare proxy
            })
            .eq('id', domain.id);

          // Create SSL certificate via Cloudflare (auto-enabled with proxy)
          return new Response(
            JSON.stringify({
              success: true,
              verified: true,
              sslEnabled: true,
              message: 'Domain verified and SSL enabled via Cloudflare',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({
              success: false,
              verified: false,
              message: 'Domain verification failed. Please check your DNS configuration.',
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      case 'delete_domain': {
        // Get domain from database
        const { data: domain, error: domainError } = await supabase
          .from('custom_domains')
          .select('*')
          .eq('id', domainId)
          .eq('user_id', user.id)
          .single();

        if (domainError || !domain) {
          return new Response(
            JSON.stringify({ error: 'Domain not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Delete from Cloudflare if record exists
        if (domain.cloudflare_record_id) {
          await fetch(`https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/dns_records/${domain.cloudflare_record_id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${cloudflareApiToken}`,
            },
          });
        }

        // Delete from database
        const { error: deleteError } = await supabase
          .from('custom_domains')
          .delete()
          .eq('id', domainId);

        if (deleteError) {
          return new Response(
            JSON.stringify({ error: 'Failed to delete domain' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});