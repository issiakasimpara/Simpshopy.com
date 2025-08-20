import { useState, useEffect, useCallback } from 'react';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export const useCookieConsent = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    preferences: false
  });

  const [hasConsented, setHasConsented] = useState<boolean>(false);

  // Charger les préférences au démarrage
  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie_consent');
    const consentDate = localStorage.getItem('cookie_consent_date');
    
    if (savedConsent && consentDate) {
      // Vérifier si le consentement a moins de 12 mois
      const consentTime = new Date(consentDate).getTime();
      const now = new Date().getTime();
      const twelveMonths = 12 * 30 * 24 * 60 * 60 * 1000; // 12 mois en millisecondes
      
      if (now - consentTime < twelveMonths) {
        // Le consentement est encore valide
        const savedPreferences = JSON.parse(savedConsent);
        setPreferences(savedPreferences);
        setHasConsented(true);
        
        // Appliquer les préférences directement ici
        // Cookies essentiels (toujours activés)
        if (savedPreferences.essential) {
          document.cookie = 'essential=true; path=/; max-age=31536000; SameSite=Strict';
        }

        // Cookies analytics
        if (savedPreferences.analytics) {
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', {
              analytics_storage: 'granted'
            });
          }
        } else {
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', {
              analytics_storage: 'denied'
            });
          }
        }

        // Cookies marketing
        if (savedPreferences.marketing) {
          document.cookie = 'marketing=true; path=/; max-age=31536000; SameSite=Lax';
        } else {
          document.cookie = 'marketing=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }

        // Cookies de préférences
        if (savedPreferences.preferences) {
          document.cookie = 'preferences=true; path=/; max-age=31536000; SameSite=Lax';
        } else {
          document.cookie = 'preferences=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
      } else {
        // Le consentement a expiré, le supprimer
        localStorage.removeItem('cookie_consent');
        localStorage.removeItem('cookie_consent_date');
        setHasConsented(false);
      }
    }
  }, []);

  // Appliquer les préférences de cookies
  const applyCookiePreferences = useCallback((prefs: CookiePreferences) => {
    // Cookies essentiels (toujours activés)
    if (prefs.essential) {
      // Ces cookies sont nécessaires au fonctionnement
      document.cookie = 'essential=true; path=/; max-age=31536000; SameSite=Strict';
    }

    // Cookies analytics
    if (prefs.analytics) {
      // Activer Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted'
        });
      }
    } else {
      // Désactiver Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'denied'
        });
      }
    }

    // Cookies marketing
    if (prefs.marketing) {
      // Activer les cookies marketing
      document.cookie = 'marketing=true; path=/; max-age=31536000; SameSite=Lax';
    } else {
      // Supprimer les cookies marketing
      document.cookie = 'marketing=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }

    // Cookies de préférences
    if (prefs.preferences) {
      // Activer les cookies de préférences
      document.cookie = 'preferences=true; path=/; max-age=31536000; SameSite=Lax';
    } else {
      // Supprimer les cookies de préférences
      document.cookie = 'preferences=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }

    // Sauvegarder les préférences
    localStorage.setItem('cookie_consent', JSON.stringify(prefs));
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
  }, []);

  // Accepter tous les cookies
  const acceptAll = useCallback(() => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    setPreferences(allAccepted);
    setHasConsented(true);
    applyCookiePreferences(allAccepted);
  }, [applyCookiePreferences]);

  // Accepter seulement les cookies essentiels
  const acceptEssential = useCallback(() => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    setPreferences(essentialOnly);
    setHasConsented(true);
    applyCookiePreferences(essentialOnly);
  }, [applyCookiePreferences]);

  // Sauvegarder des préférences personnalisées
  const savePreferences = useCallback((newPreferences: CookiePreferences) => {
    setPreferences(newPreferences);
    setHasConsented(true);
    applyCookiePreferences(newPreferences);
  }, [applyCookiePreferences]);

  // Vérifier si un type de cookie est autorisé
  const isCookieAllowed = useCallback((type: keyof CookiePreferences) => {
    return preferences[type];
  }, [preferences]);

  // Révoquer le consentement
  const revokeConsent = useCallback(() => {
    // Supprimer tous les cookies non essentiels
    document.cookie = 'analytics=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'marketing=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'preferences=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Supprimer les préférences du localStorage
    localStorage.removeItem('cookie_consent');
    localStorage.removeItem('cookie_consent_date');
    
    // Réinitialiser l'état
    setPreferences({
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false
    });
    setHasConsented(false);
  }, []);

  return {
    preferences,
    hasConsented,
    acceptAll,
    acceptEssential,
    savePreferences,
    isCookieAllowed,
    revokeConsent,
    applyCookiePreferences
  };
};
