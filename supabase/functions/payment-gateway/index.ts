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
    // Create Supabase client with service role key for admin operations
    // This allows the Edge Function to access the database without user authentication
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    console.log('Supabase URL available:', !!supabaseUrl)
    console.log('Service Role Key available:', !!serviceRoleKey)
    
    const supabaseClient = createClient(supabaseUrl, serviceRoleKey)

    const { method, url } = req
    const urlObj = new URL(url)
    const pathSegments = urlObj.pathname.split('/')
    const endpoint = pathSegments[pathSegments.length - 1] // Get the last part of the path

    console.log('Request URL:', url)
    console.log('Path segments:', pathSegments)
    console.log('Endpoint:', endpoint)

    // Route handling
    switch (endpoint) {
      case 'check-configuration':
        return await handleCheckConfiguration(req, supabaseClient)
      
      case 'initialize-payment':
        return await handleInitializePayment(req, supabaseClient)
      
      case 'verify-payment':
        return await handleVerifyPayment(req, supabaseClient)
      
      default:
        console.log('Endpoint not found:', endpoint)
        return new Response(
          JSON.stringify({ error: 'Endpoint not found', endpoint: endpoint }),
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

    const isConfigured = data[`${provider}_enabled`] && !!data[`${provider}_api_key`]

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
  console.log('=== handleInitializePayment started ===')
  
  try {
    const body: InitializePaymentRequest = await req.json()
    console.log('Request body parsed:', { provider: body.provider, storeId: body.storeId })
    console.log('Payment data received:', JSON.stringify(body.paymentData, null, 2))
    
    const { provider, storeId, paymentData } = body

    if (!provider || !storeId || !paymentData) {
      console.log('Missing required fields:', { provider, storeId, hasPaymentData: !!paymentData })
      return new Response(
        JSON.stringify({ error: 'Provider, storeId, and paymentData are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Getting payment configuration for store:', storeId)
    
    // Get provider configuration
    const { data: config, error: configError } = await supabaseClient
      .from('payment_configurations')
      .select(`${provider}_enabled, ${provider}_test_mode, ${provider}_api_key, ${provider}_secret_key`)
      .eq('store_id', storeId)
      .single()

    console.log('Config query result:', { config, error: configError })

    if (configError || !config) {
      console.log('Payment configuration not found')
      return new Response(
        JSON.stringify({ error: 'Payment configuration not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Payment configuration found:', {
      enabled: config[`${provider}_enabled`],
      hasApiKey: !!config[`${provider}_api_key`],
      hasSecretKey: !!config[`${provider}_secret_key`]
    })

    // Check if provider is enabled and has either API key or secret key
    if (!config[`${provider}_enabled`] || (!config[`${provider}_api_key`] && !config[`${provider}_secret_key`])) {
      console.log('Provider not properly configured')
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
  const MONEROO_API_URL = 'https://api.moneroo.io'
  
  console.log('Original payment data:', JSON.stringify(paymentData, null, 2))
  console.log('Moneroo config:', { 
    enabled: config.moneroo_enabled, 
    hasApiKey: !!config.moneroo_api_key
  })
  
  try {
    // Use API key for authentication (Moneroo calls it secret key)
    const authKey = config.moneroo_api_key
    
    if (!authKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Moneroo API key not configured'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Transform checkout data to Moneroo format
    const monerooData = transformToMonerooFormat(paymentData)
    console.log('Transformed Moneroo data:', JSON.stringify(monerooData, null, 2))

    const response = await fetch(`${MONEROO_API_URL}/v1/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(monerooData)
    })

    console.log('Moneroo API response status:', response.status)
    
    const data = await response.json()
    console.log('Moneroo API response:', JSON.stringify(data, null, 2))

    // Check for 201 status (success according to Moneroo docs)
    if (response.status !== 201) {
      console.log('❌ Moneroo API Error Details:')
      console.log('Status:', response.status)
      console.log('Response Data:', JSON.stringify(data, null, 2))
      console.log('Request Data Sent:', JSON.stringify(monerooData, null, 2))
      
      return new Response(
        JSON.stringify({ 
          error: 'Moneroo API error',
          details: data.message || 'Failed to initialize payment',
          status: response.status,
          debug: {
            monerooData: monerooData,
            apiResponse: data,
            authKeyAvailable: !!authKey
          }
        }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return the checkout URL according to Moneroo docs structure
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Payment initialized successfully',
        checkout_url: data.data?.checkout_url || data.checkout_url,
        payment_id: data.data?.id || data.id,
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

// Transform checkout data to Moneroo format according to Moneroo documentation
function transformToMonerooFormat(paymentData: any) {
  console.log('Transforming payment data to Moneroo format...')
  
  try {
    // Parse customer info from JSON string
    const customerInfo = JSON.parse(paymentData.customer_info || paymentData.metadata?.customer_info || '{}')
    const items = JSON.parse(paymentData.items || paymentData.metadata?.items || '[]')
    const shippingMethod = JSON.parse(paymentData.shipping_method || paymentData.metadata?.shipping_method || '{}')
    
    console.log('Parsed data:', { customerInfo, items, shippingMethod })
    
    // Calculate total amount (items + shipping)
    // Try to get amount from different possible locations
    const totalAmountStr = paymentData.total_amount || 
                          paymentData.metadata?.total_amount || 
                          paymentData.amount?.toString() || '0'
    const shippingCostStr = paymentData.shipping_cost || 
                           paymentData.metadata?.shipping_cost || '0'
    
    const itemsTotal = parseFloat(totalAmountStr)
    const shippingCost = parseFloat(shippingCostStr)
    const totalAmount = itemsTotal + shippingCost // Keep as decimal for Moneroo
    
    console.log('Amount calculation:', { itemsTotal, shippingCost, totalAmount })
    
    // Create description from items
    const itemDescriptions = items.map((item: any) => 
      `${item.quantity}x ${item.name}`
    ).join(', ')
    const description = `Commande: ${itemDescriptions}${shippingCost > 0 ? ` + Livraison: ${shippingMethod.name || 'Standard'}` : ''}`
    
    // Build Moneroo payment data according to exact documentation format
    const monerooData = {
      amount: totalAmount,
      currency: paymentData.currency, // Use the exact currency from checkout
      description: description,
      return_url: paymentData.return_url || 'https://simpshopy.com/payment-success',
      customer: paymentData.customer || {
        email: customerInfo.email || 'customer@example.com',
        first_name: customerInfo.firstName || customerInfo.first_name || 'Client',
        last_name: customerInfo.lastName || customerInfo.last_name || 'Anonyme',
        phone: customerInfo.phone || undefined,
        address: customerInfo.address || undefined,
        city: customerInfo.city || undefined,
        state: customerInfo.state || undefined,
        country: customerInfo.country || undefined,
        zip: customerInfo.zipCode || customerInfo.zip || undefined
      },
      // Metadata as object according to documentation
      metadata: {
        order_id: paymentData.orderNumber || 'unknown',
        store_id: paymentData.storeId || 'unknown',
        items_count: items.length.toString(),
        shipping_method: shippingMethod.name || 'standard'
      }
    }
    
    // Remove undefined values from customer object
    Object.keys(monerooData.customer).forEach(key => {
      if (monerooData.customer[key] === undefined) {
        delete monerooData.customer[key]
      }
    })
    
    console.log('Transformation completed:', monerooData)
    return monerooData
    
  } catch (error) {
    console.error('Error transforming payment data:', error)
    throw new Error('Failed to transform payment data to Moneroo format')
  }
}

async function handleMonerooVerification(paymentId: string, config: any) {
  const MONEROO_API_URL = 'https://api.moneroo.io'
  
  console.log('Moneroo verification for payment ID:', paymentId)
  
  try {
    // Use API key for authentication (Moneroo calls it secret key)
    const authKey = config.moneroo_api_key
    
    if (!authKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Moneroo secret key not configured'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const response = await fetch(`${MONEROO_API_URL}/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authKey}`,
        'Accept': 'application/json'
      }
    })

    console.log('Moneroo verification response status:', response.status)
    
    const data = await response.json()
    console.log('Moneroo verification response:', JSON.stringify(data, null, 2))

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Moneroo API error',
          details: data.message || 'Failed to verify payment',
          status: response.status
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
