import { supabase } from './supabase';
import type { AuditLog } from './types';

const TABLE_NAME = 'audit_logs';

export async function getAuditsFromSupabase(): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error cargando auditoría:', error.message);
    throw error;
  }

  return (data || []) as AuditLog[];
}

export async function createAuditInSupabase(
  item: Omit<AuditLog, 'id'>
): Promise<AuditLog> {
  const payload = {
    user: item.user || 'Usuario demo',
    action: item.action || 'Acción',
    module: item.module || 'Sistema',
    description: item.description || '',
    createdAt: item.createdAt || new Date().toISOString()
  };

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error registrando auditoría:', error.message);
    throw error;
  }

  return data as AuditLog;
}

export async function deleteAuditFromSupabase(id: string) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error eliminando auditoría:', error.message);
    throw error;
  }

  return true;
}