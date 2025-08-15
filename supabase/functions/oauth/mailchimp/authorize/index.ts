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
        JSON.stringify({ error: 'Paramètres manquants: user_id et store_id requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Générer l'URL d'autorisation Mailchimp
    const clientId = Deno.env.get('MAILCHIMP_CLIENT_ID')
    const siteUrl = Deno.env.get('SITE_URL') || 'https://simpshopy.com'
    const redirectUri = `${siteUrl}/api/oauth/mailchimp/callback`
    
    if (!clientId) {
      throw new Error('MAILCHIMP_CLIENT_ID non configuré')
    }

    const authUrl = new URL('https://login.mailchimp.com/oauth2/authorize')
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', 'read_write')
    authUrl.searchParams.set('state', JSON.stringify({ 
      userId, 
      storeId, 
      returnUrl: returnUrl || '/dashboard/integrations',
      timestamp: Date.now()
    }))

    console.log('🔐 URL d\'autorisation Mailchimp générée:', authUrl.toString())

    return new Response(
      JSON.stringify({ 
        success: true,
        auth_url: authUrl.toString(),
        message: 'Redirection vers Mailchimp pour autorisation...'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Erreur autorisation Mailchimp:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erreur lors de l\'autorisation',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
