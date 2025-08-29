
import { Settings } from "lucide-react";

export const SettingsHeader = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-100 dark:bg-slate-800">
          <Settings className="h-8 w-8 text-slate-600 dark:text-slate-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Paramètres
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 mt-2">
            Gérez vos préférences et paramètres de compte
          </p>
        </div>
      </div>
    </div>
  );
};
