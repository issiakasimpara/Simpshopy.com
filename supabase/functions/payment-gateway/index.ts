import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentProvider {
  name: 'moneroo' | 'stripe' | 'paypal';
  config: {
    apiKey: string;
    secretKey?: string;
    testMode: boolean;
  };
}

interface CheckConfigurationRequest {
  provider: string;
  storeId: string;
}

interface InitializePaymentRequest {
  provider: string;
  storeId: string;
  paymentData: any;
}

interface VerifyPaymentRequest {
  provider: string;
  storeId: string;
  paymentId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    const { method, url } = req
    const urlObj = new URL(url)
    const path = urlObj.pathname.split('/').pop() // Get the last part of the path

    // Route handling
    switch (path) {
      case 'check-configuration':
        return await handleCheckConfiguration(req, supabaseClient)
      
      case 'initialize-payment':
        return await handleInitializePayment(req, supabaseClient)
      
      case 'verify-payment':
        return await handleVerifyPayment(req, supabaseClient)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Endpoint not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('Error in payment-gateway:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

// Handler for checking payment configuration
async function handleCheckConfiguration(req: Request, supabaseClient: any) {
  const body: CheckConfigurationRequest = await req.json()
  const { provider, storeId } = body

  if (!provider || !storeId) {
    return new Response(
      JSON.stringify({ error: 'Provider and storeId are required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    // Get payment configuration from database
    const { data, error } = await supabaseClient
      .from('payment_configurations')
      .select(`${provider}_enabled, ${provider}_api_key`)
      .eq('store_id', storeId)
      .single()

    if (error || !data) {
      return new Response(
        JSON.stringify({ 
          isConfigured: false,
          message: 'Configuration not found'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const isConfigured = data[`${provider}_enabled`] && data[`${provider}_api_key`]

    return new Response(
      JSON.stringify({ 
        isConfigured,
        message: isConfigured ? 'Provider is configured' : 'Provider is not configured'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error checking configuration:', error)
    return new Response(
      JSON.stringify({ 
        isConfigured: false,
        error: 'Failed to check configuration'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

// Handler for initializing payments
async function handleInitializePayment(req: Request, supabaseClient: any) {
  const body: InitializePaymentRequest = await req.json()
  const { provider, storeId, paymentData } = body

  if (!provider || !storeId || !paymentData) {
    return new Response(
      JSON.stringify({ error: 'Provider, storeId, and paymentData are required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    // Get provider configuration
    const { data: config, error: configError } = await supabaseClient
      .from('payment_configurations')
      .select(`${provider}_enabled, ${provider}_test_mode, ${provider}_api_key, ${provider}_secret_key`)
      .eq('store_id', storeId)
      .single()

    if (configError || !config) {
      return new Response(
        JSON.stringify({ error: 'Payment configuration not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!config[`${provider}_enabled`] || !config[`${provider}_api_key`]) {
      return new Response(
        JSON.stringify({ error: `${provider} is not configured for this store` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Route to specific provider handler
    switch (provider) {
      case 'moneroo':
        return await handleMonerooPayment(paymentData, config)
      
      // Add other providers here in the future
      // case 'stripe':
      //   return await handleStripePayment(paymentData, config)
      
      default:
        return new Response(
          JSON.stringify({ error: `Provider ${provider} not supported` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('Error initializing payment:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to initialize payment' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

// Handler for verifying payments
async function handleVerifyPayment(req: Request, supabaseClient: any) {
  const body: VerifyPaymentRequest = await req.json()
  const { provider, storeId, paymentId } = body

  if (!provider || !storeId || !paymentId) {
    return new Response(
      JSON.stringify({ error: 'Provider, storeId, and paymentId are required' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    // Get provider configuration
    const { data: config, error: configError } = await supabaseClient
      .from('payment_configurations')
      .select(`${provider}_enabled, ${provider}_test_mode, ${provider}_api_key, ${provider}_secret_key`)
      .eq('store_id', storeId)
      .single()

    if (configError || !config) {
      return new Response(
        JSON.stringify({ error: 'Payment configuration not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!config[`${provider}_enabled`] || !config[`${provider}_api_key`]) {
      return new Response(
        JSON.stringify({ error: `${provider} is not configured for this store` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Route to specific provider handler
    switch (provider) {
      case 'moneroo':
        return await handleMonerooVerification(paymentId, config)
      
      // Add other providers here in the future
      // case 'stripe':
      //   return await handleStripeVerification(paymentId, config)
      
      default:
        return new Response(
          JSON.stringify({ error: `Provider ${provider} not supported` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
    }

  } catch (error) {
    console.error('Error verifying payment:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to verify payment' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

// Moneroo specific handlers
async function handleMonerooPayment(paymentData: any, config: any) {
  const MONEROO_API_URL = 'https://api.moneroo.com/v1'
  
  try {
    const response = await fetch(`${MONEROO_API_URL}/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.moneroo_api_key}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(paymentData)
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Moneroo API error',
          details: data.message || 'Failed to initialize payment'
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment initialized successfully',
        data: data.data || data
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Moneroo payment error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to initialize Moneroo payment',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function handleMonerooVerification(paymentId: string, config: any) {
  const MONEROO_API_URL = 'https://api.moneroo.com/v1'
  
  try {
    const response = await fetch(`${MONEROO_API_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.moneroo_api_key}`,
        'Accept': 'application/json'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Moneroo API error',
          details: data.message || 'Failed to verify payment'
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: data
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Moneroo verification error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to verify Moneroo payment',
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}
