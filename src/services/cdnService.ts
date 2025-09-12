/**
 * 🚀 SERVICE CDN POUR SIMPSHOPY
 * Gestion intelligente des assets via Cloudflare R2
 * Date: 2025-01-28
 */

export interface CDNAsset {
  originalPath: string;
  cdnPath: string;
  fallbackPath: string;
  cacheKey: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface CDNConfig {
  baseUrl: string;
  bucketName: string;
  enableWebP: boolean;
  enableCompression: boolean;
  fallbackEnabled: boolean;
}

class CDNService {
  private config: CDNConfig;
  private assetCache = new Map<string, CDNAsset>();
  private preloadQueue = new Set<string>();

  constructor() {
    this.config = {
      baseUrl: process.env.NODE_ENV === 'production' 
        ? 'https://assets.simpshopy.com' 
        : 'http://localhost:8080',
      bucketName: 'simpshopy-assets',
      enableWebP: true,
      enableCompression: true,
      fallbackEnabled: true
    };
  }

  /**
   * Génère l'URL CDN optimisée pour un asset
   */
  getCDNUrl(originalPath: string, options: {
    storeId?: string;
    productId?: string;
    templateId?: string;
    size?: 'thumbnail' | 'medium' | 'large' | 'original';
    format?: 'webp' | 'jpg' | 'png' | 'svg';
  } = {}): string {
    const { storeId, productId, templateId, size = 'original', format } = options;
    
    // Déterminer le type d'asset et le chemin CDN
    const assetType = this.determineAssetType(originalPath);
    const cdnPath = this.buildCDNPath(assetType, originalPath, {
      storeId,
      productId, 
      templateId,
      size,
      format
    });

    // Vérifier le cache
    const cacheKey = this.generateCacheKey(originalPath, options);
    if (this.assetCache.has(cacheKey)) {
      return this.assetCache.get(cacheKey)!.cdnPath;
    }

    // Créer l'asset CDN
    const asset: CDNAsset = {
      originalPath,
      cdnPath,
      fallbackPath: originalPath,
      cacheKey,
      priority: this.determinePriority(assetType)
    };

    // Mettre en cache
    this.assetCache.set(cacheKey, asset);

    return cdnPath;
  }

  /**
   * Détermine le type d'asset
   */
  private determineAssetType(path: string): 'static' | 'store' | 'product' | 'template' | 'payment' | 'integration' {
    const lowerPath = path.toLowerCase();
    
    if (lowerPath.includes('favicon') || lowerPath.includes('robots') || lowerPath.includes('sitemap')) {
      return 'static';
    }
    
    if (lowerPath.includes('pay') || lowerPath.includes('moneroo') || lowerPath.includes('stripe')) {
      return 'payment';
    }
    
    if (lowerPath.includes('dsers') || lowerPath.includes('mailchimp')) {
      return 'integration';
    }
    
    if (lowerPath.includes('logo') && lowerPath.includes('store')) {
      return 'store';
    }
    
    if (lowerPath.includes('product') || lowerPath.includes('image')) {
      return 'product';
    }
    
    if (lowerPath.includes('template')) {
      return 'template';
    }
    
    return 'static';
  }

  /**
   * Construit le chemin CDN
   */
  private buildCDNPath(
    assetType: string, 
    originalPath: string, 
    options: any
  ): string {
    const { storeId, productId, templateId, size } = options;
    
    switch (assetType) {
      case 'static':
        return `${this.config.baseUrl}/static/${this.extractFileName(originalPath)}`;
        
      case 'store':
        if (!storeId) return originalPath;
        return `${this.config.baseUrl}/store-assets/${storeId}/${this.extractFileName(originalPath)}`;
        
      case 'product':
        if (!storeId || !productId) return originalPath;
        const sizePath = size === 'original' ? '' : `/${size}`;
        return `${this.config.baseUrl}/product-images/${storeId}/${productId}${sizePath}/${this.extractFileName(originalPath)}`;
        
      case 'template':
        if (!templateId) return originalPath;
        return `${this.config.baseUrl}/template-assets/${templateId}/${this.extractFileName(originalPath)}`;
        
      case 'payment':
        return `${this.config.baseUrl}/payment-logos/${this.extractFileName(originalPath)}`;
        
      case 'integration':
        return `${this.config.baseUrl}/integration-logos/${this.extractFileName(originalPath)}`;
        
      default:
        return originalPath;
    }
  }

  /**
   * Extrait le nom de fichier d'un chemin
   */
  private extractFileName(path: string): string {
    return path.split('/').pop() || path;
  }

  /**
   * Génère une clé de cache
   */
  private generateCacheKey(originalPath: string, options: any): string {
    return `${originalPath}:${JSON.stringify(options)}`;
  }

  /**
   * Détermine la priorité de l'asset
   */
  private determinePriority(assetType: string): 'critical' | 'high' | 'medium' | 'low' {
    switch (assetType) {
      case 'static':
        return 'critical';
      case 'store':
      case 'payment':
        return 'high';
      case 'product':
        return 'high';
      case 'template':
        return 'medium';
      case 'integration':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * Précharge un asset critique
   */
  async preloadAsset(assetPath: string, options: any = {}): Promise<void> {
    const cdnUrl = this.getCDNUrl(assetPath, options);
    const cacheKey = this.generateCacheKey(assetPath, options);
    
    if (this.preloadQueue.has(cacheKey)) {
      return;
    }
    
    this.preloadQueue.add(cacheKey);
    
    try {
      // Créer un lien de préchargement
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = cdnUrl;
      link.as = this.getAssetType(assetPath);
      
      if (this.getAssetType(assetPath) === 'image') {
        link.crossOrigin = 'anonymous';
      }
      
      document.head.appendChild(link);
      
      console.log(`🚀 Asset préchargé: ${cdnUrl}`);
      
    } catch (error) {
      console.warn(`⚠️ Erreur préchargement: ${assetPath}`, error);
    } finally {
      this.preloadQueue.delete(cacheKey);
    }
  }

  /**
   * Détermine le type d'asset pour le préchargement
   */
  private getAssetType(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    
    switch (ext) {
      case 'css':
        return 'style';
      case 'js':
        return 'script';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
      case 'svg':
        return 'image';
      case 'woff':
      case 'woff2':
      case 'ttf':
        return 'font';
      default:
        return 'fetch';
    }
  }

  /**
   * Précharge les assets critiques d'une boutique
   */
  async preloadStoreAssets(storeId: string, storeData: any): Promise<void> {
    const criticalAssets = [
      storeData.logo_url,
      storeData.favicon_url,
      '/static/logos/logo-simpshopy.png',
      '/static/system/favicon.ico'
    ].filter(Boolean);

    // Précharger en parallèle
    await Promise.allSettled(
      criticalAssets.map(asset => 
        this.preloadAsset(asset, { storeId })
      )
    );
  }

  /**
   * Précharge les assets d'un produit
   */
  async preloadProductAssets(storeId: string, productId: string, productData: any): Promise<void> {
    const productAssets = [
      productData.main_image,
      ...(productData.images || []).slice(0, 3) // Limiter à 3 images
    ].filter(Boolean);

    // Précharger en parallèle
    await Promise.allSettled(
      productAssets.map(asset => 
        this.preloadAsset(asset, { storeId, productId, size: 'medium' })
      )
    );
  }

  /**
   * Obtient les statistiques du cache
   */
  getCacheStats(): {
    totalAssets: number;
    criticalAssets: number;
    highPriorityAssets: number;
    mediumPriorityAssets: number;
    lowPriorityAssets: number;
  } {
    const assets = Array.from(this.assetCache.values());
    
    return {
      totalAssets: assets.length,
      criticalAssets: assets.filter(a => a.priority === 'critical').length,
      highPriorityAssets: assets.filter(a => a.priority === 'high').length,
      mediumPriorityAssets: assets.filter(a => a.priority === 'medium').length,
      lowPriorityAssets: assets.filter(a => a.priority === 'low').length
    };
  }

  /**
   * Nettoie le cache
   */
  clearCache(): void {
    this.assetCache.clear();
    this.preloadQueue.clear();
  }
}

// Instance singleton
export const cdnService = new CDNService();

// Hooks React pour l'utilisation
export const useCDN = () => {
  return {
    getCDNUrl: cdnService.getCDNUrl.bind(cdnService),
    preloadAsset: cdnService.preloadAsset.bind(cdnService),
    preloadStoreAssets: cdnService.preloadStoreAssets.bind(cdnService),
    preloadProductAssets: cdnService.preloadProductAssets.bind(cdnService),
    getCacheStats: cdnService.getCacheStats.bind(cdnService),
    clearCache: cdnService.clearCache.bind(cdnService)
  };
};

export default cdnService;
