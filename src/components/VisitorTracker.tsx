import { useEffect, useRef } from 'react';
import { useActiveVisitors } from '@/hooks/useActiveVisitors';

interface VisitorTrackerProps {
  storeId: string;
  storeSlug?: string;
}

const VisitorTracker: React.FC<VisitorTrackerProps> = ({ storeId, storeSlug }) => {
  const { trackVisitor, generateSessionId } = useActiveVisitors(storeId);
  const sessionIdRef = useRef<string>('');
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Récupérer les informations du navigateur
    const userAgent = navigator.userAgent;
    const ipAddress = 'unknown'; // En production, récupérer via API

    // Générer un ID de session stable pour ce visiteur
    sessionIdRef.current = generateSessionId(userAgent, ipAddress);

    // Tracker le visiteur initial
    const trackInitialVisit = async () => {
      await trackVisitor(sessionIdRef.current, userAgent, ipAddress);
    };

    trackInitialVisit();

    // Heartbeat toutes les 30 secondes pour maintenir la session active
    heartbeatIntervalRef.current = setInterval(async () => {
      await trackVisitor(sessionIdRef.current, userAgent, ipAddress);
    }, 30 * 1000);

    // Tracker les interactions utilisateur
    const handleUserActivity = async () => {
      await trackVisitor(sessionIdRef.current, userAgent, ipAddress);
    };

    // Écouter les événements d'activité utilisateur
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Tracker le changement de page
    const handlePageChange = async () => {
      await trackVisitor(sessionIdRef.current, userAgent, ipAddress);
    };

    // Écouter les changements de route (si applicable)
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePageChange);
    }

    // Cleanup lors du démontage
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });

      if (typeof window !== 'undefined') {
        window.removeEventListener('popstate', handlePageChange);
      }
    };
  }, [storeId, trackVisitor, generateSessionId]);

  // Composant invisible - ne rend rien
  return null;
};

export default VisitorTracker;
