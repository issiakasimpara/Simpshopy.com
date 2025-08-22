import { useStores } from '@/hooks/useStores';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Store } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ShowStoreId = () => {
  const { stores, isLoading } = useStores();
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: "Store ID copié dans le presse-papiers",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  if (!stores || stores.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Aucune boutique trouvée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Vous devez d'abord créer une boutique pour voir votre Store ID.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5 text-blue-600" />
          Vos Store IDs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stores.map((store, index) => (
          <div key={store.id} className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{store.name}</h3>
              <Badge variant="outline">Boutique #{index + 1}</Badge>
            </div>
            
            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Store ID:</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                    {store.id}
                  </code>
                  <button
                    onClick={() => copyToClipboard(store.id)}
                    className="p-1 hover:bg-muted rounded"
                    title="Copier le Store ID"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {store.slug && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Slug:</label>
                  <div className="text-sm">{store.slug}</div>
                </div>
              )}
              
              {store.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description:</label>
                  <div className="text-sm">{store.description}</div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Utilisez le Store ID</strong> de votre boutique principale pour configurer les livraisons.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShowStoreId;
