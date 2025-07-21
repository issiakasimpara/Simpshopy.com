import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { emailService, OrderEmailData } from '@/services/emailService';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const EmailTestPanel = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ customer: boolean; admin: boolean } | null>(null);
  
  const [testData, setTestData] = useState({
    customerEmail: '',
    adminEmail: '',
    customerName: 'Jean Dupont',
    storeName: 'Ma Boutique Test'
  });

  const handleTestEmails = async () => {
    if (!testData.customerEmail || !testData.adminEmail) {
      toast({
        title: "E-mails manquants",
        description: "Veuillez remplir les e-mails client et admin.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      // Données de test pour la commande
      const orderData: OrderEmailData = {
        orderId: 'TEST-' + Date.now(),
        customerName: testData.customerName,
        customerEmail: testData.customerEmail,
        customerPhone: '+33 6 12 34 56 78',
        items: [
          {
            name: 'T-shirt Rouge',
            quantity: 2,
            price: 19.99,
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100&h=100&fit=crop'
          },
          {
            name: 'Jean Bleu',
            quantity: 1,
            price: 49.99,
            image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=100&h=100&fit=crop'
          }
        ],
        subtotal: 89.97,
        shipping: 5.99,
        total: 95.96,
        shippingAddress: {
          street: '123 Rue de la Paix',
          city: 'Paris',
          postalCode: '75001',
          country: 'France'
        },
        storeName: testData.storeName,
        storeEmail: testData.adminEmail,
        estimatedDelivery: '3-5 jours ouvrés'
      };

      console.log('🧪 Test des e-mails avec:', orderData);

      // Envoyer les e-mails de test
      const emailResults = await emailService.sendOrderEmails(orderData);
      
      setResults(emailResults);

      if (emailResults.customer && emailResults.admin) {
        toast({
          title: "✅ E-mails envoyés !",
          description: "Les deux e-mails de test ont été envoyés avec succès.",
        });
      } else {
        toast({
          title: "⚠️ Envoi partiel",
          description: `Client: ${emailResults.customer ? '✅' : '❌'} | Admin: ${emailResults.admin ? '✅' : '❌'}`,
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('❌ Erreur test e-mails:', error);
      toast({
        title: "❌ Erreur",
        description: error.message || "Erreur lors de l'envoi des e-mails de test.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Test des E-mails de Commande
        </CardTitle>
        <CardDescription>
          Testez l'envoi des e-mails de confirmation de commande (client + admin)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerEmail">E-mail Client (test)</Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="client@example.com"
              value={testData.customerEmail}
              onChange={(e) => setTestData(prev => ({ ...prev, customerEmail: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="adminEmail">E-mail Admin (test)</Label>
            <Input
              id="adminEmail"
              type="email"
              placeholder="admin@example.com"
              value={testData.adminEmail}
              onChange={(e) => setTestData(prev => ({ ...prev, adminEmail: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customerName">Nom Client</Label>
            <Input
              id="customerName"
              placeholder="Jean Dupont"
              value={testData.customerName}
              onChange={(e) => setTestData(prev => ({ ...prev, customerName: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="storeName">Nom Boutique</Label>
            <Input
              id="storeName"
              placeholder="Ma Boutique Test"
              value={testData.storeName}
              onChange={(e) => setTestData(prev => ({ ...prev, storeName: e.target.value }))}
            />
          </div>
        </div>

        {/* Informations sur le test */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📧 Ce test va envoyer :
          </h4>
          <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            <li>• <strong>E-mail client</strong> : Confirmation de commande avec détails</li>
            <li>• <strong>E-mail admin</strong> : Notification de nouvelle commande</li>
            <li>• <strong>Commande test</strong> : T-shirt Rouge (x2) + Jean Bleu (x1) = 95.96€</li>
          </ul>
        </div>

        {/* Bouton de test */}
        <Button 
          onClick={handleTestEmails}
          disabled={isLoading || !testData.customerEmail || !testData.adminEmail}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Envoyer les E-mails de Test
            </>
          )}
        </Button>

        {/* Résultats */}
        {results && (
          <div className="space-y-3">
            <h4 className="font-semibold">📊 Résultats :</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                {results.customer ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <div className="font-medium">E-mail Client</div>
                  <Badge variant={results.customer ? "default" : "destructive"}>
                    {results.customer ? "Envoyé" : "Échec"}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                {results.admin ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <div className="font-medium">E-mail Admin</div>
                  <Badge variant={results.admin ? "default" : "destructive"}>
                    {results.admin ? "Envoyé" : "Échec"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Resend */}
        <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            ⚙️ Configuration requise :
          </h4>
          <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
            <li>• Créer un compte sur <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline">resend.com</a></li>
            <li>• Obtenir une clé API gratuite (3,000 e-mails/mois)</li>
            <li>• Remplacer <code>VITE_RESEND_API_KEY</code> dans <code>.env.local</code></li>
            <li>• Configurer <code>VITE_FROM_EMAIL</code> avec votre domaine</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailTestPanel;
