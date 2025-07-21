import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  storeName: string;
  storeEmail: string;
  estimatedDelivery?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderData }: { orderData: OrderEmailData } = await req.json()
    
    console.log('📧 Envoi des e-mails pour commande:', orderData.orderId)

    // Configuration Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY non configurée')
    }

    // Template e-mail client
    const customerEmailHtml = generateCustomerEmailTemplate(orderData)
    
    // Template e-mail admin
    const adminEmailHtml = generateAdminEmailTemplate(orderData)

    // Envoyer e-mail client
    const customerEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: orderData.customerEmail,
        subject: `🎉 Commande confirmée #${orderData.orderId} - ${orderData.storeName}`,
        html: customerEmailHtml,
      }),
    })

    // Envoyer e-mail admin
    const adminEmailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: orderData.storeEmail,
        subject: `🔔 Nouvelle commande #${orderData.orderId} - ${orderData.total.toFixed(2)}€`,
        html: adminEmailHtml,
      }),
    })

    const customerResult = customerEmailResponse.ok
    const adminResult = adminEmailResponse.ok

    if (!customerResult) {
      const customerError = await customerEmailResponse.text()
      console.error('❌ Erreur e-mail client:', customerError)
    }

    if (!adminResult) {
      const adminError = await adminEmailResponse.text()
      console.error('❌ Erreur e-mail admin:', adminError)
    }

    console.log('📊 Résultats:', { customer: customerResult, admin: adminResult })

    return new Response(
      JSON.stringify({ 
        success: true, 
        results: { customer: customerResult, admin: adminResult } 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Erreur fonction e-mail:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

function generateCustomerEmailTemplate(orderData: OrderEmailData): string {
  const itemsHtml = orderData.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">` : ''}
          <div>
            <div style="font-weight: 600; color: #1f2937;">${item.name}</div>
            <div style="color: #6b7280; font-size: 14px;">Quantité: ${item.quantity}</div>
          </div>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">
        ${(item.price * item.quantity).toFixed(2)}€
      </td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Commande confirmée</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🎉 Commande confirmée !</h1>
          <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Merci pour votre commande ${orderData.customerName}</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">
          
          <!-- Order Info -->
          <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 12px 0; color: #1f2937; font-size: 18px;">📦 Détails de votre commande</h2>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Numéro de commande:</span>
              <span style="font-weight: 600; color: #1f2937;">#${orderData.orderId}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Boutique:</span>
              <span style="font-weight: 600; color: #1f2937;">${orderData.storeName}</span>
            </div>
            ${orderData.estimatedDelivery ? `
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">Livraison estimée:</span>
              <span style="font-weight: 600; color: #059669;">${orderData.estimatedDelivery}</span>
            </div>
            ` : ''}
          </div>

          <!-- Items -->
          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px;">🛍️ Produits commandés</h3>
            <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
              ${itemsHtml}
            </table>
          </div>

          <!-- Total -->
          <div style="background-color: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6b7280;">Sous-total:</span>
              <span>${orderData.subtotal.toFixed(2)}€</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="color: #6b7280;">Livraison:</span>
              <span>${orderData.shipping.toFixed(2)}€</span>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 12px 0;">
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: 700; color: #1f2937;">
              <span>Total:</span>
              <span>${orderData.total.toFixed(2)}€</span>
            </div>
          </div>

          <!-- Shipping Address -->
          <div style="background-color: #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px;">📍 Adresse de livraison</h3>
            <div style="color: #92400e;">
              <div style="font-weight: 600;">${orderData.customerName}</div>
              <div>${orderData.shippingAddress.street}</div>
              <div>${orderData.shippingAddress.postalCode} ${orderData.shippingAddress.city}</div>
              <div>${orderData.shippingAddress.country}</div>
              ${orderData.customerPhone ? `<div>📱 ${orderData.customerPhone}</div>` : ''}
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p>Merci de votre confiance ! 💙</p>
            <p>Une question ? Contactez-nous à <a href="mailto:${orderData.storeEmail}" style="color: #667eea;">${orderData.storeEmail}</a></p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `
}

function generateAdminEmailTemplate(orderData: OrderEmailData): string {
  const itemsHtml = orderData.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${(item.price * item.quantity).toFixed(2)}€</td>
    </tr>
  `).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nouvelle commande</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700;">🔔 Nouvelle commande !</h1>
          <p style="margin: 8px 0 0 0; font-size: 16px; opacity: 0.9;">Commande #${orderData.orderId} - ${orderData.total.toFixed(2)}€</p>
        </div>

        <!-- Content -->
        <div style="padding: 32px 24px;">
          
          <!-- Customer Info -->
          <div style="background-color: #f0f9ff; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 16px 0; color: #0c4a6e; font-size: 18px;">👤 Informations client</h2>
            <div style="color: #0c4a6e;">
              <div style="margin-bottom: 8px;"><strong>Nom:</strong> ${orderData.customerName}</div>
              <div style="margin-bottom: 8px;"><strong>E-mail:</strong> <a href="mailto:${orderData.customerEmail}" style="color: #0284c7;">${orderData.customerEmail}</a></div>
              ${orderData.customerPhone ? `<div style="margin-bottom: 8px;"><strong>Téléphone:</strong> ${orderData.customerPhone}</div>` : ''}
              <div><strong>Adresse:</strong><br>
                ${orderData.shippingAddress.street}<br>
                ${orderData.shippingAddress.postalCode} ${orderData.shippingAddress.city}<br>
                ${orderData.shippingAddress.country}
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div style="margin-bottom: 24px;">
            <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px;">📦 Produits commandés</h3>
            <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: #374151;">Produit</th>
                  <th style="padding: 12px 8px; text-align: center; font-weight: 600; color: #374151;">Qté</th>
                  <th style="padding: 12px 8px; text-align: right; font-weight: 600; color: #374151;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Total -->
          <div style="background-color: #f0fdf4; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #166534;">
              <span>Sous-total:</span>
              <span>${orderData.subtotal.toFixed(2)}€</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px; color: #166534;">
              <span>Livraison:</span>
              <span>${orderData.shipping.toFixed(2)}€</span>
            </div>
            <hr style="border: none; border-top: 1px solid #bbf7d0; margin: 12px 0;">
            <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: 700; color: #166534;">
              <span>Total:</span>
              <span>${orderData.total.toFixed(2)}€</span>
            </div>
          </div>

          <!-- Actions -->
          <div style="background-color: #fef3c7; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px;">⚡ Actions à effectuer</h3>
            <div style="color: #92400e;">
              <div style="margin-bottom: 8px;">✅ Préparer la commande</div>
              <div style="margin-bottom: 8px;">✅ Organiser l'expédition</div>
              <div style="margin-bottom: 8px;">✅ Envoyer le numéro de suivi au client</div>
              <div>✅ Mettre à jour le statut de la commande</div>
            </div>
          </div>

          <!-- Footer -->
          <div style="text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p>Commande reçue le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            <p>Boutique: ${orderData.storeName}</p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `
}
