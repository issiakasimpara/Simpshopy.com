import { supabase } from '@/integrations/supabase/client';

export interface StoreTemplate {
  id: string;
  name: string;
  sector: string;
  description: string;
  features: string[];
  theme: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
  };
  default_products: Array<{
    name: string;
    description: string;
    price: number;
    category: string;
  }>;
  settings: {
    enable_reviews: boolean;
    enable_wishlist: boolean;
    enable_related_products: boolean;
    enable_newsletter: boolean;
    enable_social_sharing: boolean;
  };
}

export interface TemplateConfig {
  sector: string;
  template: StoreTemplate;
  is_default: boolean;
}

export class StoreTemplateService {
  /**
   * Récupérer le template approprié basé sur le secteur
   */
  static async getTemplateForSector(sector: string): Promise<StoreTemplate | null> {
    try {
      // Si le secteur est "other" ou vide, utiliser un template aléatoire
      if (!sector || sector === 'other') {
        return this.getRandomTemplate();
      }

      // Chercher un template spécifique pour le secteur
      const { data, error } = await supabase
        .from('store_templates')
        .select('*')
        .eq('sector', sector)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.log(`Aucun template trouvé pour le secteur: ${sector}, utilisation d'un template par défaut`);
        return this.getDefaultTemplate();
      }

      return data as StoreTemplate;
    } catch (error) {
      console.error('Erreur lors de la récupération du template:', error);
      return this.getDefaultTemplate();
    }
  }

  /**
   * Récupérer un template aléatoire
   */
  static async getRandomTemplate(): Promise<StoreTemplate> {
    try {
      const { data, error } = await supabase
        .from('store_templates')
        .select('*')
        .eq('is_active', true)
        .limit(1);

      if (error || !data || data.length === 0) {
        return this.getDefaultTemplate();
      }

      return data[0] as StoreTemplate;
    } catch (error) {
      console.error('Erreur lors de la récupération du template aléatoire:', error);
      return this.getDefaultTemplate();
    }
  }

  /**
   * Template par défaut (fallback)
   */
  static getDefaultTemplate(): StoreTemplate {
    return {
      id: 'default',
      name: 'Boutique Standard',
      sector: 'general',
      description: 'Template de base pour tous types de boutiques',
      features: [
        'Catalogue de produits',
        'Panier d\'achat',
        'Paiement sécurisé',
        'Gestion des commandes',
        'Tableau de bord'
      ],
      theme: {
        primary_color: '#3B82F6',
        secondary_color: '#1F2937',
        accent_color: '#10B981'
      },
      default_products: [
        {
          name: 'Produit Exemple',
          description: 'Description du produit exemple',
          price: 29.99,
          category: 'Général'
        }
      ],
      settings: {
        enable_reviews: true,
        enable_wishlist: true,
        enable_related_products: true,
        enable_newsletter: true,
        enable_social_sharing: true
      }
    };
  }

  /**
   * Créer une boutique avec le template approprié
   */
  static async createStoreWithTemplate(
    userId: string,
    storeName: string,
    sector: string,
    onboardingData: any
  ): Promise<{ success: boolean; storeId?: string; template?: StoreTemplate }> {
    try {
      // Récupérer le template approprié
      const template = await this.getTemplateForSector(sector);
      
      if (!template) {
        console.error('Impossible de récupérer un template');
        return { success: false };
      }

      // Créer la boutique
      const { data: store, error: storeError } = await supabase
        .from('stores')
        .insert({
          user_id: userId,
          name: storeName,
          description: `Boutique créée avec le template ${template.name}`,
          status: 'active',
          settings: {
            ...template.settings,
            sector: sector,
            template_id: template.id,
            onboarding_data: onboardingData
          }
        })
        .select()
        .single();

      if (storeError) {
        console.error('Erreur lors de la création de la boutique:', storeError);
        return { success: false };
      }

      // Créer les produits par défaut si le template en a
      if (template.default_products && template.default_products.length > 0) {
        const productsToInsert = template.default_products.map(product => ({
          store_id: store.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          status: 'active'
        }));

        const { error: productsError } = await supabase
          .from('products')
          .insert(productsToInsert);

        if (productsError) {
          console.error('Erreur lors de la création des produits par défaut:', productsError);
        }
      }

      return { 
        success: true, 
        storeId: store.id, 
        template 
      };

    } catch (error) {
      console.error('Erreur lors de la création de la boutique avec template:', error);
      return { success: false };
    }
  }

  /**
   * Récupérer tous les templates disponibles
   */
  static async getAllTemplates(): Promise<StoreTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('store_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des templates:', error);
        return [];
      }

      return data as StoreTemplate[];
    } catch (error) {
      console.error('Erreur lors de la récupération des templates:', error);
      return [];
    }
  }

  /**
   * Récupérer les templates par secteur
   */
  static async getTemplatesBySector(sector: string): Promise<StoreTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('store_templates')
        .select('*')
        .eq('sector', sector)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Erreur lors de la récupération des templates par secteur:', error);
        return [];
      }

      return data as StoreTemplate[];
    } catch (error) {
      console.error('Erreur lors de la récupération des templates par secteur:', error);
      return [];
    }
  }
}
