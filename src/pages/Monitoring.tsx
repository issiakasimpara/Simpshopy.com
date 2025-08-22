import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import MonitoringDashboard from '@/components/monitoring/MonitoringDashboard';
import TestRunner from '@/components/monitoring/TestRunner';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Monitoring: React.FC = () => {
  const { user } = useAuth();

  // Vérifier si l'utilisateur est admin (optionnel)
  const isAdmin = user?.email === 'admin@simpshopy.com' || import.meta.env.DEV;

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Accès Restreint
            </h2>
            <p className="text-muted-foreground">
              Cette page n'est accessible qu'aux administrateurs.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6">
        <Tabs defaultValue="monitoring" className="space-y-6">
          <TabsList>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="tests">Tests Automatisés</TabsTrigger>
          </TabsList>
          
          <TabsContent value="monitoring">
            <MonitoringDashboard />
          </TabsContent>
          
          <TabsContent value="tests">
            <TestRunner />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Monitoring; 