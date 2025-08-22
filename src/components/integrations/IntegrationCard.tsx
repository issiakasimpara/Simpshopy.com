import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Integration } from '../../data/integrations';

interface IntegrationCardProps {
  integration: Integration;
  installed?: boolean;
  onInstall?: () => void;
  onUninstall?: () => void;
  loading?: boolean;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ integration, installed, onInstall, onUninstall, loading }) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white dark:bg-card rounded-xl shadow hover:shadow-lg transition p-5 flex flex-col items-start border border-muted/30 cursor-pointer group"
      onClick={() => navigate(`/integrations/${integration.id}`)}
      style={{ minHeight: 220 }}
    >
      <div className="flex items-center gap-3 mb-3 w-full">
        <img
          src={integration.iconUrl}
          alt={integration.name}
          className="w-12 h-12 rounded bg-gray-100 object-contain border"
        />
        <span className="ml-auto px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 font-medium">
          {integration.category}
        </span>
      </div>
      <div className="font-semibold text-lg mb-1 group-hover:text-blue-700 transition-colors">
        {integration.name}
      </div>
      <div className="text-sm text-muted-foreground mb-4 line-clamp-3">
        {integration.description}
      </div>
      {installed ? (
        <button
          className="mt-auto px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-medium transition"
          onClick={e => {
            e.stopPropagation();
            if (onUninstall) onUninstall();
          }}
          disabled={loading}
        >
          Gérée (Désinstaller)
        </button>
      ) : (
        <button
          className="mt-auto px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
          onClick={e => {
            e.stopPropagation();
            if (onInstall) onInstall();
          }}
          disabled={loading}
        >
          Installer
        </button>
      )}
    </div>
  );
};

export default IntegrationCard; 