import { supabase } from '../integrations/supabase/client';

export interface InstalledIntegration {
  id: string;
  user_id: string;
  integration_id: string;
  installed_at: string;
}

export async function getInstalledIntegrations(userId: string): Promise<InstalledIntegration[]> {
  const { data, error } = await supabase
    .from('installed_integrations')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data || [];
}

export async function installIntegration(userId: string, integrationId: string) {
  const { data, error } = await supabase
    .from('installed_integrations')
    .insert([{ user_id: userId, integration_id: integrationId }]);
  if (error) throw error;
  return data;
}

export async function uninstallIntegration(userId: string, integrationId: string) {
  const { error } = await supabase
    .from('installed_integrations')
    .delete()
    .eq('user_id', userId)
    .eq('integration_id', integrationId);
  if (error) throw error;
  return true;
} 