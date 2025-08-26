
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, AlertCircle, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AppLogo from '@/components/ui/AppLogo';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  
  const { signUp, signIn, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Supprimer la redirection automatique pour éviter la boucle
  // Laisser DomainBasedRouter gérer les redirections

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signUpData.password !== signUpData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    const { error } = await signUp(
      signUpData.email, 
      signUpData.password, 
      signUpData.firstName, 
      signUpData.lastName
    );
    
    if (error) {
      toast({
        title: "Erreur d'inscription",
        description: error.message === 'User already registered' 
          ? "Un compte existe déjà avec cette adresse email"
          : error.message,
        variant: "destructive"
      });
    } else {
      // Afficher l'écran de confirmation d'email
      setConfirmationEmail(signUpData.email);
      setShowEmailConfirmation(true);
      toast({
        title: "Inscription réussie !",
        description: "Vérifiez votre email pour confirmer votre compte.",
      });
    }
    
    setIsLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('🔍 Auth - Début de la connexion pour:', signInData.email);

    try {
      const { data, error } = await signIn(signInData.email, signInData.password);

      if (error) {
        console.log('🔍 Auth - Erreur de connexion:', error);
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive"
        });
      } else {
        console.log('🔍 Auth - Connexion réussie, redirection en cours...');
        toast({
          title: "Connexion réussie !",
          description: "Bienvenue ! Redirection vers votre tableau de bord...",
        });
        // Redirection directe sans délai
        const currentHostname = window.location.hostname;
        console.log('🔍 Auth - Hostname actuel:', currentHostname);
        if (currentHostname === 'admin.simpshopy.com') {
          console.log('🔍 Auth - Redirection vers /onboarding (même domaine)');
          // DÉLAI TEMPORAIRE POUR CAPTURER LES LOGS
          setTimeout(() => {
            navigate('/onboarding');
          }, 3000); // 3 secondes de délai
        } else {
          console.log('🔍 Auth - Redirection vers /dashboard (même domaine)');
          // DÉLAI TEMPORAIRE POUR CAPTURER LES LOGS
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000); // 3 secondes de délai
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.log('🔍 Auth - Erreur inattendue:', error);
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setIsLoading(true);
    
    const { error } = await signUp(
      confirmationEmail, 
      signUpData.password, 
      signUpData.firstName, 
      signUpData.lastName
    );
    
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de renvoyer l'email de confirmation",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Email renvoyé !",
        description: "Vérifiez votre boîte de réception.",
      });
    }
    
    setIsLoading(false);
  };

  // Si on affiche la confirmation d'email
  if (showEmailConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block">
              <AppLogo size="lg" useRealLogo={true} />
            </Link>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Confirmez votre email</CardTitle>
              <CardDescription>
                Nous avons envoyé un lien de confirmation à
              </CardDescription>
              <div className="font-medium text-blue-600 mt-2">{confirmationEmail}</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Étapes à suivre :</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Vérifiez votre boîte de réception</li>
                      <li>Cliquez sur le lien de confirmation</li>
                      <li>Vous serez automatiquement connecté</li>
                    </ol>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-600">
                <p>Vous n'avez pas reçu l'email ?</p>
                <Button
                  variant="link"
                  className="text-blue-600 p-0 h-auto"
                  onClick={handleResendConfirmation}
                  disabled={isLoading}
                >
                  {isLoading ? "Envoi..." : "Renvoyer l'email"}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowEmailConfirmation(false)}
              >
                Retour à la connexion
              </Button>
            </CardFooter>
          </Card>

          <div className="text-center mt-6">
            <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <AppLogo size="lg" useRealLogo={true} />
          </Link>
          <p className="text-gray-600 mt-2">Créez et gérez votre boutique en ligne</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Connexion</TabsTrigger>
            <TabsTrigger value="signup">Inscription</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Se connecter</CardTitle>
                <CardDescription>
                  Accédez à votre tableau de bord marchand
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={signInData.email}
                      onChange={(e) => setSignInData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Mot de passe</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={signInData.password}
                      onChange={(e) => setSignInData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Créer un compte</CardTitle>
                <CardDescription>
                  Rejoignez Simpshopy et lancez votre boutique
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={signUpData.firstName}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={signUpData.lastName}
                        onChange={(e) => setSignUpData(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  
                  {/* Information sur la confirmation d'email */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium">Confirmation d'email requise</p>
                        <p className="text-xs mt-1">
                          Après l'inscription, vous recevrez un email de confirmation pour activer votre compte.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Création..." : "Créer mon compte"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
