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

      // Utiliser la fonction PostgreSQL directement
      const { data, error } = await supabase.rpc('convert_currency', {
        amount: amount,
        from_currency: fromCurrency,
        to_currency: toCurrency
      });

      if (error) {
        console.error('❌ Erreur lors de la conversion:', error);
        return null;
      }

      if (data !== null) {
        return {
          originalAmount: amount,
          originalCurrency: fromCurrency,
          convertedAmount: data,
          targetCurrency: toCurrency,
          rate: data / amount,
          lastUpdated: new Date().toISOString()
        };
      }

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

      // Utiliser la fonction PostgreSQL directement
      const { data, error } = await supabase.rpc('get_exchange_rate', {
        from_currency: fromCurrency,
        to_currency: toCurrency
      });

      if (error) {
        console.error('❌ Erreur lors de la récupération du taux:', error);
        return null;
      }

      return data;

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

      // Mettre à jour les prix des produits - Version simplifiée
      const { data: products, error: productsFetchError } = await supabase
        .from('products')
        .select('id, price')
        .eq('store_id', storeId);

      if (productsFetchError) {
        console.error('❌ Erreur lors de la récupération des produits:', productsFetchError);
      } else if (products && products.length > 0) {
        // Mettre à jour chaque produit individuellement
        for (const product of products) {
          const newPrice = product.price * rate;
          const { error: updateError } = await supabase
            .from('products')
            .update({ price: newPrice })
            .eq('id', product.id);

          if (updateError) {
            console.error(`❌ Erreur lors de la mise à jour du produit ${product.id}:`, updateError);
          }
        }
        console.log(`✅ Prix de ${products.length} produits mis à jour`);
      }

      // Mettre à jour les montants des commandes - Version simplifiée
      const { data: orders, error: ordersFetchError } = await supabase
        .from('public_orders')
        .select('id, total_amount')
        .eq('store_id', storeId);

      if (ordersFetchError) {
        console.error('❌ Erreur lors de la récupération des commandes:', ordersFetchError);
      } else if (orders && orders.length > 0) {
        // Mettre à jour chaque commande individuellement
        for (const order of orders) {
          const newAmount = order.total_amount * rate;
          const { error: updateError } = await supabase
            .from('public_orders')
            .update({ total_amount: newAmount })
            .eq('id', order.id);

          if (updateError) {
            console.error(`❌ Erreur lors de la mise à jour de la commande ${order.id}:`, updateError);
          }
        }
        console.log(`✅ Montants de ${orders.length} commandes mis à jour`);
      }

      // Mettre à jour les montants des paiements - Version simplifiée
      const { data: payments, error: paymentsFetchError } = await supabase
        .from('payments')
        .select('id, amount')
        .eq('store_id', storeId);

      if (paymentsFetchError) {
        console.error('❌ Erreur lors de la récupération des paiements:', paymentsFetchError);
      } else if (payments && payments.length > 0) {
        // Mettre à jour chaque paiement individuellement
        for (const payment of payments) {
          const newAmount = payment.amount * rate;
          const { error: updateError } = await supabase
            .from('payments')
            .update({ amount: newAmount })
            .eq('id', payment.id);

          if (updateError) {
            console.error(`❌ Erreur lors de la mise à jour du paiement ${payment.id}:`, updateError);
          }
        }
        console.log(`✅ Montants de ${payments.length} paiements mis à jour`);
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
        .from('currency_rates' as any)
        .select('*')
        .gte('last_updated', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('base_currency')
        .order('target_currency');

      if (error) {
        console.error('❌ Erreur lors de la récupération des taux:', error);
        return [];
      }

      return (data as CurrencyRate[]) || [];

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
