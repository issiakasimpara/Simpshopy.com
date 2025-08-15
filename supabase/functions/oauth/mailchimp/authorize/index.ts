import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')
    const storeId = searchParams.get('store_id')
    const returnUrl = searchParams.get('return_url')

    if (!userId || !storeId) {
      return new Response(
        JSON.stringify({ 
          error: 'user_id et store_id sont requis',
          received: { userId, storeId }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const clientId = Deno.env.get('MAILCHIMP_CLIENT_ID')
    const siteUrl = Deno.env.get('SITE_URL') || 'https://simpshopy.com'
    
    if (!clientId) {
      return new Response(
        JSON.stringify({ error: 'MAILCHIMP_CLIENT_ID non configuré' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // URL de callback correcte pour Supabase Edge Functions
    const redirectUri = `https://grutldacuowplosarucp.supabase.co/functions/v1/oauth/mailchimp/callback`

    const authUrl = new URL('https://login.mailchimp.com/oauth2/authorize')
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', 'read_write')
    
    // State avec timestamp pour sécurité
    const state = JSON.stringify({ 
      userId, 
      storeId, 
      returnUrl: returnUrl || '/dashboard/integrations',
      timestamp: Date.now()
    })
    authUrl.searchParams.set('state', state)

    console.log('🔗 URL d\'autorisation générée:', authUrl.toString())
    console.log('📋 Paramètres:', { userId, storeId, redirectUri })

    return new Response(
      JSON.stringify({ 
        success: true, 
        auth_url: authUrl.toString(),
        message: 'Redirection vers Mailchimp...',
        debug: { redirectUri, clientId: clientId ? '***' : 'MANQUANT' }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erreur dans authorize:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erreur interne du serveur',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
