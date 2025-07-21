
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Store, Eye, Settings, Edit, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Tables } from '@/integrations/supabase/types';

type Store = Tables<'stores'>;

interface StoreActionsProps {
  selectedStore: Store;
  viewMode: 'template' | 'config';
  onViewModeChange: (mode: 'template' | 'config') => void;
  storeTemplateId?: string;
}

const StoreActions = ({ 
  selectedStore, 
  viewMode, 
  onViewModeChange, 
  storeTemplateId 
}: StoreActionsProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200';
      case 'draft': return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
      case 'suspended': return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200';
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'En ligne';
      case 'draft': return 'Brouillon';
      case 'suspended': return 'Suspendue';
      default: return status;
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl" />
      <div className="relative p-6 bg-gradient-to-br from-background via-background to-muted/20 rounded-2xl border border-border/50 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative p-3 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-xl shadow-inner">
                <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl" />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {selectedStore.name}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(selectedStore.status)} border font-semibold shadow-sm`}>
                    {getStatusLabel(selectedStore.status)}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Boutique active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant={viewMode === 'template' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => onViewModeChange('template')}
              className={viewMode === 'template' 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transition-all duration-300" 
                : "hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200"
              }
            >
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
            <Button 
              variant={viewMode === 'config' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => onViewModeChange('config')}
              className={viewMode === 'config' 
                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg transition-all duration-300" 
                : "hover:bg-green-50 dark:hover:bg-green-950/20 transition-all duration-200"
              }
            >
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(`/store-config/site-builder/editor/${storeTemplateId || 'fashion-modern'}`)}
              className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30 transition-all duration-200 border-purple-200 dark:border-purple-800"
            >
              <Edit className="h-4 w-4 mr-2" />
              Personnaliser
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreActions;
