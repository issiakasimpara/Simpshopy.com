
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CloudflareConfig {
  apiToken: string;
  accountId: string;
}

interface DomainRequest {
  action: 'configure' | 'verify' | 'remove';
  storeId: string;
  domainName: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 🔐 Récupération sécurisée des credentials Cloudflare
    const cloudflareToken = Deno.env.get('CLOUDFLARE_API_TOKEN');
    const cloudflareAccountId = Deno.env.get('CLOUDFLARE_ACCOUNT_ID');

    console.log('Cloudflare Token available:', !!cloudflareToken);
    console.log('Cloudflare Account ID available:', !!cloudflareAccountId);

    if (!cloudflareToken || !cloudflareAccountId) {
      throw new Error('Cloudflare credentials not configured. Please add CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID in your Supabase secrets.');
    }

    const { action, storeId, domainName }: DomainRequest = await req.json();

    console.log(`Action: ${action} for domain: ${domainName}, Store: ${storeId}`);

    switch (action) {
      case 'configure':
        return await configureDomain(supabaseClient, domainName, storeId, cloudflareToken);
      
      case 'verify':
        return await verifyDomain(supabaseClient, domainName, cloudflareToken);
      
      case 'remove':
        return await removeDomain(supabaseClient, domainName, cloudflareToken);
      
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function configureDomain(supabaseClient: any, domainName: string, storeId: string, apiToken: string) {
  console.log(`Configuring domain: ${domainName} for store: ${storeId}`);

  try {
    // 1. Vérifier si le domaine existe déjà
    const { data: existingDomain } = await supabaseClient
      .from('domains')
      .select('*')
      .eq('domain_name', domainName)
      .single();

    if (existingDomain) {
      console.log(`Domain ${domainName} already exists, updating...`);
      
      // Vérifier le statut dans Cloudflare
      const zoneStatus = await checkCloudflareZoneStatus(existingDomain.cloudflare_zone_id, apiToken);
      
      await supabaseClient
        .from('domains')
        .update({
          status: zoneStatus.status,
          ssl_status: zoneStatus.ssl_status,
          last_verified_at: new Date().toISOString()
        })
        .eq('id', existingDomain.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          domain: { ...existingDomain, status: zoneStatus.status },
          message: 'Domaine mis à jour'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Créer une zone dans Cloudflare
    const zoneData = await createOrGetCloudflareZone(domainName, apiToken);
    console.log('Zone created/found:', zoneData.id);

    // 3. Stocker le domaine en base
    const { data: domain, error: dbError } = await supabaseClient
      .from('domains')
      .insert({
        store_id: storeId,
        domain_name: domainName,
        cloudflare_zone_id: zoneData.id,
        status: 'verifying',
        ssl_status: 'pending',
        verification_token: crypto.randomUUID()
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Erreur base de données: ${dbError.message}`);
    }

    console.log('Domain stored in database:', domain.id);

    // 4. Créer les enregistrements DNS nécessaires
    await createDNSRecords(supabaseClient, domain.id, zoneData.id, domainName, apiToken);

    // 5. Configurer SSL
    await configureSSL(supabaseClient, domain.id, zoneData.id, apiToken);

    return new Response(
      JSON.stringify({ 
        success: true, 
        domain,
        nameservers: zoneData.name_servers,
        message: 'Domaine configuré avec succès'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Configuration error:', error);
    throw new Error(`Erreur de configuration: ${error.message}`);
  }
}

async function createOrGetCloudflareZone(domainName: string, apiToken: string) {
  console.log(`Creating/getting Cloudflare zone for: ${domainName}`);
  
  // D'abord, essayer de trouver une zone existante
  const listResponse = await fetch(`https://api.cloudflare.com/client/v4/zones?name=${domainName}`, {
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    }
  });

  const listData = await listResponse.json();
  console.log('List zones response:', JSON.stringify(listData, null, 2));

  if (listData.success && listData.result.length > 0) {
    console.log(`Zone found for ${domainName}:`, listData.result[0].id);
    return listData.result[0];
  }

  // Si aucune zone trouvée, créer une nouvelle zone
  console.log(`Creating new zone for ${domainName}`);
  const createResponse = await fetch('https://api.cloudflare.com/client/v4/zones', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: domainName,
      type: 'full'
    })
  });

  const createData = await createResponse.json();
  console.log('Create zone response:', JSON.stringify(createData, null, 2));
  
  if (!createData.success) {
    throw new Error(`Erreur Cloudflare: ${createData.errors?.[0]?.message || 'Erreur inconnue'}`);
  }

  return createData.result;
}

async function checkCloudflareZoneStatus(zoneId: string, apiToken: string) {
  console.log(`Checking Cloudflare zone status: ${zoneId}`);
  
  const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}`, {
    headers: {
      'Authorization': `Bearer ${apiToken}`,
    }
  });

  const data = await response.json();
  console.log('Zone status response:', JSON.stringify(data, null, 2));
  
  if (!data.success) {
    throw new Error('Erreur lors de la vérification du statut');
  }

  return {
    status: data.result.status === 'active' ? 'active' : 'verifying',
    ssl_status: data.result.status === 'active' ? 'active' : 'pending'
  };
}

async function createDNSRecords(supabaseClient: any, domainId: string, zoneId: string, domainName: string, apiToken: string) {
  console.log('Creating DNS records for zone:', zoneId);

  const records = [
    {
      type: 'A',
      name: '@',
      content: '76.76.19.123', // IP de votre serveur/proxy
      proxied: true
    },
    {
      type: 'CNAME',
      name: 'www',
      content: domainName,
      proxied: true
    }
  ];

  for (const record of records) {
    try {
      console.log(`Creating ${record.type} record: ${record.name}`);
      
      // Créer l'enregistrement dans Cloudflare
      const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record)
      });

      const cfData = await cfResponse.json();
      console.log(`DNS record response:`, JSON.stringify(cfData, null, 2));
      
      if (cfData.success) {
        // Stocker en base
        await supabaseClient
          .from('dns_records')
          .insert({
            domain_id: domainId,
            cloudflare_record_id: cfData.result.id,
            record_type: record.type,
            name: record.name,
            value: record.content,
            proxied: record.proxied,
            status: 'active'
          });
        
        console.log(`${record.type} record created successfully`);
      } else {
        console.error(`Failed to create ${record.type} record:`, cfData.errors);
      }
    } catch (error) {
      console.error(`Error creating ${record.type} record:`, error);
    }
  }
}

async function configureSSL(supabaseClient: any, domainId: string, zoneId: string, apiToken: string) {
  console.log('Configuring SSL for zone:', zoneId);

  try {
    // Configurer SSL Universal dans Cloudflare
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/ssl/universal/settings`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        enabled: true
      })
    });

    const data = await response.json();
    console.log('SSL configuration response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      // Stocker le certificat en base
      await supabaseClient
        .from('ssl_certificates')
        .insert({
          domain_id: domainId,
          status: 'provisioning'
        });

      // Mettre à jour le statut SSL du domaine
      await supabaseClient
        .from('domains')
        .update({ ssl_status: 'provisioning' })
        .eq('id', domainId);
        
      console.log('SSL configured successfully');
    } else {
      console.error('SSL configuration failed:', data.errors);
    }
  } catch (error) {
    console.error('SSL configuration error:', error);
  }
}

async function verifyDomain(supabaseClient: any, domainName: string, apiToken: string) {
  console.log(`Verifying domain: ${domainName}`);

  try {
    // Récupérer le domaine en base
    const { data: domain } = await supabaseClient
      .from('domains')
      .select('*')
      .eq('domain_name', domainName)
      .single();

    if (!domain) {
      throw new Error('Domaine non trouvé en base de données');
    }

    // Vérifier le statut dans Cloudflare
    const zoneStatus = await checkCloudflareZoneStatus(domain.cloudflare_zone_id, apiToken);
    
    await supabaseClient
      .from('domains')
      .update({
        status: zoneStatus.status,
        ssl_status: zoneStatus.ssl_status,
        is_verified: zoneStatus.status === 'active',
        last_verified_at: new Date().toISOString()
      })
      .eq('id', domain.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        verified: zoneStatus.status === 'active',
        status: zoneStatus.status,
        ssl_status: zoneStatus.ssl_status
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Verification error:', error);
    throw new Error(`Erreur de vérification: ${error.message}`);
  }
}

async function removeDomain(supabaseClient: any, domainName: string, apiToken: string) {
  console.log(`Removing domain: ${domainName}`);

  try {
    // Récupérer le domaine
    const { data: domain } = await supabaseClient
      .from('domains')
      .select('*')
      .eq('domain_name', domainName)
      .single();

    if (!domain) {
      throw new Error('Domaine non trouvé');
    }

    // Supprimer la zone dans Cloudflare si elle existe
    if (domain.cloudflare_zone_id) {
      const deleteResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${domain.cloudflare_zone_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
        }
      });
      
      const deleteData = await deleteResponse.json();
      console.log('Zone deletion response:', JSON.stringify(deleteData, null, 2));
    }

    // Supprimer de la base (cascade automatique)
    await supabaseClient
      .from('domains')
      .delete()
      .eq('id', domain.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Domaine supprimé avec succès'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Removal error:', error);
    throw new Error(`Erreur de suppression: ${error.message}`);
  }
}
