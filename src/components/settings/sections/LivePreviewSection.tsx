
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Sparkles, Activity } from "lucide-react";
import { useDisplaySettings } from "@/hooks/useDisplaySettings";
import { useTheme } from "next-themes";

export const LivePreviewSection = () => {
  const { settings } = useDisplaySettings();
  const { theme, systemTheme } = useTheme();



  const getThemeStatus = () => {
    if (theme === "system") {
      return `Suit le système (${systemTheme === "dark" ? "Sombre" : "Clair"})`;
    }
    return theme === "dark" ? "Sombre" : "Clair";
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-background via-background to-muted/20">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-fuchsia-500/5 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
      
      <CardHeader className="relative pb-4">
        <CardTitle className="flex items-center gap-4">
          <div className="relative p-3 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 rounded-xl shadow-inner">
            <Eye className="h-6 w-6 text-violet-600 dark:text-violet-400" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl" />
          </div>
          <div className="flex-1">
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
              Aperçu temps réel
            </span>
            <p className="text-sm text-muted-foreground font-medium mt-1 flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500 animate-pulse" />
              Configuration appliquée instantanément
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative">
        <div className="p-8 bg-gradient-to-br from-muted/20 via-muted/30 to-muted/40 rounded-2xl border-2 border-dashed border-muted-foreground/20 space-y-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-lg">
              <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
              Configuration actuelle
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 rounded-xl border border-orange-200/50 dark:border-orange-800/50">
              <div className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-2">Taille Police</div>
              <div className="text-base font-bold text-orange-800 dark:text-orange-200">
                {settings.fontSize === 'small' ? 'Petite' : settings.fontSize === 'large' ? 'Grande' : 'Normale'}
              </div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 rounded-xl border border-cyan-200/50 dark:border-cyan-800/50">
              <div className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-2">Mode Compact</div>
              <Badge 
                variant={settings.compactMode ? "default" : "secondary"} 
                className={`text-sm font-bold px-3 py-1 ${settings.compactMode 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {settings.compactMode ? 'Activé' : 'Désactivé'}
              </Badge>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
              <div className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-2">Animations</div>
              <Badge 
                variant={settings.animations ? "default" : "secondary"} 
                className={`text-sm font-bold px-3 py-1 ${settings.animations 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                {settings.animations ? 'Activées' : 'Désactivées'}
              </Badge>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50">
              <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2">Thème</div>
              <div className="text-base font-bold text-indigo-800 dark:text-indigo-200">{getThemeStatus()}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
