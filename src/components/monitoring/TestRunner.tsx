import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Download
} from 'lucide-react';
import { useTestSuite } from '@/utils/testSuite';

interface TestRunnerProps {
  className?: string;
}

const TestRunner: React.FC<TestRunnerProps> = ({ className }) => {
  const { runAllTests, getResults, clearResults } = useTestSuite();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    // Simulation de progression
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const testResults = await runAllTests();
      setResults(testResults);
      setProgress(100);
    } catch (error) {
      console.error('Erreur lors des tests:', error);
    } finally {
      clearInterval(progressInterval);
      setIsRunning(false);
    }
  };

  const clearTestResults = () => {
    clearResults();
    setResults(null);
    setProgress(0);
  };

  const downloadResults = () => {
    if (!results) return;
    
    const report = results.summary;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-results-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (passed: number, total: number) => {
    const ratio = passed / total;
    if (ratio === 1) return 'text-green-600';
    if (ratio >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (passed: number, total: number) => {
    const ratio = passed / total;
    if (ratio === 1) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (ratio >= 0.8) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Play className="h-6 w-6" />
            Tests Automatisés
          </h2>
          <p className="text-muted-foreground">
            Validation de la sécurité, performance et robustesse
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runTests}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isRunning ? 'Exécution...' : 'Lancer les Tests'}
          </Button>
          {results && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={downloadResults}
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearTestResults}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Effacer
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Barre de progression */}
      {isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progression des tests...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats des tests */}
      {results && (
        <div className="space-y-4">
          {/* Résumé global */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Résumé des Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.suites.map((suite: any) => (
                  <div key={suite.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(suite.passed, suite.total)}
                      <span className="font-medium">{suite.name}</span>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${getStatusColor(suite.passed, suite.total)}`}>
                        {suite.passed}/{suite.total}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((suite.passed / suite.total) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Détails par suite */}
          {results.suites.map((suite: any) => (
            <Card key={suite.name}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(suite.passed, suite.total)}
                  {suite.name}
                  <Badge variant="outline">
                    {suite.passed}/{suite.total} tests réussis
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {suite.tests.map((test: any) => (
                    <div 
                      key={test.name} 
                      className={`flex items-center justify-between p-2 rounded ${
                        test.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {test.passed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">{test.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {test.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {test.duration.toFixed(2)}ms
                          </div>
                        )}
                        {!test.passed && test.error && (
                          <Badge variant="destructive" className="text-xs">
                            {test.error}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Rapport complet */}
          <Card>
            <CardHeader>
              <CardTitle>Rapport Complet</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                {results.summary}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {/* État initial */}
      {!results && !isRunning && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun test exécuté</h3>
              <p className="text-muted-foreground mb-4">
                Cliquez sur "Lancer les Tests" pour commencer la validation automatique
              </p>
              <Button onClick={runTests}>
                <Play className="h-4 w-4 mr-2" />
                Lancer les Tests
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestRunner; 