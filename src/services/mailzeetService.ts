import { supabase } from '@/integrations/supabase/client';

export interface MailzeetConfig {
  apiKey: string;
  serverName: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  variables: string[];
}

export interface EmailData {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  variables?: Record<string, any>;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class MailzeetService {
  private config: MailzeetConfig | null = null;

  /**
   * Initialiser la configuration Mailzeet
   */
  async initializeConfig(storeId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('mailzeet_configurations')
        .select('*')
        .eq('store_id', storeId)
        .eq('enabled', true)
        .single();

      if (error || !data) {
        console.error('❌ Configuration Mailzeet non trouvée:', error);
        return false;
      }

      this.config = {
        apiKey: data.api_key,
        serverName: data.server_name,
        fromEmail: data.from_email,
        fromName: data.from_name
      };

      console.log('✅ Configuration Mailzeet initialisée');
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation Mailzeet:', error);
      return false;
    }
  }

  /**
   * Envoyer un email via Mailzeet
   */
  async sendEmail(emailData: EmailData): Promise<EmailResponse> {
    if (!this.config) {
      return { success: false, error: 'Configuration Mailzeet non initialisée' };
    }

    try {
      const response = await fetch('https://api.mailzeet.com/v1/mails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: {
            email: this.config.fromEmail,
            name: this.config.fromName
          },
          recipients: [{
            email: emailData.to,
            name: emailData.toName || emailData.to
          }],
          subject: emailData.subject,
          html: emailData.html,
          server: this.config.serverName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Mailzeet API Error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      
      // Logger l'envoi d'email
      await this.logEmailSent(emailData, result.id, true);
      
      return {
        success: true,
        messageId: result.id
      };
    } catch (error) {
      console.error('❌ Erreur envoi email Mailzeet:', error);
      
      // Logger l'erreur
      await this.logEmailSent(emailData, null, false, error instanceof Error ? error.message : 'Erreur inconnue');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Envoyer un email de confirmation de commande
   */
  async sendOrderConfirmationEmail(orderData: any, storeData: any): Promise<EmailResponse> {
    const template = this.generateOrderConfirmationTemplate(orderData, storeData);
    
    return this.sendEmail({
      to: orderData.customer_email,
      toName: orderData.customer_name,
      subject: `✅ Confirmation de commande #${orderData.id.slice(-6)} - ${storeData.name}`,
      html: template,
      variables: {
        orderId: orderData.id,
        customerName: orderData.customer_name,
        storeName: storeData.name,
        totalAmount: orderData.total_amount,
        orderDate: new Date(orderData.created_at).toLocaleDateString('fr-FR')
      }
    });
  }

  /**
   * Envoyer un email de notification admin
   */
  async sendAdminNotificationEmail(orderData: any, storeData: any, adminEmail: string): Promise<EmailResponse> {
    const template = this.generateAdminNotificationTemplate(orderData, storeData);
    
    return this.sendEmail({
      to: adminEmail,
      subject: `🎉 Nouvelle commande #${orderData.id.slice(-6)} - ${storeData.name}`,
      html: template,
      variables: {
        orderId: orderData.id,
        customerName: orderData.customer_name,
        customerEmail: orderData.customer_email,
        storeName: storeData.name,
        totalAmount: orderData.total_amount
      }
    });
  }

  /**
   * Envoyer un email de changement de statut
   */
  async sendStatusUpdateEmail(orderData: any, storeData: any, newStatus: string): Promise<EmailResponse> {
    const template = this.generateStatusUpdateTemplate(orderData, storeData, newStatus);
    
    return this.sendEmail({
      to: orderData.customer_email,
      toName: orderData.customer_name,
      subject: `📦 Mise à jour commande #${orderData.id.slice(-6)} - ${newStatus}`,
      html: template,
      variables: {
        orderId: orderData.id,
        customerName: orderData.customer_name,
        storeName: storeData.name,
        newStatus: newStatus,
        orderDate: new Date(orderData.created_at).toLocaleDateString('fr-FR')
      }
    });
  }

  /**
   * Envoyer un email de newsletter
   */
  async sendNewsletterEmail(recipients: string[], subject: string, content: string, storeData: any): Promise<EmailResponse[]> {
    const results: EmailResponse[] = [];
    
    for (const recipient of recipients) {
      const result = await this.sendEmail({
        to: recipient,
        subject: subject,
        html: content,
        variables: {
          storeName: storeData.name,
          storeUrl: storeData.domain
        }
      });
      results.push(result);
    }
    
    return results;
  }

  /**
   * Générer le template de confirmation de commande
   */
  private generateOrderConfirmationTemplate(orderData: any, storeData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirmation de commande</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px 0; }
          .order-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
          .button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Commande confirmée !</h1>
            <p>Merci pour votre commande chez ${storeData.name}</p>
          </div>
          
          <div class="content">
            <p>Bonjour ${orderData.customer_name},</p>
            
            <p>Votre commande a été confirmée et est en cours de traitement.</p>
            
            <div class="order-details">
              <h3>📦 Détails de votre commande</h3>
              <p><strong>Numéro de commande :</strong> #${orderData.id.slice(-6)}</p>
              <p><strong>Date :</strong> ${new Date(orderData.created_at).toLocaleDateString('fr-FR')}</p>
              <p><strong>Montant total :</strong> ${orderData.total_amount} CFA</p>
              <p><strong>Statut :</strong> En préparation</p>
            </div>
            
            <p>Nous vous tiendrons informé de l'avancement de votre commande.</p>
            
            <p>Merci de votre confiance !</p>
            <p><strong>L'équipe ${storeData.name}</strong></p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Générer le template de notification admin
   */
  private generateAdminNotificationTemplate(orderData: any, storeData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Nouvelle commande</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px 0; }
          .order-details { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .customer-info { background: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Nouvelle commande reçue !</h1>
            <p>Commande #${orderData.id.slice(-6)}</p>
          </div>
          
          <div class="content">
            <div class="customer-info">
              <h3>👤 Informations client</h3>
              <p><strong>Nom :</strong> ${orderData.customer_name}</p>
              <p><strong>Email :</strong> ${orderData.customer_email}</p>
              <p><strong>Téléphone :</strong> ${orderData.shipping_address?.phone || 'Non renseigné'}</p>
            </div>
            
            <div class="order-details">
              <h3>💰 Détails de la commande</h3>
              <p><strong>Numéro :</strong> #${orderData.id.slice(-6)}</p>
              <p><strong>Date :</strong> ${new Date(orderData.created_at).toLocaleDateString('fr-FR')}</p>
              <p><strong>Montant total :</strong> ${orderData.total_amount} CFA</p>
              <p><strong>Méthode de paiement :</strong> ${orderData.payment_method || 'Non spécifiée'}</p>
            </div>
            
            <p>Connectez-vous à votre tableau de bord pour traiter cette commande.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Générer le template de mise à jour de statut
   */
  private generateStatusUpdateTemplate(orderData: any, storeData: any, newStatus: string): string {
    const statusEmojis: Record<string, string> = {
      'confirmed': '✅',
      'preparing': '📦',
      'shipped': '🚚',
      'delivered': '🎉',
      'cancelled': '❌'
    };

    const statusTexts: Record<string, string> = {
      'confirmed': 'confirmée',
      'preparing': 'en préparation',
      'shipped': 'expédiée',
      'delivered': 'livrée',
      'cancelled': 'annulée'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Mise à jour de commande</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #17a2b8; color: white; padding: 20px; text-align: center; border-radius: 8px; }
          .content { padding: 20px 0; }
          .status-update { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${statusEmojis[newStatus] || '📦'} Mise à jour de commande</h1>
            <p>Commande #${orderData.id.slice(-6)}</p>
          </div>
          
          <div class="content">
            <p>Bonjour ${orderData.customer_name},</p>
            
            <div class="status-update">
              <h3>📦 Statut de votre commande</h3>
              <p>Votre commande #${orderData.id.slice(-6)} est maintenant <strong>${statusTexts[newStatus] || newStatus}</strong>.</p>
            </div>
            
            <p>Nous vous tiendrons informé de toute nouvelle mise à jour.</p>
            
            <p>Merci de votre confiance !</p>
            <p><strong>L'équipe ${storeData.name}</strong></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Logger l'envoi d'email
   */
  private async logEmailSent(emailData: EmailData, messageId: string | null, success: boolean, error?: string): Promise<void> {
    try {
      await supabase
        .from('email_logs')
        .insert({
          recipient: emailData.to,
          subject: emailData.subject,
          message_id: messageId,
          success: success,
          error_message: error,
          sent_at: new Date().toISOString()
        });
    } catch (logError) {
      console.error('❌ Erreur logging email:', logError);
    }
  }

  /**
   * Tester la configuration Mailzeet
   */
  async testConfiguration(): Promise<{ success: boolean; error?: string }> {
    if (!this.config) {
      return { success: false, error: 'Configuration non initialisée' };
    }

    try {
      const testEmail = {
        to: this.config.fromEmail, // Envoyer à soi-même pour le test
        subject: 'Test Mailzeet - Simpshopy',
        html: '<p>Ceci est un email de test pour vérifier la configuration Mailzeet.</p>'
      };

      const result = await this.sendEmail(testEmail);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de test'
      };
    }
  }
}

export const mailzeetService = new MailzeetService();
