import { supabase } from './supabase';
import type { HealthRecord } from './types';

const TABLE_NAME = 'health_records';

export async function getHealthFromSupabase(): Promise<HealthRecord[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('nextCheckup', { ascending: true });

  if (error) {
    console.error('Error cargando registros sanitarios:', error.message);
    throw error;
  }

  return (data || []) as HealthRecord[];
}

export async function saveHealthInSupabase(
  item: Partial<HealthRecord>
): Promise<HealthRecord> {
  const payload = {
    cattleId: item.cattleId || '',
    diagnosis: item.diagnosis || '',
    treatment: item.treatment || '',
    vaccine: item.vaccine || '',
    nextCheckup: item.nextCheckup || new Date().toISOString().slice(0, 10),
    status: item.status || 'Pendiente'
  };

  if (item.id) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando registro sanitario:', error.message);
      throw error;
    }

    return data as HealthRecord;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creando registro sanitario:', error.message);
    throw error;
  }

  return data as HealthRecord;
}

export async function deleteHealthFromSupabase(id: string) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error eliminando registro sanitario:', error.message);
    throw error;
  }

  return true;
}