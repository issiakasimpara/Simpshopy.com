
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useStores } from '@/hooks/useStores';
import AppLogo from '@/components/ui/AppLogo';
import OptimizedViewStoreButton from '@/components/ui/OptimizedViewStoreButton';
import {
  Home,
  Package,
  Grid3X3,
  ShoppingCart,
  Users,
  Truck,
  MessageSquare,
  BarChart3,
  CreditCard,
  Store,
  Palette,
  Globe,
  ExternalLink,
  Settings,
  Menu,
  Bell,
  LogOut,
  Tag,
  Gift
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { store, hasStore } = useStores();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
      // Rediriger vers la page d'accueil principale après la déconnexion
      window.location.href = 'https://simpshopy.com';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la déconnexion.",
        variant: "destructive"
      });
    }
  };

  const navigation = [
    { 
      name: "Tableau de bord", 
      href: "/dashboard", 
      icon: Home,
      color: "from-blue-500 to-purple-500",
      iconBg: "from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    { 
      name: "Produits", 
      href: "/products", 
      icon: Package,
      color: "from-green-500 to-emerald-500",
      iconBg: "from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40",
      iconColor: "text-green-600 dark:text-green-400"
    },
    { 
      name: "Catégories", 
      href: "/categories", 
      icon: Grid3X3,
      color: "from-orange-500 to-amber-500",
      iconBg: "from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40",
      iconColor: "text-orange-600 dark:text-orange-400"
    },
    { 
      name: "Commandes", 
      href: "/orders", 
      icon: ShoppingCart,
      color: "from-red-500 to-pink-500",
      iconBg: "from-red-100 to-pink-100 dark:from-red-900/40 dark:to-pink-900/40",
      iconColor: "text-red-600 dark:text-red-400"
    },
    { 
      name: "Clients", 
      href: "/customers", 
      icon: Users,
      color: "from-purple-500 to-pink-500",
      iconBg: "from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    { 
      name: "Livraisons", 
      href: "/shipping", 
      icon: Truck,
      color: "from-indigo-500 to-blue-500",
      iconBg: "from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40",
      iconColor: "text-indigo-600 dark:text-indigo-400"
    },
    { 
      name: "Témoignages", 
      href: "/testimonials-admin", 
      icon: MessageSquare,
      color: "from-teal-500 to-cyan-500",
      iconBg: "from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40",
      iconColor: "text-teal-600 dark:text-teal-400"
    },
    { 
      name: "Analyses", 
      href: "/analytics", 
      icon: BarChart3,
      color: "from-violet-500 to-purple-500",
      iconBg: "from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40",
      iconColor: "text-violet-600 dark:text-violet-400"
    },
    { 
      name: "Popups et Reductions", 
      href: "/popups-reductions", 
      icon: Gift,
      color: "from-blue-500 to-indigo-500",
      iconBg: "from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    { 
      name: "Paiements", 
      href: "/payments", 
      icon: CreditCard,
      color: "from-yellow-500 to-orange-500",
      iconBg: "from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40",
      iconColor: "text-yellow-600 dark:text-yellow-400"
    },
    { 
      name: "Ma boutique", 
      href: "/store-config", 
      icon: Store,
      color: "from-emerald-500 to-green-500",
      iconBg: "from-emerald-100 to-green-100 dark:from-emerald-900/40 dark:to-green-900/40",
      iconColor: "text-emerald-600 dark:text-emerald-400"
    },
    { 
      name: "Thèmes", 
      href: "/themes", 
      icon: Palette,
      color: "from-pink-500 to-rose-500",
      iconBg: "from-pink-100 to-rose-100 dark:from-pink-900/40 dark:to-rose-900/40",
      iconColor: "text-pink-600 dark:text-pink-400"
    },
    { 
      name: "Domaines", 
      href: "/domains", 
      icon: Globe,
      color: "from-cyan-500 to-blue-500",
      iconBg: "from-cyan-100 to-blue-100 dark:from-cyan-900/40 dark:to-blue-900/40",
      iconColor: "text-cyan-600 dark:text-cyan-400"
    },
    { 
      name: "Intégrations", 
      href: "/integrations", 
      icon: ExternalLink,
      color: "from-slate-500 to-gray-500",
      iconBg: "from-slate-100 to-gray-100 dark:from-slate-900/40 dark:to-gray-900/40",
      iconColor: "text-slate-600 dark:text-slate-400"
    },
    { 
      name: "Paramètres", 
      href: "/settings", 
      icon: Settings,
      color: "from-gray-500 to-slate-500",
      iconBg: "from-gray-100 to-slate-100 dark:from-gray-900/40 dark:to-slate-900/40",
      iconColor: "text-gray-600 dark:text-gray-400"
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 flex transition-colors duration-300">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setSidebarOpen(false)} 
          />
        </div>
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 sm:w-72 bg-slate-100 dark:bg-slate-800 transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="flex items-center h-20 px-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <Link to="/dashboard" className="group transition-transform duration-200 hover:scale-105">
            <AppLogo size="md" useRealLogo={true} />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item, index) => {
            const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                to={item.href}
                tabIndex={0}
                className={cn(
                  "group flex items-center px-3 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  isActive
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg scale-105`
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                onClick={() => setSidebarOpen(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSidebarOpen(false);
                  }
                }}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn(
                  "p-2 rounded-lg mr-3 transition-all duration-300",
                  isActive 
                    ? "bg-white/20" 
                    : `bg-gradient-to-br ${item.iconBg}`
                )}>
                  <item.icon className={cn(
                    "h-4 w-4 transition-all duration-300", 
                    isActive 
                      ? "text-white" 
                      : item.iconColor
                  )} />
                </div>
                
                <span className="flex-1">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Section utilisateur */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 flex-shrink-0">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white text-sm font-bold">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Issiaka'}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-4 ml-auto">
            <Button variant="ghost" size="sm" className="relative group hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full shadow-lg animate-pulse"></span>
            </Button>
            <OptimizedViewStoreButton />
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
