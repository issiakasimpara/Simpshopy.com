import React from 'react';
import { useLocation } from 'react-router-dom';
import { PreloadingIndicator } from './PreloadingIndicator';

const ConditionalPreloading: React.FC = () => {
  const location = useLocation();
  
  // Déterminer si nous sommes sur une page admin (pas la boutique publique)
  const isAdminPage = !location.pathname.startsWith('/store/') && 
                     !location.pathname.startsWith('/cart') && 
                     !location.pathname.startsWith('/checkout') && 
                     !location.pathname.startsWith('/payment-success') &&
                     location.pathname !== '/';

  // Afficher le preloading UNIQUEMENT sur les pages admin
  if (!isAdminPage) {
    return null;
  }

  return <PreloadingIndicator showProgress={true} showDetails={false} />;
};

export default ConditionalPreloading;
