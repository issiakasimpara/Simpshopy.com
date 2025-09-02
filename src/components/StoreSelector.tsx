
import { useStores } from '@/hooks/useStores';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Store } from 'lucide-react';

interface StoreSelectorProps {
  selectedStoreId?: string;
  onStoreSelect: (storeId: string) => void;
  onCreateStore: () => void;
}

const StoreSelector = ({ selectedStoreId, onStoreSelect, onCreateStore }: StoreSelectorProps) => {
  const { stores, isLoading } = useStores();

  if (isLoading) {
    return <div className="h-8 sm:h-10 bg-gray-100 rounded animate-pulse w-full sm:w-auto" />;
  }

  if (stores.length === 0) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <div className="text-xs sm:text-sm text-gray-500">Aucune boutique trouvée</div>
        <Button onClick={onCreateStore} size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
          <Store className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Créer une boutique</span>
          <span className="sm:hidden">Créer</span>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
      <Select value={selectedStoreId} onValueChange={onStoreSelect}>
        <SelectTrigger className="w-full sm:w-64 text-xs sm:text-sm">
          <SelectValue placeholder="Sélectionner une boutique" />
        </SelectTrigger>
        <SelectContent>
          {stores.map((store) => (
            <SelectItem key={store.id} value={store.id}>
              <div className="flex items-center gap-2">
                <Store className="h-3 w-3 sm:h-4 sm:w-4" />
                {store.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={onCreateStore} variant="outline" size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
        <Store className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Créer avec template</span>
        <span className="sm:hidden">Template</span>
      </Button>
    </div>
  );
};

export default StoreSelector;
