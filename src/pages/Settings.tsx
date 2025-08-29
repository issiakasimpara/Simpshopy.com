
import { useState } from "react";
import { 
  User, 
  Shield, 
  Bell, 
  Palette,
  Coins,
  Settings as SettingsIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useStores } from "@/hooks/useStores";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { ProfileTab } from "@/components/settings/ProfileTab";
import { SecurityTab } from "@/components/settings/SecurityTab";
import { NotificationsTab } from "@/components/settings/NotificationsTab";
import { AppearanceTab } from "@/components/settings/AppearanceTab";
import { CurrencySection } from "@/components/settings/sections/CurrencySection";
import { cn } from "@/lib/utils";

const Settings = () => {
  const { toast } = useToast();
  const { store } = useStores();
  const [activeSection, setActiveSection] = useState("profile");

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

  const sidebarItems = [
    {
      id: "profile",
      label: "Profil",
      icon: User,
      activeGradient: "from-blue-500 to-purple-500",
      iconBg: "from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      id: "security",
      label: "Sécurité",
      icon: Shield,
      activeGradient: "from-green-500 to-emerald-500",
      iconBg: "from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40",
      iconColor: "text-green-600 dark:text-green-400"
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      activeGradient: "from-orange-500 to-amber-500",
      iconBg: "from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40",
      iconColor: "text-orange-600 dark:text-orange-400"
    },
    {
      id: "appearance",
      label: "Apparence",
      icon: Palette,
      activeGradient: "from-purple-500 to-pink-500",
      iconBg: "from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40",
      iconColor: "text-purple-600 dark:text-purple-400"
    },
    {
      id: "currency",
      label: "Devise",
      icon: Coins,
      activeGradient: "from-yellow-500 to-orange-500",
      iconBg: "from-yellow-100 to-orange-100 dark:from-yellow-900/40 dark:to-orange-900/40",
      iconColor: "text-yellow-600 dark:text-yellow-400"
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
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
        return <CurrencySection storeId={store?.id} />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="relative">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20 pointer-events-none rounded-3xl" />
        
        <div className="relative space-y-4 sm:space-y-6 lg:space-y-8 p-1">
          <SettingsHeader />

          <div className="bg-gradient-to-br from-background/95 via-background to-muted/5 backdrop-blur-sm rounded-3xl border border-border/50 shadow-xl p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Sidebar */}
              <div className="lg:w-64 flex-shrink-0">
                <div className="bg-gradient-to-br from-muted/50 via-muted/30 to-muted/50 border border-border/30 rounded-2xl p-4 shadow-lg">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl border border-blue-200/30 dark:border-blue-800/30">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-lg">
                        <SettingsIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-bold text-blue-700 dark:text-blue-300">Compte</span>
                    </div>
                    
                                         {sidebarItems.map((item) => {
                       const Icon = item.icon;
                       const isActive = activeSection === item.id;
                       
                       return (
                         <button
                           key={item.id}
                           onClick={() => setActiveSection(item.id)}
                           className={cn(
                             "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-muted/50",
                             isActive 
                               ? `bg-gradient-to-r ${item.activeGradient} text-white shadow-lg scale-105` 
                               : "text-muted-foreground hover:text-foreground"
                           )}
                         >
                           <div className={cn(
                             "p-2 rounded-lg transition-all duration-300",
                             isActive 
                               ? "bg-white/20" 
                               : `bg-gradient-to-br ${item.iconBg}`
                           )}>
                             <Icon className={cn(
                               "h-4 w-4 transition-all duration-300",
                               isActive 
                                 ? "text-white" 
                                 : item.iconColor
                             )} />
                           </div>
                           <span className="font-semibold text-sm">{item.label}</span>
                         </button>
                       );
                     })}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="space-y-6">
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
