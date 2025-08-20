import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Download,
  Bug
} from 'lucide-react';
import { useSystemDiagnostic } from '@/utils/systemDiagnostic';

interface SystemDiagnosticPanelProps {
  className?: string;
}

const SystemDiagnosticPanel: React.FC<SystemDiagnosticPanelProps> = ({ className }) => {
  const { runDiagnostic, getStatus, resetCounters, generateReport } = useSystemDiagnostic();
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Mettre à jour le diagnostic toutes les 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      const newDiagnostic = runDiagnostic();
      const newStatus = getStatus();
      setDiagnostic(newDiagnostic);
      setStatus(newStatus);
      
      // Afficher automatiquement si des problèmes sont détectés
      if (!newStatus.isStable) {
        setIsVisible(true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [runDiagnostic, getStatus]);

  const handleReset = () => {
    resetCounters();
    setDiagnostic(runDiagnostic());
    setStatus(getStatus());
  };

  const downloadReport = () => {
    const report = generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-diagnostic-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isVisible && status?.isStable) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(true)}
          className="flex items-center gap-2"
        >
          <Bug className="h-4 w-4" />
          Diagnostic
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 w-96 ${className}`}>
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Activity className="h-4 w-4" />
              Diagnostic Système
              {status && (
                <Badge variant={status.isStable ? "default" : "destructive"} className="text-xs">
                  {status.isStable ? "Stable" : "Problèmes"}
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadReport}
                className="h-6 w-6 p-0"
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                <XCircle className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {diagnostic && (
            <div className="space-y-3">
              {/* Performance */}
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground">Performance</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-medium">{(diagnostic.performance.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
                    <div className="text-muted-foreground">Mémoire</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-medium">{diagnostic.performance.renderCount}</div>
                    <div className="text-muted-foreground">Re-renders</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-medium">{diagnostic.performance.apiCalls}</div>
                    <div className="text-muted-foreground">API Calls</div>
                  </div>
                </div>
              </div>

              {/* Erreurs */}
              {diagnostic.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-red-600 flex items-center gap-1">
                    <XCircle className="h-3 w-3" />
                    Erreurs ({diagnostic.errors.length})
                  </h4>
                  <div className="space-y-1">
                    {diagnostic.errors.map((error: string, index: number) => (
                      <div key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Avertissements */}
              {diagnostic.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-yellow-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Avertissements ({diagnostic.warnings.length})
                  </h4>
                  <div className="space-y-1">
                    {diagnostic.warnings.map((warning: string, index: number) => (
                      <div key={index} className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                        {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommandations */}
              {diagnostic.recommendations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-blue-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Recommandations ({diagnostic.recommendations.length})
                  </h4>
                  <div className="space-y-1">
                    {diagnostic.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statut global */}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Statut global:</span>
                  <Badge variant={status?.isStable ? "default" : "destructive"} className="text-xs">
                    {status?.isStable ? "✅ Stable" : "⚠️ Problèmes détectés"}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemDiagnosticPanel; 