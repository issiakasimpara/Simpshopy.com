import { supabase } from '../integrations/supabase/client';
import { logger } from '@/utils/logger';

// Types pour les données de paiement
export interface RevenueStats {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  averageOrderValue: number;
}

export interface Transaction {
  id: string;
  store_id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method: string;
  payment_gateway: string;
  currency: string;
  product_name: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalRequest {
  id: string;
  store_id: string;
  amount: number;
  currency: string;
  bank_account_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  store_id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  bank_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Service de paiements pour Supabase
export const paymentsService = {
  // Récupérer les statistiques de revenus
  async getRevenueStats(storeId: string): Promise<RevenueStats> {
    try {
      logger.debug('Récupération des statistiques de revenus', { storeId }, 'paymentsService');
      
      const { data, error } = await supabase
        .from('store_revenue_stats')
        .select('*')
        .eq('store_id', storeId)
        .single();

      if (error) {
        console.error('❌ Erreur lors de la récupération des stats:', error);
        throw error;
      }

      if (!data) {
        // Retourner des stats par défaut si aucune donnée
        return {
          totalRevenue: 0,
          monthlyRevenue: 0,
          weeklyRevenue: 0,
          dailyRevenue: 0,
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          averageOrderValue: 0
        };
      }

      logger.debug('Statistiques récupérées', { storeId, totalRevenue: data.totalRevenue, totalTransactions: data.totalTransactions }, 'paymentsService');
      return data;
    } catch (error) {
      console.error('❌ Erreur dans getRevenueStats:', error);
      throw error;
    }
  },

  // Récupérer les transactions
  async getTransactions(storeId: string, limit: number = 50): Promise<Transaction[]> {
    try {
      logger.debug('Récupération des transactions', { storeId }, 'paymentsService');
      
      const { data, error } = await supabase
        .from('store_transactions')
        .select('*')
        .eq('store_id', storeId)
        .order('transaction_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Erreur lors de la récupération des transactions:', error);
        throw error;
      }

      logger.debug('Transactions récupérées', { count: data?.length || 0, storeId }, 'paymentsService');
      return data || [];
    } catch (error) {
      console.error('❌ Erreur dans getTransactions:', error);
      throw error;
    }
  },

  // Récupérer les demandes de retrait
  async getWithdrawals(storeId: string): Promise<WithdrawalRequest[]> {
    try {
      logger.debug('Récupération des demandes de retrait', { storeId }, 'paymentsService');
      
      const { data, error } = await supabase
        .from('store_withdrawals')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération des retraits:', error);
        throw error;
      }

      logger.debug('Retraits récupérés', { count: data?.length || 0, storeId }, 'paymentsService');
      return data || [];
    } catch (error) {
      console.error('❌ Erreur dans getWithdrawals:', error);
      throw error;
    }
  },

  // Récupérer les comptes bancaires
  async getBankAccounts(storeId: string): Promise<BankAccount[]> {
    try {
      logger.debug('Récupération des comptes bancaires', { storeId }, 'paymentsService');
      
      const { data, error } = await supabase
        .from('store_bank_accounts')
        .select('*')
        .eq('store_id', storeId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors de la récupération des comptes bancaires:', error);
        throw error;
      }

      logger.debug('Comptes bancaires récupérés', { count: data?.length || 0, storeId }, 'paymentsService');
      return data || [];
    } catch (error) {
      console.error('❌ Erreur dans getBankAccounts:', error);
      throw error;
    }
  },

  // Créer une demande de retrait
  async createWithdrawal(withdrawalData: {
    storeId: string;
    amount: number;
    currency: string;
    bankAccountId: string;
    reason?: string;
  }): Promise<WithdrawalRequest> {
    try {
      logger.info('Création d\'une demande de retrait', { storeId, amount: withdrawalData.amount }, 'paymentsService');
      
      const { data, error } = await supabase
        .from('store_withdrawals')
        .insert([{
          store_id: withdrawalData.storeId,
          amount: withdrawalData.amount,
          currency: withdrawalData.currency,
          bank_account_id: withdrawalData.bankAccountId,
          status: 'pending',
          reason: withdrawalData.reason
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la création du retrait:', error);
        throw error;
      }

      logger.info('Retrait créé', { withdrawalId: data.id, storeId, amount: data.amount }, 'paymentsService');
      return data;
    } catch (error) {
      console.error('❌ Erreur dans createWithdrawal:', error);
      throw error;
    }
  },

  // Ajouter un compte bancaire
  async addBankAccount(bankAccountData: {
    storeId: string;
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
    isDefault?: boolean;
  }): Promise<BankAccount> {
    try {
      logger.info('Ajout d\'un compte bancaire', { storeId }, 'paymentsService');
      
      // Si c'est le compte par défaut, désactiver les autres
      if (bankAccountData.isDefault) {
        await supabase
          .from('store_bank_accounts')
          .update({ is_default: false })
          .eq('store_id', bankAccountData.storeId);
      }

      const { data, error } = await supabase
        .from('store_bank_accounts')
        .insert([{
          store_id: bankAccountData.storeId,
          account_name: bankAccountData.accountName,
          account_number: bankAccountData.accountNumber,
          bank_name: bankAccountData.bankName,
          bank_code: bankAccountData.bankCode,
          is_default: bankAccountData.isDefault || false
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de l\'ajout du compte bancaire:', error);
        throw error;
      }

      logger.info('Compte bancaire ajouté', { bankAccountId: data.id, storeId }, 'paymentsService');
      return data;
    } catch (error) {
      console.error('❌ Erreur dans addBankAccount:', error);
      throw error;
    }
  },

  // Supprimer un compte bancaire
  async deleteBankAccount(accountId: string): Promise<boolean> {
    try {
      logger.info('Suppression d\'un compte bancaire', { bankAccountId: id, storeId }, 'paymentsService');
      
      const { error } = await supabase
        .from('store_bank_accounts')
        .delete()
        .eq('id', accountId);

      if (error) {
        console.error('❌ Erreur lors de la suppression du compte bancaire:', error);
        throw error;
      }

      logger.info('Compte bancaire supprimé', { bankAccountId: id, storeId }, 'paymentsService');
      return true;
    } catch (error) {
      console.error('❌ Erreur dans deleteBankAccount:', error);
      throw error;
    }
  },

  // Mettre à jour un compte bancaire
  async updateBankAccount(accountId: string, updates: Partial<BankAccount>): Promise<BankAccount> {
    try {
      logger.info('Mise à jour d\'un compte bancaire', { bankAccountId: id, storeId }, 'paymentsService');
      
      const { data, error } = await supabase
        .from('store_bank_accounts')
        .update(updates)
        .eq('id', accountId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la mise à jour du compte bancaire:', error);
        throw error;
      }

      logger.info('Compte bancaire mis à jour', { bankAccountId: data.id, storeId }, 'paymentsService');
      return data;
    } catch (error) {
      console.error('❌ Erreur dans updateBankAccount:', error);
      throw error;
    }
  },

  // Créer une transaction
  async createTransaction(transactionData: {
    storeId: string;
    orderId: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    paymentMethod: string;
    paymentGateway: string;
    currency: string;
    productName: string;
  }): Promise<Transaction> {
    try {
      logger.info('Création d\'une transaction', { storeId, amount: transactionData.amount, type: transactionData.type }, 'paymentsService');
      
      const { data, error } = await supabase
        .from('store_transactions')
        .insert([{
          store_id: transactionData.storeId,
          order_id: transactionData.orderId,
          customer_name: transactionData.customerName,
          customer_email: transactionData.customerEmail,
          amount: transactionData.amount,
          status: transactionData.status,
          payment_method: transactionData.paymentMethod,
          payment_gateway: transactionData.paymentGateway,
          currency: transactionData.currency,
          product_name: transactionData.productName,
          transaction_date: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la création de la transaction:', error);
        throw error;
      }

      logger.info('Transaction créée', { transactionId: data.id, storeId, amount: data.amount }, 'paymentsService');
      return data;
    } catch (error) {
      console.error('❌ Erreur dans createTransaction:', error);
      throw error;
    }
  },

  // Calculer les statistiques de revenus
  async calculateRevenueStats(storeId: string): Promise<RevenueStats> {
    try {
      logger.debug('Calcul des statistiques de revenus', { storeId }, 'paymentsService');
      
      // Récupérer toutes les transactions
      const { data: transactions, error } = await supabase
        .from('store_transactions')
        .select('*')
        .eq('store_id', storeId);

      if (error) {
        console.error('❌ Erreur lors de la récupération des transactions:', error);
        throw error;
      }

      if (!transactions || transactions.length === 0) {
        return {
          totalRevenue: 0,
          monthlyRevenue: 0,
          weeklyRevenue: 0,
          dailyRevenue: 0,
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          averageOrderValue: 0
        };
      }

      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const completedTransactions = transactions.filter(t => t.status === 'completed');
      const successfulTransactions = completedTransactions.length;
      const failedTransactions = transactions.filter(t => t.status === 'failed').length;

      const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
      const monthlyRevenue = completedTransactions
        .filter(t => new Date(t.transaction_date) >= oneMonthAgo)
        .reduce((sum, t) => sum + t.amount, 0);
      const weeklyRevenue = completedTransactions
        .filter(t => new Date(t.transaction_date) >= oneWeekAgo)
        .reduce((sum, t) => sum + t.amount, 0);
      const dailyRevenue = completedTransactions
        .filter(t => new Date(t.transaction_date) >= oneDayAgo)
        .reduce((sum, t) => sum + t.amount, 0);

      const averageOrderValue = successfulTransactions > 0 ? totalRevenue / successfulTransactions : 0;

      const stats: RevenueStats = {
        totalRevenue,
        monthlyRevenue,
        weeklyRevenue,
        dailyRevenue,
        totalTransactions: transactions.length,
        successfulTransactions,
        failedTransactions,
        averageOrderValue
      };

      logger.debug('Statistiques calculées', { storeId, totalRevenue: stats.totalRevenue, totalTransactions: stats.totalTransactions }, 'paymentsService');
      return stats;
    } catch (error) {
      console.error('❌ Erreur dans calculateRevenueStats:', error);
      throw error;
    }
  }
}; 