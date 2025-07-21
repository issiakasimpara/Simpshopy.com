// Types communs pour améliorer la cohérence du projet

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  product_id: string;
  variant_id?: string;
  image?: string;
  sku?: string;
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export interface PublicOrder {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  total_amount: number;
  currency: string;
  status: string;
  items: CartItem[];
  shipping_address?: Address | null;
  billing_address?: Address | null;
  created_at: string;
  updated_at: string;
  store_id?: string | null;
}

export type ViewMode = 'desktop' | 'tablet' | 'mobile';

export interface Store {
  id: string;
  name: string;
  description?: string;
  domain?: string;
  logo_url?: string;
  merchant_id: string;
  status: 'draft' | 'active' | 'suspended';
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Types pour les templates
export interface TemplateBlock {
  id: string;
  type: string;
  data: Record<string, any>;
  style?: Record<string, any>;
}

export interface TemplatePage {
  id: string;
  name: string;
  blocks: TemplateBlock[];
}