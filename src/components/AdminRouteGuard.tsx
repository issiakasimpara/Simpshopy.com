import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoadingFallback from './LoadingFallback';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { user, session, loading } = useAuth();

  // Supprimer la logique de redirection pour éviter la boucle
  // Laisser DomainBasedRouter gérer les redirections

  // Afficher un loader pendant la vérification de l'authentification
  if (loading) {
    return <LoadingFallback />;
  }

  // Si l'utilisateur n'est pas connecté, afficher un message d'erreur
  if (!user || !session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, afficher le contenu admin
  return <>{children}</>;
};

export default AdminRouteGuard;
