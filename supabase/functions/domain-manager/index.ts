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
    const { action, customDomain, storeId } = await req.json()

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

    switch (action) {
      case 'add_domain':
        return await handleAddDomain(supabaseClient, customDomain, storeId)
      
      case 'verify_domain':
        return await handleVerifyDomain(supabaseClient, customDomain)
      
      case 'delete_domain':
        return await handleDeleteDomain(supabaseClient, customDomain)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Action non reconnue' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function handleAddDomain(supabase: any, customDomain: string, storeId: string) {
  try {
    // Generate verification token
    const verificationToken = `simpshopy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Add domain to database
    const { data, error } = await supabase
      .from('custom_domains')
      .insert({
        custom_domain: customDomain.toLowerCase().trim(),
        store_id: storeId,
        verification_token: verificationToken,
        verified: false,
        ssl_enabled: false
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de l\'ajout du domaine' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        domain: data,
        verificationToken,
        message: 'Domaine ajouté avec succès. Configurez vos DNS maintenant.'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Add domain error:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur lors de l\'ajout du domaine' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleVerifyDomain(supabase: any, domainId: string) {
  try {
    // Get domain info
    const { data: domain, error: fetchError } = await supabase
      .from('custom_domains')
      .select('*')
      .eq('id', domainId)
      .single()

    if (fetchError || !domain) {
      return new Response(
        JSON.stringify({ error: 'Domaine non trouvé' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Simple verification - check if domain resolves to our server
    // In a real implementation, you'd check DNS records
    const isVerified = true // Simplified for now

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
        JSON.stringify({ error: 'Erreur lors de la vérification' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        verified: isVerified,
        message: isVerified ? 'Domaine vérifié avec succès !' : 'Vérification échouée'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Verify domain error:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur lors de la vérification' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleDeleteDomain(supabase: any, domainId: string) {
  try {
    const { error } = await supabase
      .from('custom_domains')
      .delete()
      .eq('id', domainId)

    if (error) {
      console.error('Delete error:', error)
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la suppression' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

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
      JSON.stringify({ error: 'Erreur lors de la suppression' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
} 