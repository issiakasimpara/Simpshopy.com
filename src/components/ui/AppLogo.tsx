import { Store } from "lucide-react";
import { useAppConfig } from "@/hooks/useAppConfig";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  textClassName?: string;
  iconClassName?: string;
  useRealLogo?: boolean; // Option pour utiliser le vrai logo ou l'icône générique
}

const AppLogo = ({
  size = 'md',
  showText = true,
  className,
  textClassName,
  iconClassName,
  useRealLogo = true
}: AppLogoProps) => {
  const { appName } = useAppConfig();

  const sizeClasses = {
    xs: {
      container: "flex items-center space-x-1.5",
      icon: "h-3 w-3",
      logo: "h-4 w-4",
      iconContainer: "p-1 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md",
      logoContainer: "p-0.5 bg-white rounded-md shadow-sm",
      text: "text-sm font-bold"
    },
    sm: {
      container: "flex items-center space-x-2",
      icon: "h-4 w-4",
      logo: "h-6 w-6",
      iconContainer: "p-1.5 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg",
      logoContainer: "p-1 bg-white rounded-lg shadow-md",
      text: "text-base sm:text-lg font-bold"
    },
    md: {
      container: "flex items-center space-x-2 sm:space-x-3",
      icon: "h-5 w-5 sm:h-6 sm:w-6",
      logo: "h-6 w-6 sm:h-8 sm:w-8",
      iconContainer: "p-1.5 sm:p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg sm:rounded-xl",
      logoContainer: "p-1 sm:p-1.5 bg-white rounded-lg sm:rounded-xl shadow-md sm:shadow-lg",
      text: "text-lg sm:text-xl lg:text-2xl font-bold"
    },
    lg: {
      container: "flex items-center space-x-3 sm:space-x-4",
      icon: "h-6 w-6 sm:h-8 sm:w-8",
      logo: "h-8 w-8 sm:h-10 sm:w-10",
      iconContainer: "p-2 sm:p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl sm:rounded-2xl",
      logoContainer: "p-1.5 sm:p-2 bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl",
      text: "text-xl sm:text-2xl lg:text-3xl font-bold"
    },
    xl: {
      container: "flex items-center space-x-4 sm:space-x-6",
      icon: "h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12",
      logo: "h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16",
      iconContainer: "p-3 sm:p-4 lg:p-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl lg:rounded-3xl",
      logoContainer: "p-2 sm:p-3 lg:p-4 bg-white rounded-2xl lg:rounded-3xl shadow-xl lg:shadow-2xl",
      text: "text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold"
    }
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn(classes.container, className)}>
      {useRealLogo ? (
        <div className={cn(classes.logoContainer, iconClassName)}>
          <img
            src="/logo-simpshopy.png"
            alt="Simpshopy Logo"
            className={cn(classes.logo, "object-contain")}
            onError={(e) => {
              // Fallback vers l'icône si l'image ne charge pas
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `
                <div class="${classes.iconContainer.replace('bg-white', 'bg-gradient-to-br from-blue-600 to-purple-600')}">
                  <svg class="${classes.icon} text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
              `;
            }}
          />
        </div>
      ) : (
        <div className={cn(classes.iconContainer, iconClassName)}>
          <Store className={cn(classes.icon, "text-white")} />
        </div>
      )}
      {showText && (
        <span className={cn(
          classes.text,
          "text-gray-700",
          textClassName
        )}>
          {appName}
        </span>
      )}
    </div>
  );
};

export default AppLogo;
