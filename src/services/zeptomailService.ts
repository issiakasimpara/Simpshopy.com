import { SendMailClient } from "zeptomail";

export interface OrderData {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  total_amount: number;
  shipping_address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  shipping_method?: {
    delivery_time: string;
  };
  status: string;
  created_at: string;
}

export interface StoreData {
  id: string;
  name: string;
  domain?: string;
  merchant_id: string;
}

class ZeptoMailService {
  private client: SendMailClient;

  constructor() {
    const url = "api.zeptomail.com/";
    const token = "Zoho-enczapikey wSsVR61/rx72DvwulDf4c+cwmggEUln0R0h0jlbwvyD9T6yWosc5kRGdUQf1FaIdE2FrFTFHoO8pnxgE1TQNjol7nAoAXSiF9mqRe1U4J3x17qnvhDzOX2lakxuAKYsAwwxvnWZgE84r+g==";
    
    this.client = new SendMailClient({ url, token });
  }

  async sendOrderConfirmation(orderData: OrderData, storeData: StoreData) {
    try {
      console.log('📧 Envoi email confirmation client:', orderData.customer_email);
      
      const response = await this.client.sendMail({
        from: {
          address: "mail@simpshopy.com",
          name: storeData.name || "SimpShopy"
        },
        to: [{
          email_address: {
            address: orderData.customer_email,
            name: orderData.customer_name
          }
        }],
        subject: `✅ Confirmation de commande #${orderData.order_number}`,
        htmlbody: this.generateCustomerEmailTemplate(orderData, storeData)
      });

      console.log('✅ Email client envoyé avec succès:', response);
      return { success: true, response };
    } catch (error) {
      console.error('❌ Erreur envoi email client:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  async sendAdminNotification(orderData: OrderData, storeData: StoreData, adminEmail: string) {
    try {
      console.log('📧 Envoi email notification admin:', adminEmail);
      
      const response = await this.client.sendMail({
        from: {
          address: "mail@simpshopy.com",
          name: storeData.name || "SimpShopy"
        },
        to: [{
          email_address: {
            address: adminEmail,
            name: "Administrateur"
          }
        }],
        subject: `🎉 Nouvelle commande #${orderData.order_number} - ${storeData.name}`,
        htmlbody: this.generateAdminEmailTemplate(orderData, storeData)
      });

      console.log('✅ Email admin envoyé avec succès:', response);
      return { success: true, response };
    } catch (error) {
      console.error('❌ Erreur envoi email admin:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  private generateCustomerEmailTemplate(orderData: OrderData, storeData: StoreData): string {
    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; vertical-align: top;">
          <div style="font-weight: 500; color: #333;">${item.name}</div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; vertical-align: top;">
          <div style="color: #666;">${item.quantity}x</div>
          <div style="font-weight: 500; color: #333;">${item.price} CFA</div>
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation de commande</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
              ✅ Commande Confirmée
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              Commande #${orderData.order_number}
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px 20px;">
            
            <!-- Greeting -->
            <div style="margin-bottom: 25px;">
              <p style="font-size: 16px; color: #333; margin: 0 0 10px 0;">
                Bonjour <strong style="color: #28a745;">${orderData.customer_name}</strong>,
              </p>
              <p style="font-size: 16px; color: #666; margin: 0; line-height: 1.5;">
                Votre commande a été confirmée et est en cours de traitement. Nous vous tiendrons informé de son avancement.
              </p>
            </div>

            <!-- Order Details -->
            <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="margin: 0 0 20px 0; color: #333; font-size: 20px; font-weight: 600;">
                📦 Détails de votre commande
              </h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
              </table>
              
              <hr style="border: none; border-top: 2px solid #e9ecef; margin: 20px 0;">
              
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: 600; color: #333;">
                <span>Total :</span>
                <span style="color: #28a745; font-size: 24px;">${orderData.total_amount} CFA</span>
              </div>
            </div>

            <!-- Shipping Info -->
            ${orderData.shipping_address ? `
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
              <h4 style="margin: 0 0 15px 0; color: #1976d2; font-size: 18px; font-weight: 600;">
                🚚 Adresse de livraison
              </h4>
              <div style="color: #666; line-height: 1.6;">
                <div style="font-weight: 500; color: #333;">${orderData.customer_name}</div>
                <div>${orderData.shipping_address.street}</div>
                <div>${orderData.shipping_address.city}, ${orderData.shipping_address.postal_code}</div>
                <div>${orderData.shipping_address.country}</div>
              </div>
              ${orderData.shipping_method?.delivery_time ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #bbdefb;">
                  <strong style="color: #1976d2;">Délai estimé :</strong> ${orderData.shipping_method.delivery_time}
                </div>
              ` : ''}
            </div>
            ` : ''}

            <!-- Next Steps -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="margin: 0 0 10px 0; color: #856404; font-size: 16px; font-weight: 600;">
                📋 Prochaines étapes
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #856404;">
                <li>Votre commande est en cours de préparation</li>
                <li>Vous recevrez un email de confirmation d'expédition</li>
                <li>Un numéro de suivi vous sera communiqué</li>
              </ul>
            </div>

            <!-- Thank You -->
            <div style="text-align: center; margin: 30px 0;">
              <p style="font-size: 16px; color: #666; margin: 0 0 10px 0;">
                Merci de votre confiance !
              </p>
              <p style="font-size: 18px; font-weight: 600; color: #333; margin: 0;">
                ${storeData.name}
              </p>
            </div>

          </div>

          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="font-size: 14px; color: #666; margin: 0;">
              Cet email a été envoyé automatiquement par SimpShopy
            </p>
          </div>

        </div>
      </body>
      </html>
    `;
  }

  private generateAdminEmailTemplate(orderData: OrderData, storeData: StoreData): string {
    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; vertical-align: top;">
          <div style="font-weight: 500; color: #333;">${item.name}</div>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right; vertical-align: top;">
          <div style="color: #666;">${item.quantity}x</div>
          <div style="font-weight: 500; color: #333;">${item.price} CFA</div>
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouvelle commande</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); padding: 30px 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">
              🎉 Nouvelle Commande !
            </h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
              Commande #${orderData.order_number}
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px 20px;">
            
            <!-- Alert -->
            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
              <h3 style="margin: 0 0 10px 0; color: #155724; font-size: 18px; font-weight: 600;">
                ⚡ Action requise
              </h3>
              <p style="margin: 0; color: #155724; font-size: 16px;">
                Une nouvelle commande a été reçue et nécessite votre attention.
              </p>
            </div>

            <!-- Customer Info -->
            <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="margin: 0 0 20px 0; color: #333; font-size: 20px; font-weight: 600;">
                👤 Informations client
              </h3>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <div style="font-weight: 600; color: #666; font-size: 14px; margin-bottom: 5px;">NOM</div>
                  <div style="font-size: 16px; color: #333; font-weight: 500;">${orderData.customer_name}</div>
                </div>
                <div>
                  <div style="font-weight: 600; color: #666; font-size: 14px; margin-bottom: 5px;">EMAIL</div>
                  <div style="font-size: 16px; color: #333; font-weight: 500;">${orderData.customer_email}</div>
                </div>
                <div>
                  <div style="font-weight: 600; color: #666; font-size: 14px; margin-bottom: 5px;">TÉLÉPHONE</div>
                  <div style="font-size: 16px; color: #333; font-weight: 500;">${orderData.customer_phone || 'Non renseigné'}</div>
                </div>
                <div>
                  <div style="font-weight: 600; color: #666; font-size: 14px; margin-bottom: 5px;">STATUT</div>
                  <div style="font-size: 16px; color: #28a745; font-weight: 500; text-transform: uppercase;">${orderData.status}</div>
                </div>
              </div>
            </div>

            <!-- Order Details -->
            <div style="background: #f8f9fa; border-radius: 12px; padding: 25px; margin: 25px 0;">
              <h3 style="margin: 0 0 20px 0; color: #333; font-size: 20px; font-weight: 600;">
                💰 Détails de la commande
              </h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
              </table>
              
              <hr style="border: none; border-top: 2px solid #e9ecef; margin: 20px 0;">
              
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: 600; color: #333;">
                <span>Total :</span>
                <span style="color: #007bff; font-size: 24px;">${orderData.total_amount} CFA</span>
              </div>
            </div>

            <!-- Shipping Address -->
            ${orderData.shipping_address ? `
            <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
              <h4 style="margin: 0 0 15px 0; color: #1976d2; font-size: 18px; font-weight: 600;">
                🚚 Adresse de livraison
              </h4>
              <div style="color: #666; line-height: 1.6;">
                <div style="font-weight: 500; color: #333;">${orderData.customer_name}</div>
                <div>${orderData.shipping_address.street}</div>
                <div>${orderData.shipping_address.city}, ${orderData.shipping_address.postal_code}</div>
                <div>${orderData.shipping_address.country}</div>
              </div>
            </div>
            ` : ''}

            <!-- Action Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://simpshopy.com/admin/orders" 
                 style="display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                📋 Gérer la commande
              </a>
            </div>

            <!-- Order Info -->
            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 25px 0;">
              <h4 style="margin: 0 0 15px 0; color: #333; font-size: 16px; font-weight: 600;">
                📋 Informations de commande
              </h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
                <div>
                  <span style="color: #666;">Numéro :</span>
                  <span style="color: #333; font-weight: 500;">#${orderData.order_number}</span>
                </div>
                <div>
                  <span style="color: #666;">Date :</span>
                  <span style="color: #333; font-weight: 500;">${new Date(orderData.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <div>
                  <span style="color: #666;">Heure :</span>
                  <span style="color: #333; font-weight: 500;">${new Date(orderData.created_at).toLocaleTimeString('fr-FR')}</span>
                </div>
                <div>
                  <span style="color: #666;">Boutique :</span>
                  <span style="color: #333; font-weight: 500;">${storeData.name}</span>
                </div>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="font-size: 14px; color: #666; margin: 0;">
              Notification automatique - SimpShopy
            </p>
          </div>

        </div>
      </body>
      </html>
    `;
  }
}

export const zeptoMailService = new ZeptoMailService();
