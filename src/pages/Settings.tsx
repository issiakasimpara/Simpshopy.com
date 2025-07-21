
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Shield, 
  Bell, 
  Palette
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { useUserSettings } from "@/hooks/useUserSettings";
import { SettingsHeader } from "@/components/settings/SettingsHeader";
import { ProfileTab } from "@/components/settings/ProfileTab";
import { SecurityTab } from "@/components/settings/SecurityTab";
import { NotificationsTab } from "@/components/settings/NotificationsTab";
import { AppearanceTab } from "@/components/settings/AppearanceTab";

const Settings = () => {
  const { toast } = useToast();

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

  return (
    <DashboardLayout>
      <div className="relative">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20 pointer-events-none rounded-3xl" />
        
        <div className="relative space-y-8 p-1">
          <SettingsHeader />

          <div className="bg-gradient-to-br from-background/95 via-background to-muted/5 backdrop-blur-sm rounded-3xl border border-border/50 shadow-xl p-8">
            <Tabs defaultValue="profile" className="space-y-8">
              <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 border border-border/30 shadow-lg rounded-2xl p-2 h-16">
                <TabsTrigger 
                  value="profile" 
                  className="flex items-center gap-3 h-12 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-muted/50"
                >
                  <div className="p-1.5 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 rounded-lg data-[state=active]:bg-white/20">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">Profil</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="flex items-center gap-3 h-12 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-muted/50"
                >
                  <div className="p-1.5 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 rounded-lg data-[state=active]:bg-white/20">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">Sécurité</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="flex items-center gap-3 h-12 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-muted/50"
                >
                  <div className="p-1.5 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 rounded-lg data-[state=active]:bg-white/20">
                    <Bell className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">Notifications</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="appearance" 
                  className="flex items-center gap-3 h-12 rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-105 hover:bg-muted/50"
                >
                  <div className="p-1.5 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 rounded-lg data-[state=active]:bg-white/20">
                    <Palette className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">Apparence</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-8">
                <ProfileTab
                  profileData={profileData}
                  loading={loading}
                  onProfileDataChange={setProfileData}
                  onSave={handleProfileSave}
                />
              </TabsContent>

              <TabsContent value="security" className="mt-8">
                <SecurityTab
                  loading={loading}
                  onPasswordChange={handlePasswordChange}
                />
              </TabsContent>

              <TabsContent value="notifications" className="mt-8">
                <NotificationsTab
                  notifications={notifications}
                  onNotificationsChange={setNotifications}
                  onSave={handleNotificationSave}
                />
              </TabsContent>

              <TabsContent value="appearance" className="mt-8">
                <AppearanceTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
