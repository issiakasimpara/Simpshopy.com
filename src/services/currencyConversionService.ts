import { supabase } from '@/integrations/supabase/client';

export interface CurrencyRate {
  id: string;
  base_currency: string;
  target_currency: string;
  rate: number;
  last_updated: string;
  created_at: string;
}

export interface ConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  rate: number;
  lastUpdated: string;
}

export class CurrencyConversionService {
  /**
   * Convertit un montant d'une devise vers une autre
   */
  static async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<ConversionResult | null> {
    try {
      console.log(`🔄 Conversion: ${amount} ${fromCurrency} → ${toCurrency}`);

      // Si les devises sont identiques, retourner le montant original
      if (fromCurrency === toCurrency) {
        return {
          originalAmount: amount,
          originalCurrency: fromCurrency,
          convertedAmount: amount,
          targetCurrency: toCurrency,
          rate: 1,
          lastUpdated: new Date().toISOString()
        };
      }

      // Chercher le taux de conversion direct
      const { data: directRate, error: directError } = await supabase
        .from('currency_rates')
        .select('*')
        .eq('base_currency', fromCurrency)
        .eq('target_currency', toCurrency)
        .gte('last_updated', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Pas plus vieux que 7 jours
        .single();

      if (directRate) {
        const convertedAmount = amount * directRate.rate;
        console.log(`✅ Conversion directe: ${amount} × ${directRate.rate} = ${convertedAmount}`);
        
        return {
          originalAmount: amount,
          originalCurrency: fromCurrency,
          convertedAmount: convertedAmount,
          targetCurrency: toCurrency,
          rate: directRate.rate,
          lastUpdated: directRate.last_updated
        };
      }

      // Chercher le taux de conversion inverse
      const { data: inverseRate, error: inverseError } = await supabase
        .from('currency_rates')
        .select('*')
        .eq('base_currency', toCurrency)
        .eq('target_currency', fromCurrency)
        .gte('last_updated', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .single();

      if (inverseRate) {
        const convertedAmount = amount / inverseRate.rate;
        const rate = 1 / inverseRate.rate;
        console.log(`✅ Conversion inverse: ${amount} ÷ ${inverseRate.rate} = ${convertedAmount}`);
        
        return {
          originalAmount: amount,
          originalCurrency: fromCurrency,
          convertedAmount: convertedAmount,
          targetCurrency: toCurrency,
          rate: rate,
          lastUpdated: inverseRate.last_updated
        };
      }

      console.log(`❌ Aucun taux de conversion trouvé pour ${fromCurrency} → ${toCurrency}`);
      return null;

    } catch (error) {
      console.error('❌ Erreur lors de la conversion de devise:', error);
      return null;
    }
  }

  /**
   * Obtient le taux de change entre deux devises
   */
  static async getExchangeRate(
    fromCurrency: string,
    toCurrency: string
  ): Promise<number | null> {
    try {
      // Si les devises sont identiques, retourner 1
      if (fromCurrency === toCurrency) {
        return 1;
      }

      // Chercher le taux de conversion direct
      const { data: directRate, error: directError } = await supabase
        .from('currency_rates')
        .select('rate')
        .eq('base_currency', fromCurrency)
        .eq('target_currency', toCurrency)
        .gte('last_updated', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .single();

      if (directRate) {
        return directRate.rate;
      }

      // Chercher le taux de conversion inverse
      const { data: inverseRate, error: inverseError } = await supabase
        .from('currency_rates')
        .select('rate')
        .eq('base_currency', toCurrency)
        .eq('target_currency', fromCurrency)
        .gte('last_updated', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .single();

      if (inverseRate) {
        return 1 / inverseRate.rate;
      }

      return null;

    } catch (error) {
      console.error('❌ Erreur lors de la récupération du taux de change:', error);
      return null;
    }
  }

  /**
   * Met à jour automatiquement les montants dans la base de données lors d'un changement de devise
   */
  static async updateStoreAmounts(
    storeId: string,
    oldCurrency: string,
    newCurrency: string
  ): Promise<boolean> {
    try {
      console.log(`🔄 Mise à jour des montants du store ${storeId}: ${oldCurrency} → ${newCurrency}`);

      // Obtenir le taux de conversion
      const rate = await this.getExchangeRate(oldCurrency, newCurrency);
      if (!rate) {
        console.error('❌ Impossible d\'obtenir le taux de conversion');
        return false;
      }

      console.log(`📊 Taux de conversion: ${rate}`);

      // Mettre à jour les prix des produits
      const { error: productsError } = await supabase
        .from('products')
        .update({
          price: supabase.rpc('convert_currency', {
            amount: supabase.raw('price'),
            from_currency: oldCurrency,
            to_currency: newCurrency
          })
        })
        .eq('store_id', storeId);

      if (productsError) {
        console.error('❌ Erreur lors de la mise à jour des produits:', productsError);
      } else {
        console.log('✅ Prix des produits mis à jour');
      }

      // Mettre à jour les montants des commandes
      const { error: ordersError } = await supabase
        .from('orders')
        .update({
          total_amount: supabase.rpc('convert_currency', {
            amount: supabase.raw('total_amount'),
            from_currency: oldCurrency,
            to_currency: newCurrency
          })
        })
        .eq('store_id', storeId);

      if (ordersError) {
        console.error('❌ Erreur lors de la mise à jour des commandes:', ordersError);
      } else {
        console.log('✅ Montants des commandes mis à jour');
      }

      // Mettre à jour les montants des paiements
      const { error: paymentsError } = await supabase
        .from('payments')
        .update({
          amount: supabase.rpc('convert_currency', {
            amount: supabase.raw('amount'),
            from_currency: oldCurrency,
            to_currency: newCurrency
          })
        })
        .eq('store_id', storeId);

      if (paymentsError) {
        console.error('❌ Erreur lors de la mise à jour des paiements:', paymentsError);
      } else {
        console.log('✅ Montants des paiements mis à jour');
      }

      console.log('✅ Mise à jour des montants terminée');
      return true;

    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des montants:', error);
      return false;
    }
  }

  /**
   * Récupère tous les taux de change disponibles
   */
  static async getAllRates(): Promise<CurrencyRate[]> {
    try {
      const { data, error } = await supabase
        .from('currency_rates')
        .select('*')
        .gte('last_updated', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('base_currency')
        .order('target_currency');

      if (error) {
        console.error('❌ Erreur lors de la récupération des taux:', error);
        return [];
      }

      return data || [];

    } catch (error) {
      console.error('❌ Erreur lors de la récupération des taux:', error);
      return [];
    }
  }

  /**
   * Force la mise à jour des taux de change en appelant l'Edge Function
   */
  static async forceUpdateRates(): Promise<boolean> {
    try {
      console.log('🔄 Forcer la mise à jour des taux de change...');

      const response = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/update-currency-rates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Mise à jour forcée terminée:', result);

      return result.success;

    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour forcée:', error);
      return false;
    }
  }
}
