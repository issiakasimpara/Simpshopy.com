import { supabase } from '@/integrations/supabase/client';

// Configuration
console.log('🔧 Service e-mail configuré pour utiliser Supabase Edge Functions');

export interface OrderEmailData {
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

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private fromEmail = import.meta.env.VITE_FROM_EMAIL || 'noreply@ecom-express.com';
  private adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@ecom-express.com';

  /**
   * Envoie un e-mail de confirmation de commande au client
   */
  async sendOrderConfirmationToCustomer(orderData: OrderEmailData): Promise<boolean> {
    try {
      console.log('🔧 Configuration e-mail client:', {
        from: this.fromEmail,
        to: orderData.customerEmail,
        apiKey: import.meta.env.VITE_RESEND_API_KEY ? 'Configurée' : 'Manquante'
      });

      const template = this.generateCustomerEmailTemplate(orderData);

      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to: orderData.customerEmail,
        subject: template.subject,
        html: template.html,
      });

      if (error) {
        console.error('❌ Erreur détaillée envoi e-mail client:', {
          error,
          message: error.message,
          name: error.name
        });
        return false;
      }

      console.log('✅ E-mail client envoyé:', data?.id);
      return true;
    } catch (error) {
      console.error('❌ Erreur service e-mail client:', {
        error,
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : undefined
      });
      return false;
    }
  }

  /**
   * Envoie un e-mail de notification de nouvelle commande à l'admin
   */
  async sendOrderNotificationToAdmin(orderData: OrderEmailData): Promise<boolean> {
    try {
      console.log('🔧 Configuration e-mail admin:', {
        from: this.fromEmail,
        to: orderData.storeEmail,
        apiKey: import.meta.env.VITE_RESEND_API_KEY ? 'Configurée' : 'Manquante'
      });

      const template = this.generateAdminEmailTemplate(orderData);

      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to: orderData.storeEmail,
        subject: template.subject,
        html: template.html,
      });

      if (error) {
        console.error('❌ Erreur détaillée envoi e-mail admin:', {
          error,
          message: error.message,
          name: error.name
        });
        return false;
      }

      console.log('✅ E-mail admin envoyé:', data?.id);
      return true;
    } catch (error) {
      console.error('❌ Erreur service e-mail admin:', {
        error,
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        stack: error instanceof Error ? error.stack : undefined
      });
      return false;
    }
  }

  /**
   * Envoie les deux e-mails (client + admin) pour une commande
   * SOLUTION TEMPORAIRE : Simulation pour le développement
   */
  async sendOrderEmails(orderData: OrderEmailData): Promise<{ customer: boolean; admin: boolean }> {
    console.log('📧 SIMULATION - Envoi des e-mails pour la commande:', orderData.orderId);

    try {
      // SIMULATION : En développement, on simule l'envoi
      console.log('📨 E-mail client simulé:', {
        to: orderData.customerEmail,
        subject: `🎉 Commande confirmée #${orderData.orderId} - ${orderData.storeName}`,
        content: 'Confirmation de commande avec détails des produits'
      });

      console.log('📨 E-mail admin simulé:', {
        to: orderData.storeEmail,
        subject: `🔔 Nouvelle commande #${orderData.orderId} - ${orderData.total.toFixed(2)}€`,
        content: 'Notification de nouvelle commande avec infos client'
      });

      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simuler un succès
      const results = { customer: true, admin: true };
      console.log('✅ E-mails simulés envoyés avec succès:', results);

      return results;

    } catch (error) {
      console.error('❌ Erreur simulation e-mails:', error);
      return { customer: false, admin: false };
    }
  }

  /**
   * Génère le template d'e-mail pour le client
   */
  private generateCustomerEmailTemplate(orderData: OrderEmailData): EmailTemplate {
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
    `).join('');

    return {
      to: orderData.customerEmail,
      subject: `🎉 Commande confirmée #${orderData.orderId} - ${orderData.storeName}`,
      html: `
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

              <!-- CTA -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="#" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  📱 Suivre ma commande
                </a>
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
    };
  }

  /**
   * Génère le template d'e-mail pour l'admin
   */
  private generateAdminEmailTemplate(orderData: OrderEmailData): EmailTemplate {
    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${(item.price * item.quantity).toFixed(2)}€</td>
      </tr>
    `).join('');

    return {
      to: orderData.storeEmail,
      subject: `🔔 Nouvelle commande #${orderData.orderId} - ${orderData.total.toFixed(2)}€`,
      html: `
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

              <!-- CTA -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="#" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 12px;">
                  📋 Voir la commande
                </a>
                <a href="mailto:${orderData.customerEmail}" style="display: inline-block; background: #6b7280; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  ✉️ Contacter le client
                </a>
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
    };
  }
}

export const emailService = new EmailService();
