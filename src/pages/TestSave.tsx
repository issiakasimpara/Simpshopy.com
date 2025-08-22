import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { debugSaveTemplate, debugTablePermissions } from '@/utils/debugSaveTemplate';
import DashboardLayout from '@/components/DashboardLayout';

const TestSave = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [permissionResults, setPermissionResults] = useState<any>(null);

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResults(null);
    
    try {
      console.log('🚀 Démarrage du diagnostic...');
      const result = await debugSaveTemplate();
      setResults(result);
      console.log('📊 Résultat diagnostic:', result);
    } catch (error) {
      console.error('💥 Erreur diagnostic:', error);
      setResults({ success: false, error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const runPermissionTest = async () => {
    setIsRunning(true);
    setPermissionResults(null);
    
    try {
      console.log('🚀 Test des permissions...');
      const result = await debugTablePermissions();
      setPermissionResults(result);
      console.log('📊 Résultat permissions:', result);
    } catch (error) {
      console.error('💥 Erreur permissions:', error);
      setPermissionResults({ success: false, error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Test Sauvegarde Template</h1>
          <Badge variant="secondary">Diagnostic</Badge>
        </div>

        <div className="grid gap-6">
          {/* Test principal */}
          <Card>
            <CardHeader>
              <CardTitle>🔍 Diagnostic Complet</CardTitle>
              <CardDescription>
                Test complet de la chaîne de sauvegarde et publication des templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={runDiagnostic} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? 'Test en cours...' : 'Lancer le diagnostic'}
              </Button>

              {results && (
                <div className="mt-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={results.success ? "default" : "destructive"}>
                      {results.success ? "✅ SUCCÈS" : "❌ ÉCHEC"}
                    </Badge>
                  </div>
                  
                  {results.success ? (
                    <div className="space-y-2 text-sm">
                      <p><strong>Utilisateur:</strong> {results.data.user}</p>
                      <p><strong>Profil ID:</strong> {results.data.profile}</p>
                      <p><strong>Store:</strong> {results.data.store.name} ({results.data.store.id})</p>
                      <p><strong>Template sauvegardé:</strong> {results.data.savedTemplate}</p>
                      <p><strong>Template publié:</strong> {results.data.publishedTemplate}</p>
                    </div>
                  ) : (
                    <p className="text-red-600 text-sm">{results.error}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test permissions */}
          <Card>
            <CardHeader>
              <CardTitle>🔐 Test Permissions</CardTitle>
              <CardDescription>
                Vérification des permissions sur la table site_templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={runPermissionTest} 
                disabled={isRunning}
                variant="outline"
                className="w-full"
              >
                {isRunning ? 'Test en cours...' : 'Tester les permissions'}
              </Button>

              {permissionResults && (
                <div className="mt-4 p-4 border rounded-lg">
                  <Badge variant={permissionResults.success ? "default" : "destructive"}>
                    {permissionResults.success ? "✅ PERMISSIONS OK" : "❌ PERMISSIONS KO"}
                  </Badge>
                  
                  {permissionResults.error && (
                    <p className="text-red-600 text-sm mt-2">{permissionResults.error}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>1. <strong>Ouvrez la console</strong> (F12) pour voir les logs détaillés</p>
                <p>2. <strong>Lancez le diagnostic</strong> pour identifier le problème</p>
                <p>3. <strong>Testez les permissions</strong> si le diagnostic échoue</p>
                <p>4. <strong>Vérifiez les résultats</strong> pour comprendre où ça bloque</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TestSave;
