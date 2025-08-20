import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie, X, Settings, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCookieConsent, type CookiePreferences } from '@/hooks/useCookieConsent';

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { preferences, hasConsented, acceptAll, acceptEssential, savePreferences } = useCookieConsent();

  useEffect(() => {
    // Afficher la bannière si pas de consentement
    if (!hasConsented) {
      setShowBanner(true);
    }
  }, [hasConsented]);

  const handleAcceptAll = () => {
    acceptAll();
    setShowBanner(false);
  };

  const handleAcceptEssential = () => {
    acceptEssential();
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowSettings(false);
    setShowBanner(false);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'essential') return; // Ne peut pas être désactivé
    // Mettre à jour les préférences localement pour l'interface
    const newPreferences = { ...preferences, [key]: value };
    // Note: Les préférences ne sont appliquées qu'après sauvegarde
  };

  if (!showBanner) return null;

  return (
    <>
             {/* Bannière principale */}
       <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
         <Card className="max-w-4xl mx-auto bg-card border-border shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
                             <div className="flex-shrink-0">
                 <Cookie className="h-8 w-8 text-primary" />
               </div>
               
               <div className="flex-1">
                 <h3 className="text-lg font-semibold mb-2">
                   Nous utilisons des <span className="text-primary">cookies</span>
                 </h3>
                                 <p className="text-muted-foreground mb-4">
                   pour améliorer votre expérience sur notre site. Nous utilisons des cookies essentiels pour le fonctionnement du site et des cookies optionnels pour l'analyse et le marketing.
                 </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                                     <Button 
                     onClick={handleAcceptEssential}
                     variant="outline"
                     className="border-border text-muted-foreground hover:bg-accent"
                   >
                     Plus tard
                   </Button>
                                     <Button 
                     onClick={handleAcceptAll}
                     className="bg-primary hover:bg-primary/90"
                   >
                     Accepter
                   </Button>
                                     <Button 
                     onClick={() => setShowSettings(true)}
                     variant="ghost"
                     className="text-muted-foreground hover:bg-accent"
                   >
                     <Settings className="h-4 w-4 mr-2" />
                     Paramètres
                   </Button>
                </div>
              </div>
              
                             <Button 
                 onClick={handleAcceptEssential}
                 variant="ghost"
                 size="sm"
                 className="text-muted-foreground hover:text-foreground"
               >
                 <X className="h-4 w-4" />
               </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal des paramètres */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Paramètres des cookies
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Cookies essentiels */}
                             <div className="flex items-center justify-between p-4 border rounded-lg">
                 <div className="flex-1">
                   <h4 className="font-semibold flex items-center gap-2">
                     <CheckCircle className="h-4 w-4 text-primary" />
                     Cookies essentiels
                   </h4>
                                     <p className="text-sm text-muted-foreground mt-1">
                     Nécessaires au fonctionnement du site (authentification, panier, etc.)
                   </p>
                </div>
                <div className="flex items-center">
                                     <input
                     type="checkbox"
                     checked={preferences.essential}
                     disabled
                     className="rounded border-border"
                   />
                </div>
              </div>

              {/* Cookies analytics */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">Cookies d'analyse</h4>
                                     <p className="text-sm text-muted-foreground mt-1">
                     Nous aident à comprendre comment vous utilisez notre site
                   </p>
                </div>
                <div className="flex items-center">
                                     <input
                     type="checkbox"
                     checked={preferences.analytics}
                     onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                     className="rounded border-border"
                   />
                </div>
              </div>

              {/* Cookies marketing */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">Cookies marketing</h4>
                                     <p className="text-sm text-muted-foreground mt-1">
                     Utilisés pour vous proposer des contenus personnalisés
                   </p>
                </div>
                <div className="flex items-center">
                                     <input
                     type="checkbox"
                     checked={preferences.marketing}
                     onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                     className="rounded border-border"
                   />
                </div>
              </div>

              {/* Cookies de préférences */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold">Cookies de préférences</h4>
                                     <p className="text-sm text-muted-foreground mt-1">
                     Mémorisent vos choix (langue, devise, etc.)
                   </p>
                </div>
                <div className="flex items-center">
                                     <input
                     type="checkbox"
                     checked={preferences.preferences}
                     onChange={(e) => handlePreferenceChange('preferences', e.target.checked)}
                     className="rounded border-border"
                   />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                onClick={() => setShowSettings(false)}
                variant="outline"
              >
                Annuler
              </Button>
                             <Button 
                 onClick={handleSavePreferences}
                 className="bg-primary hover:bg-primary/90"
               >
                 Sauvegarder
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;
