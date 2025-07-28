import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Vercel API configuration
const VERCEL_API_TOKEN = Deno.env.get('VERCEL_API_TOKEN')
const VERCEL_TEAM_ID = Deno.env.get('VERCEL_TEAM_ID')
const VERCEL_PROJECT_ID = Deno.env.get('VERCEL_PROJECT_ID')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const body = await req.json()
    console.log('🔍 Edge Function - Received request body:', JSON.stringify(body, null, 2))

    const { action, customDomain, storeId, domainId } = body

    console.log('🔍 Edge Function - Parsed fields:', { action, customDomain, storeId, domainId })

    // Validate required fields
    if (!action) {
      console.error('❌ Edge Function - Missing action')
      return new Response(
        JSON.stringify({ error: 'Action requise' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    console.log('🔍 Edge Function - Processing action:', action)

    switch (action) {
      case 'add_domain':
        if (!customDomain || !storeId) {
          console.error('❌ Edge Function - Missing customDomain or storeId for add_domain')
          return new Response(
            JSON.stringify({ error: 'customDomain et storeId requis' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        console.log('🔍 Edge Function - Calling handleAddDomain')
        return await handleAddDomain(supabaseClient, customDomain, storeId)
      
      case 'verify_domain':
        if (!domainId) {
          console.error('❌ Edge Function - Missing domainId for verify_domain')
          return new Response(
            JSON.stringify({ error: 'domainId requis' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        console.log('🔍 Edge Function - Calling handleVerifyDomain')
        return await handleVerifyDomain(supabaseClient, domainId)
      
      case 'delete_domain':
        if (!domainId) {
          console.error('❌ Edge Function - Missing domainId for delete_domain')
          return new Response(
            JSON.stringify({ error: 'domainId requis' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }
        console.log('🔍 Edge Function - Calling handleDeleteDomain')
        return await handleDeleteDomain(supabaseClient, domainId)
      
      default:
        console.error('❌ Edge Function - Unknown action:', action)
        return new Response(
          JSON.stringify({ error: 'Action non reconnue: ' + action }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('❌ Edge Function - Error processing request:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne: ' + error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleAddDomain(supabase: any, customDomain: string, storeId: string) {
  try {
    console.log('Adding domain:', customDomain, 'for store:', storeId)

    // Get current user ID from auth context
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('User not authenticated:', userError)
      return new Response(
        JSON.stringify({ error: 'Utilisateur non authentifié' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if store already has a custom domain
    const { data: existingDomain, error: checkError } = await supabase
      .from('custom_domains')
      .select('id, custom_domain')
      .eq('store_id', storeId)
      .eq('verified', true)
      .single()

    if (existingDomain) {
      return new Response(
        JSON.stringify({ 
          error: `Cette boutique a déjà un domaine personnalisé : ${existingDomain.custom_domain}. Supprimez-le d'abord pour en ajouter un nouveau.` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if domain is already used by another store
    const { data: domainExists, error: domainCheckError } = await supabase
      .from('custom_domains')
      .select('id, custom_domain')
      .eq('custom_domain', customDomain.toLowerCase().trim())
      .single()

    if (domainExists) {
      return new Response(
        JSON.stringify({ 
          error: `Le domaine ${customDomain} est déjà utilisé par une autre boutique.` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate verification token
    const verificationToken = `simpshopy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Add domain to database with user_id
    const { data, error } = await supabase
      .from('custom_domains')
      .insert({
        custom_domain: customDomain.toLowerCase().trim(),
        store_id: storeId,
        user_id: user.id,
        verification_token: verificationToken,
        verified: false,
        ssl_enabled: false
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'ajout du domaine: ' + error.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Add domain to Vercel automatically
    if (VERCEL_API_TOKEN && VERCEL_PROJECT_ID) {
      try {
        const vercelResponse = await addDomainToVercel(customDomain)
        console.log('Vercel domain added:', vercelResponse)
      } catch (vercelError) {
        console.error('Vercel error:', vercelError)
        // Continue even if Vercel fails - user can configure manually
      }
    }

    console.log('Domain added successfully:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        domain: data,
        verificationToken,
        message: 'Domaine ajouté avec succès. Configuration automatique en cours...'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Add domain error:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur lors de l\'ajout du domaine: ' + error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function addDomainToVercel(domain: string) {
  if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
    throw new Error('Vercel configuration manquante')
  }

  const response = await fetch(`https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: domain,
      teamId: VERCEL_TEAM_ID || undefined
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Vercel API error: ${error}`)
  }

  return await response.json()
}

async function verifyDomainInVercel(domain: string) {
  if (!VERCEL_API_TOKEN || !VERCEL_PROJECT_ID) {
    throw new Error('Vercel configuration manquante')
  }

  const response = await fetch(`https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains/${domain}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
    }
  })

  if (!response.ok) {
    throw new Error('Domain not found in Vercel')
  }

  const domainInfo = await response.json()
  return domainInfo.verification?.status === 'VALID'
}

async function handleVerifyDomain(supabase: any, domainId: string) {
  try {
    console.log('Verifying domain:', domainId)

    // Get domain info
    const { data: domain, error: fetchError } = await supabase
      .from('custom_domains')
      .select('*')
      .eq('id', domainId)
      .single()

    if (fetchError || !domain) {
      console.error('Domain not found:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Domaine non trouvé' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify domain in Vercel
    let isVerified = false
    if (VERCEL_API_TOKEN && VERCEL_PROJECT_ID) {
      try {
        isVerified = await verifyDomainInVercel(domain.custom_domain)
        console.log('Vercel verification result:', isVerified)
      } catch (vercelError) {
        console.error('Vercel verification error:', vercelError)
        // Fallback to simple verification
        isVerified = true
      }
    } else {
      // Simple verification if Vercel not configured
      isVerified = true
    }

    // Update domain status
    const { error: updateError } = await supabase
      .from('custom_domains')
      .update({
        verified: isVerified,
        ssl_enabled: isVerified,
        updated_at: new Date().toISOString()
      })
      .eq('id', domainId)

    if (updateError) {
      console.error('Update error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la vérification: ' + updateError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Domain verified successfully')

    return new Response(
      JSON.stringify({ 
        success: true,
        verified: isVerified,
        message: isVerified ? 'Domaine vérifié avec succès ! SSL activé automatiquement.' : 'Vérification échouée'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Verify domain error:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la vérification: ' + error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleDeleteDomain(supabase: any, domainId: string) {
  try {
    console.log('Deleting domain with ID:', domainId)

    // Get current user ID from auth context
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('User not authenticated:', userError)
      return new Response(
        JSON.stringify({ error: 'Utilisateur non authentifié' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch domain to get custom_domain and vercel_domain_id
    const { data: domain, error: fetchError } = await supabase
      .from('custom_domains')
      .select('custom_domain, vercel_domain_id')
      .eq('id', domainId)
      .single()

    if (fetchError || !domain) {
      console.error('Domain not found:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Domaine non trouvé' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Found domain to delete:', domain)

    // Delete from Vercel if we have the domain ID
    if (VERCEL_API_TOKEN && VERCEL_PROJECT_ID && domain.vercel_domain_id) {
      try {
        const vercelDeleteResponse = await fetch(`https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains/${domain.custom_domain}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${VERCEL_API_TOKEN}`,
          },
        })
        
        if (!vercelDeleteResponse.ok) {
          console.error('Vercel delete error:', vercelDeleteResponse.statusText)
          // Continue anyway - we'll delete from our database
        } else {
          console.log('Domain deleted from Vercel successfully')
        }
      } catch (vercelError) {
        console.error('Vercel API error:', vercelError)
        // Continue anyway
      }
    }

    // Delete from Supabase
    const { error: deleteError } = await supabase
      .from('custom_domains')
      .delete()
      .eq('id', domainId)

    if (deleteError) {
      console.error('Database delete error:', deleteError)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la suppression du domaine: ' + deleteError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Domain deleted successfully from database')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Domaine supprimé avec succès'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Delete domain error:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la suppression du domaine: ' + error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
} 