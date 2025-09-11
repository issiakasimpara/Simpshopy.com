// ⚡ STOREFRONT INSTANTANÉ
// Date: 2025-01-28
// Objectif: Affichage instantané AVANT le chargement de React

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

interface InstantStorefrontProps {
  children: React.ReactNode;
}

export default function InstantStorefront({ children }: InstantStorefrontProps) {
  const { storeSlug } = useParams();
  const [showInstant, setShowInstant] = useState(false);

  useEffect(() => {
    // Afficher le contenu instantané immédiatement
    setShowInstant(true);
    
    // Injecter le HTML instantané dans le DOM
    const instantHTML = `
      <div id="instant-storefront" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        z-index: 9999;
        display: flex;
        flex-direction: column;
      ">
        <!-- Header instantané -->
        <header style="
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        ">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="
              width: 40px;
              height: 40px;
              background: #3b82f6;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
            ">S</div>
            <h1 style="margin: 0; color: #1e293b; font-size: 1.5rem; font-weight: 600;">
              ${storeSlug || 'Boutique'}
            </h1>
          </div>
          <div style="
            width: 40px;
            height: 40px;
            background: #f1f5f9;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #64748b;
          ">🛒</div>
        </header>

        <!-- Hero section instantané -->
        <section style="
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
        ">
          <div>
            <h2 style="
              font-size: 3rem;
              font-weight: 700;
              margin: 0 0 1rem 0;
              text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            ">Bienvenue dans notre boutique</h2>
            <p style="
              font-size: 1.25rem;
              margin: 0 0 2rem 0;
              opacity: 0.9;
            ">Découvrez nos produits exceptionnels</p>
            <button style="
              background: white;
              color: #667eea;
              border: none;
              padding: 1rem 2rem;
              border-radius: 8px;
              font-size: 1.1rem;
              font-weight: 600;
              cursor: pointer;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              transition: transform 0.2s;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
              Voir les produits
            </button>
          </div>
        </section>

        <!-- Products grid instantané -->
        <section style="
          padding: 3rem 2rem;
          background: white;
        ">
          <div style="max-width: 1200px; margin: 0 auto;">
            <h3 style="
              text-align: center;
              font-size: 2rem;
              font-weight: 600;
              margin: 0 0 2rem 0;
              color: #1e293b;
            ">Nos produits</h3>
            <div style="
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 2rem;
            ">
              ${Array.from({ length: 6 }, (_, i) => `
                <div style="
                  background: white;
                  border-radius: 12px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                  overflow: hidden;
                  transition: transform 0.2s;
                " onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='translateY(0)'">
                  <div style="
                    height: 200px;
                    background: linear-gradient(45deg, #f1f5f9, #e2e8f0);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #64748b;
                    font-size: 1.2rem;
                  ">Produit ${i + 1}</div>
                  <div style="padding: 1.5rem;">
                    <h4 style="
                      margin: 0 0 0.5rem 0;
                      font-size: 1.1rem;
                      font-weight: 600;
                      color: #1e293b;
                    ">Produit ${i + 1}</h4>
                    <p style="
                      margin: 0 0 1rem 0;
                      color: #64748b;
                      font-size: 0.9rem;
                    ">Description du produit ${i + 1}</p>
                    <div style="
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                    ">
                      <span style="
                        font-size: 1.25rem;
                        font-weight: 700;
                        color: #059669;
                      ">€${(Math.random() * 100 + 10).toFixed(2)}</span>
                      <button style="
                        background: #3b82f6;
                        color: white;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 6px;
                        font-size: 0.9rem;
                        font-weight: 500;
                        cursor: pointer;
                      ">Ajouter</button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>

        <!-- Footer instantané -->
        <footer style="
          background: #1e293b;
          color: white;
          padding: 2rem;
          text-align: center;
        ">
          <p style="margin: 0; opacity: 0.8;">
            © 2025 ${storeSlug || 'Boutique'}. Tous droits réservés.
          </p>
        </footer>
      </div>
    `;

    // Injecter le HTML instantané
    document.body.insertAdjacentHTML('afterbegin', instantHTML);

    // Supprimer le contenu instantané après 2 secondes ou quand React est prêt
    const cleanup = () => {
      const instantElement = document.getElementById('instant-storefront');
      if (instantElement) {
        instantElement.remove();
      }
    };

    // Nettoyer après 2 secondes maximum
    const timer = setTimeout(cleanup, 2000);

    // Nettoyer quand React est prêt
    const checkReactReady = () => {
      if (document.querySelector('[data-reactroot]') || document.querySelector('#root > *')) {
        cleanup();
        clearTimeout(timer);
      } else {
        setTimeout(checkReactReady, 100);
      }
    };

    checkReactReady();

    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [storeSlug]);

  // Afficher le contenu React normal
  return <>{children}</>;
}
