import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useStores } from '@/hooks/useStores';

interface DiagnosticResult {
  success: boolean;
  message: string;
  data?: any;
  error?: any;
}

export default function TestMarkets() {
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();
  const { stores } = useStores();

  const addResult = (result: DiagnosticResult) => {
    setDiagnosticResults(prev => [...prev, result]);
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    setDiagnosticResults([]);

    try {
      // 1. Vérifier l'authentification
      addResult({
        success: !!user,
        message: `Authentification: ${user ? `✅ ${user.email}` : '❌ Non connecté'}`
      });

      if (!user) {
        setIsRunning(false);
        return;
      }

      // 2. Vérifier les stores
      addResult({
        success: stores.length > 0,
        message: `Stores: ${stores.length > 0 ? `✅ ${stores.length} store(s) trouvé(s)` : '❌ Aucun store trouvé'}`,
        data: stores
      });

      if (stores.length === 0) {
        setIsRunning(false);
        return;
      }

      const storeId = stores[0].id;

      // 3. Tester la lecture des markets
      try {
        const { data: markets, error: marketsError } = await supabase
          .from('markets')
          .select('*')
          .eq('store_id', storeId);

        if (marketsError) {
          addResult({
            success: false,
            message: `❌ Erreur lecture markets: ${marketsError.message}`,
            error: marketsError
          });
        } else {
          addResult({
            success: true,
            message: `✅ Lecture markets réussie: ${markets?.length || 0} marché(s)`,
            data: markets
          });
        }
      } catch (error) {
        addResult({
          success: false,
          message: `❌ Exception lecture markets: ${error}`,
          error
        });
      }

      // 4. Tester la création d'un market
      try {
        const testMarket = {
          store_id: storeId,
          name: `Test Market ${Date.now()}`,
          countries: ['ML', 'CI'],
          is_active: true
        };

        const { data: newMarket, error: createError } = await supabase
          .from('markets')
          .insert(testMarket)
          .select()
          .single();

        if (createError) {
          addResult({
            success: false,
            message: `❌ Erreur création market: ${createError.message}`,
            error: createError
          });
        } else {
          addResult({
            success: true,
            message: `✅ Création market réussie: ${newMarket.id}`,
            data: newMarket
          });

          // 5. Tester la suppression du market de test
          const { error: deleteError } = await supabase
            .from('markets')
            .delete()
            .eq('id', newMarket.id);

          if (deleteError) {
            addResult({
              success: false,
              message: `⚠️ Erreur suppression market test: ${deleteError.message}`,
              error: deleteError
            });
          } else {
            addResult({
              success: true,
              message: `✅ Suppression market test réussie`
            });
          }
        }
      } catch (error) {
        addResult({
          success: false,
          message: `❌ Exception création market: ${error}`,
          error
        });
      }

      // 6. Tester la table shipping_methods
      try {
        const { data: methods, error: methodsError } = await supabase
          .from('shipping_methods')
          .select('*')
          .eq('store_id', storeId);

        if (methodsError) {
          addResult({
            success: false,
            message: `❌ Erreur lecture shipping_methods: ${methodsError.message}`,
            error: methodsError
          });
        } else {
          addResult({
            success: true,
            message: `✅ Lecture shipping_methods réussie: ${methods?.length || 0} méthode(s)`,
            data: methods
          });
        }
      } catch (error) {
        addResult({
          success: false,
          message: `❌ Exception lecture shipping_methods: ${error}`,
          error
        });
      }

    } catch (error) {
      addResult({
        success: false,
        message: `❌ Erreur générale: ${error}`,
        error
      });
    }

    setIsRunning(false);
  };

  const testPermissions = async () => {
    if (!user || stores.length === 0) return;

    try {
      // Test des permissions directes
      const { data, error } = await supabase.rpc('auth.uid');
      console.log('🔐 User ID:', data);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('👤 Profile:', profileData, profileError);

      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('merchant_id', user.id);

      console.log('🏪 Stores:', storeData, storeError);

    } catch (error) {
      console.error('❌ Erreur test permissions:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Test Markets & Shipping</h1>
        <span className="text-sm text-gray-500">Diagnostic</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Diagnostic Complet
          </CardTitle>
          <CardDescription>
            Test complet de la chaîne de sauvegarde et publication des markets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runDiagnostic} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Diagnostic en cours...' : 'Lancer le diagnostic'}
          </Button>

          {diagnosticResults.length > 0 && (
            <div className="space-y-2">
              {diagnosticResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="font-medium">{result.message}</div>
                  {result.data && (
                    <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                  {result.error && (
                    <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                      {JSON.stringify(result.error, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔐 Test Permissions
          </CardTitle>
          <CardDescription>
            Vérification des permissions sur la table markets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={testPermissions} variant="outline" className="w-full">
            Tester les permissions
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📋 Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><strong>1. Ouvrez la console</strong> (F12) pour voir les logs détaillés</p>
          <p><strong>2. Lancez le diagnostic</strong> pour identifier le problème</p>
          <p><strong>3. Testez les permissions</strong> si le diagnostic échoue</p>
          <p><strong>4. Vérifiez les résultats</strong> pour comprendre où ça bloque</p>
        </CardContent>
      </Card>
    </div>
  );
}
