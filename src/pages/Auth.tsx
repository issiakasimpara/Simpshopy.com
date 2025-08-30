
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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
  
  const { signUp, signIn, signInWithGoogle, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Gestion de la redirection selon le domaine
  useEffect(() => {
    const currentHostname = window.location.hostname;
    
    // Si on est sur simpshopy.com en production, rediriger vers admin.simpshopy.com
    if (currentHostname === 'simpshopy.com' || currentHostname === 'www.simpshopy.com') {
      window.location.href = 'https://admin.simpshopy.com/auth';
      return;
    }
    
    // En développement local, on reste sur localhost/auth
    // Sur admin.simpshopy.com, on reste sur admin.simpshopy.com/auth
  }, []);

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

    try {
      const { data, error } = await signIn(signInData.email, signInData.password);

      if (error) {
        toast({
          title: "Erreur de connexion",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Connexion réussie !",
          description: "Bienvenue ! Redirection vers votre tableau de bord...",
        });
        // Redirection vers admin.simpshopy.com/dashboard
        const currentHostname = window.location.hostname;
        if (currentHostname === 'admin.simpshopy.com') {
          navigate('/dashboard');
        } else {
          window.location.href = 'https://admin.simpshopy.com/dashboard';
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        toast({
          title: "Erreur de connexion Google",
          description: error.message,
          variant: "destructive"
        });
        setIsGoogleLoading(false);
      }
      // Si pas d'erreur, l'utilisateur sera redirigé automatiquement
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de se connecter avec Google",
        variant: "destructive"
      });
      setIsGoogleLoading(false);
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
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Vérifiez votre email</CardTitle>
              <CardDescription>
                Nous avons envoyé un lien de confirmation à <strong>{confirmationEmail}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 text-left">
                    <p className="font-medium mb-1">Prochaines étapes :</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Ouvrez votre boîte de réception</li>
                      <li>Cliquez sur le lien de confirmation</li>
                      <li>Vous serez redirigé vers votre tableau de bord</li>
                    </ol>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Vous n'avez pas reçu l'email ?</p>
                <Button
                  variant="link"
                  className="text-blue-600 p-0 h-auto"
                  onClick={handleResendConfirmation}
                  disabled={isLoading}
                >
                  Renvoyer l'email de confirmation
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
              
              {/* Bouton Google */}
              <CardContent className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-white hover:bg-gray-50 border-gray-300 text-gray-700 font-medium"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      Connexion...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continuer avec Google
                    </div>
                  )}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Ou</span>
                  </div>
                </div>
                
                <form onSubmit={handleSignIn} className="space-y-4">
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
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>
              </CardContent>
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
              
              {/* Bouton Google */}
              <CardContent className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-white hover:bg-gray-50 border-gray-300 text-gray-700 font-medium"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      Inscription...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continuer avec Google
                    </div>
                  )}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Ou</span>
                  </div>
                </div>
                
                <form onSubmit={handleSignUp} className="space-y-4">
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
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Création..." : "Créer mon compte"}
                  </Button>
                </form>
              </CardContent>
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
