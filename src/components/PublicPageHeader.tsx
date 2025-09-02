import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AppLogo from "@/components/ui/AppLogo";
import { Menu, X } from "lucide-react";

interface PublicPageHeaderProps {
  activePage?: string;
}

const PublicPageHeader: React.FC<PublicPageHeaderProps> = ({ activePage = "home" }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navigationItems = [
    { path: "/", label: "Accueil", key: "home" },
    { path: "/features", label: "Fonctionnalités", key: "features" },
    { path: "/pricing", label: "Tarifs", key: "pricing" },
    { path: "/testimonials", label: "Témoignages", key: "testimonials" },
    { path: "/why-choose-us", label: "Pourquoi nous choisir", key: "why-choose-us" },
    { path: "/support", label: "Support", key: "support" }
  ];

  return (
    <header className="bg-white shadow-sm border-b relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <AppLogo size="sm" />
          
          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className={`transition-colors font-medium text-sm lg:text-base ${
                  activePage === item.key
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          
          {/* Actions - Toujours visibles même sur mobile */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
              <Link 
                to="https://admin.simpshopy.com/auth"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Se connecter
              </Link>
            </Button>
            <span className="text-gray-600 text-xs sm:text-sm hidden sm:inline">ou</span>
            <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
              <Link 
                to="https://admin.simpshopy.com/auth"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                S'inscrire
              </Link>
            </Button>
          </div>
          
          {/* Bouton Menu Mobile - Seulement pour la navigation */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 ml-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {/* Menu Mobile - Seulement pour la navigation, pas pour les actions */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Navigation Mobile */}
              {navigationItems.map((item) => (
                <Link
                  key={item.key}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    activePage === item.key
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default PublicPageHeader;
