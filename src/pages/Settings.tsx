
import { useState } from "react";
import { 
  User, 
  Shield, 
  Bell, 
  Palette,
  Coins,
  Settings as SettingsIcon,
  CreditCard,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  LogOut,
  Bell as BellIcon,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useStores } from "@/hooks/useStores";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { ProfileTab } from "@/components/settings/ProfileTab";
import { SecurityTab } from "@/components/settings/SecurityTab";
import { NotificationsTab } from "@/components/settings/NotificationsTab";
import { AppearanceTab } from "@/components/settings/AppearanceTab";
import { CurrencyAndLanguageSection } from "@/components/settings/sections/CurrencySection";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const Settings = () => {
  const { toast } = useToast();
  const { store } = useStores();
  const { user, signOut } = useAuth();
  const [activeMainSection, setActiveMainSection] = useState("compte");
  const [expandedSection, setExpandedSection] = useState<string | null>("compte");
  const [activeSubSection, setActiveSubSection] = useState("profile");

  const {
    profileData,
    notifications,
    loading,
    setProfileData,
    setNotifications,
    updateProfile,
    updatePassword
  } = useUserSettings();

  const handleProfileSave = async () => {
    await updateProfile(profileData);
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    if (!currentPassword || !newPassword) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive",
      });
      return;
    }
    
    await updatePassword(currentPassword, newPassword);
  };

  const handleNotificationSave = () => {
    toast({
      title: "Préférences sauvegardées",
      description: "Vos paramètres de notification ont été mis à jour.",
    });
  };

  const handleMainSectionClick = (sectionId: string) => {
    if (sectionId === "compte") {
      // Si on clique sur Compte, on expand/collapse
      setExpandedSection(expandedSection === "compte" ? null : "compte");
      setActiveMainSection("compte");
    } else {
      // Si on clique sur un autre onglet principal, on collapse Compte
      setExpandedSection(null);
      setActiveMainSection(sectionId);
    }
  };

  const handleSubSectionClick = (subSectionId: string) => {
    setActiveSubSection(subSectionId);
    setActiveMainSection("compte");
  };

  const mainSections = [
    {
      id: "compte",
      label: "Compte",
      icon: SettingsIcon,
      color: "from-blue-500 to-purple-500",
      iconBg: "from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40",
      iconColor: "text-blue-600 dark:text-blue-400",
      hasSubSections: true
    },
    {
      id: "abonnement",
      label: "Abonnement",
      icon: CreditCard,
      color: "from-green-500 to-emerald-500",
      iconBg: "from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40",
      iconColor: "text-green-600 dark:text-green-400",
      hasSubSections: false
    }
  ];

  const compteSubSections = [
    {
      id: "profile",
      label: "Profil",
      icon: User,
      color: "from-blue-500 to-purple-500"
    },
    {
      id: "security",
      label: "Sécurité",
      icon: Shield,
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      color: "from-orange-500 to-amber-500"
    },
    {
      id: "appearance",
      label: "Apparence",
      icon: Palette,
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "currency",
      label: "Devise et langue",
      icon: Coins,
      color: "from-yellow-500 to-orange-500"
    }
  ];

  const renderContent = () => {
    if (activeMainSection === "compte") {
      switch (activeSubSection) {
        case "profile":
          return (
            <ProfileTab
              profileData={profileData}
              loading={loading}
              onProfileDataChange={setProfileData}
              onSave={handleProfileSave}
            />
          );
        case "security":
          return (
            <SecurityTab
              loading={loading}
              onPasswordChange={handlePasswordChange}
            />
          );
        case "notifications":
          return (
            <NotificationsTab
              notifications={notifications}
              onNotificationsChange={setNotifications}
              onSave={handleNotificationSave}
            />
          );
        case "appearance":
          return <AppearanceTab />;
        case "currency":
          return <CurrencyAndLanguageSection storeId={store?.id} />;
        default:
          return null;
      }
    } else if (activeMainSection === "abonnement") {
      return (
        <div className="space-y-6">
          <div className="text-center py-12">
            <div className="p-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 rounded-2xl inline-block mb-4">
              <CreditCard className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
              Gestion de l'abonnement
            </h2>
            <p className="text-muted-foreground">
              Gérez votre plan d'abonnement et vos factures
            </p>
          </div>
          {/* Contenu de l'abonnement à implémenter */}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="settings-fullscreen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/20">
      {/* Header de la page */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="w-full px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo et navigation */}
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Retour au dashboard</span>
              </Link>
            </div>

            {/* Actions de droite */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <BellIcon className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </Button>

              {/* Voir le site */}
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Voir le site
              </Button>

              {/* Profil utilisateur */}
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {user?.email}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="w-full p-6">
        <div className="relative">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20 pointer-events-none" />
          
          <div className="relative space-y-6">
            <SettingsHeader />

            <div className="bg-gradient-to-br from-background/95 via-background to-muted/5 backdrop-blur-sm border border-border/50 shadow-xl p-6 min-h-[calc(100vh-8rem)]">
              <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-full">
                {/* Sidebar */}
                <div className="lg:w-64 flex-shrink-0">
                  <div className="bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 border border-border/30 rounded-xl p-4 shadow-lg">
                    <div className="space-y-2">
                      {/* Onglets principaux */}
                      {mainSections.map((section) => {
                        const Icon = section.icon;
                        const isActive = activeMainSection === section.id;
                        const isExpanded = expandedSection === section.id;
                        
                        return (
                          <div key={section.id}>
                            <button
                              onClick={() => handleMainSectionClick(section.id)}
                              className={cn(
                                "w-full flex items-center justify-between gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-muted/50",
                                isActive 
                                  ? `bg-gradient-to-r ${section.color} text-white shadow-lg scale-105` 
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "p-2 rounded-lg transition-all duration-300",
                                  isActive 
                                    ? "bg-white/20" 
                                    : `bg-gradient-to-br ${section.iconBg}`
                                )}>
                                  <Icon className={cn(
                                    "h-4 w-4 transition-all duration-300",
                                    isActive 
                                      ? "text-white" 
                                      : section.iconColor
                                  )} />
                                </div>
                                <span className="font-semibold text-sm">{section.label}</span>
                              </div>
                              {section.hasSubSections && (
                                <div className={cn(
                                  "transition-transform duration-300",
                                  isExpanded ? "rotate-180" : "rotate-0"
                                )}>
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </div>
                              )}
                            </button>

                            {/* Sous-onglets pour Compte */}
                            {section.hasSubSections && isExpanded && (
                              <div className="mt-2 ml-4 space-y-1">
                                {compteSubSections.map((subSection) => {
                                  const SubIcon = subSection.icon;
                                  const isSubActive = activeSubSection === subSection.id;
                                  
                                  return (
                                    <button
                                      key={subSection.id}
                                      onClick={() => handleSubSectionClick(subSection.id)}
                                      className={cn(
                                        "w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-300 hover:bg-muted/30 text-left",
                                        isSubActive 
                                          ? `bg-gradient-to-r ${subSection.color} text-white shadow-md` 
                                          : "text-muted-foreground hover:text-foreground"
                                      )}
                                    >
                                      <SubIcon className={cn(
                                        "h-3 w-3 transition-all duration-300",
                                        isSubActive ? "text-white" : "text-muted-foreground"
                                      )} />
                                      <span className="text-xs font-medium">{subSection.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 h-full">
                  <div className="space-y-6 h-full">
                    {renderContent()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
