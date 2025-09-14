import { supabase } from '@/integrations/supabase/client'
import { logger } from '@/utils/logger'

export interface CustomerData {
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  store_name?: string
}

export interface MailchimpAnalytics {
  subscribers: number
  open_rate: number
  click_rate: number
  campaigns: number
}

class MailchimpService {
  /**
   * Synchroniser un client vers Mailchimp
   */
  async syncCustomer(userId: string, storeId: string, customerData: CustomerData) {
    try {
      logger.info('Synchronisation client vers Mailchimp', { email: customerData.email }, 'mailchimpService')
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mailchimp-sync-customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          storeId,
          customerData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la synchronisation')
      }

      const result = await response.json()
      logger.info('Client synchronisé', { email: customerData.email, result }, 'mailchimpService')
      return result
    } catch (error) {
      console.error('❌ Erreur synchronisation client:', error)
      throw error
    }
  }

  /**
   * Récupérer les analytics Mailchimp en temps réel
   */
  async getAnalytics(userId: string, storeId: string): Promise<MailchimpAnalytics> {
    try {
      logger.debug('Récupération analytics Mailchimp', undefined, 'mailchimpService')
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mailchimp-analytics`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          storeId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la récupération des analytics')
      }

      const result = await response.json()
      logger.info('Analytics récupérés', { result }, 'mailchimpService')
      return result.data
    } catch (error) {
      console.error('❌ Erreur récupération analytics:', error)
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        subscribers: 0,
        open_rate: 0,
        click_rate: 0,
        campaigns: 0
      }
    }
  }

  /**
   * Vérifier si l'intégration Mailchimp est active
   */
  async isIntegrationActive(userId: string, storeId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('oauth_integrations')
        .select('id')
        .eq('user_id', userId)
        .eq('store_id', storeId)
        .eq('provider', 'mailchimp')
        .eq('is_active', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erreur vérification intégration:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('❌ Erreur vérification intégration:', error)
      return false
    }
  }

  /**
   * Synchroniser automatiquement lors d'une nouvelle commande
   */
  async syncOrderCustomer(userId: string, storeId: string, orderData: any) {
    try {
      // Vérifier si l'intégration est active
      const isActive = await this.isIntegrationActive(userId, storeId)
      if (!isActive) {
        logger.info('Intégration Mailchimp non active, synchronisation ignorée', undefined, 'mailchimpService')
        return
      }

      // Préparer les données du client
      const customerData: CustomerData = {
        email: orderData.customer_email,
        first_name: orderData.customer_first_name,
        last_name: orderData.customer_last_name,
        phone: orderData.customer_phone,
        store_name: orderData.store_name || 'Simpshopy Store'
      }

      // Synchroniser le client
      await this.syncCustomer(userId, storeId, customerData)
      
      logger.info('Client de commande synchronisé vers Mailchimp', { email: customerData.email }, 'mailchimpService')
    } catch (error) {
      console.error('❌ Erreur synchronisation client de commande:', error)
      // Ne pas faire échouer la commande si la synchronisation échoue
    }
  }

  /**
   * Synchroniser automatiquement lors d'une nouvelle inscription
   */
  async syncNewCustomer(userId: string, storeId: string, customerData: CustomerData) {
    try {
      // Vérifier si l'intégration est active
      const isActive = await this.isIntegrationActive(userId, storeId)
      if (!isActive) {
        logger.info('Intégration Mailchimp non active, synchronisation ignorée', undefined, 'mailchimpService')
        return
      }

      // Synchroniser le client
      await this.syncCustomer(userId, storeId, customerData)
      
      console.log('✅ Nouveau client synchronisé vers Mailchimp')
    } catch (error) {
      console.error('❌ Erreur synchronisation nouveau client:', error)
      // Ne pas faire échouer l'inscription si la synchronisation échoue
    }
  }
}

export const mailchimpService = new MailchimpService()
