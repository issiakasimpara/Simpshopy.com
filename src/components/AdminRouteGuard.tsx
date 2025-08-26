import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoadingFallback from './LoadingFallback';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { user, session, loading } = useAuth();

  // 🔍 LOGS DE DIAGNOSTIC
  console.log('🔍 AdminRouteGuard - État actuel:', {
    user: user ? `✅ Connecté: ${user.email}` : '❌ Non connecté',
    session: session ? '✅ Session active' : '❌ Pas de session',
    loading: loading ? '⏳ Chargement...' : '✅ Chargé',
    pathname: window.location.pathname,
    hostname: window.location.hostname
  });

  // Supprimer la logique de redirection pour éviter la boucle
  // Laisser DomainBasedRouter gérer les redirections

  // Afficher un loader pendant la vérification de l'authentification
  if (loading) {
    console.log('🔍 AdminRouteGuard - Affichage du loader (loading=true)');
    return <LoadingFallback />;
  }

  // Si l'utilisateur n'est pas connecté, afficher un message d'erreur
  if (!user || !session) {
    console.log('🔍 AdminRouteGuard - Utilisateur non connecté, affichage du message de vérification');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification de l'authentification...</p>
          {/* MESSAGE TEMPORAIRE POUR DIAGNOSTIC */}
          <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>🔍 DIAGNOSTIC :</strong><br/>
              User: {user ? '✅ Connecté' : '❌ Non connecté'}<br/>
              Session: {session ? '✅ Active' : '❌ Pas de session'}<br/>
              Loading: {loading ? '⏳ En cours' : '✅ Terminé'}<br/>
              Pathname: {window.location.pathname}<br/>
              Hostname: {window.location.hostname}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, afficher le contenu admin
  console.log('🔍 AdminRouteGuard - Utilisateur connecté, affichage du contenu admin');
  return <>{children}</>;
};

export default AdminRouteGuard;
