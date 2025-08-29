import React, { useState, useEffect } from 'react';
import { usePageCache } from '@/hooks/usePageCache';
import { Clock, Zap, Database, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PerformanceIndicatorProps {
  className?: string;
}

export const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({ 
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [pageLoadTime, setPageLoadTime] = useState<number>(0);
  const { getCacheStats } = usePageCache();

  useEffect(() => {
    // Mesurer le temps de chargement de la page
    const startTime = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      setPageLoadTime(loadTime);
      setIsVisible(true);
      
      // Masquer après 5 secondes
      setTimeout(() => setIsVisible(false), 5000);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  const cacheStats = getCacheStats();
  const isFast = pageLoadTime < 500;
  const isMedium = pageLoadTime >= 500 && pageLoadTime < 1000;

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4 max-w-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg ${
            isFast ? 'bg-green-100 text-green-600' : 
            isMedium ? 'bg-yellow-100 text-yellow-600' : 
            'bg-red-100 text-red-600'
          }`}>
            {isFast ? <Zap className="h-4 w-4" /> : 
             isMedium ? <Clock className="h-4 w-4" /> : 
             <TrendingUp className="h-4 w-4" />}
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              Performance
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Chargement optimisé
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Temps de chargement:</span>
            <Badge variant={isFast ? 'default' : isMedium ? 'secondary' : 'destructive'} className="text-xs">
              {pageLoadTime.toFixed(0)}ms
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Pages en cache:</span>
            <Badge variant="outline" className="text-xs">
              {cacheStats.validEntries}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Preloading:</span>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
              Actif
            </Badge>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Database className="h-3 w-3" />
            <span>Cache intelligent activé</span>
          </div>
        </div>
      </div>
    </div>
  );
};
