import { supabase } from './supabase';
import type { ClimateRecord } from './types';

const TABLE_NAME = 'climate_records';

export async function getClimateFromSupabase(): Promise<ClimateRecord[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error cargando clima:', error.message);
    throw error;
  }

  return (data || []) as ClimateRecord[];
}

export async function saveClimateInSupabase(
  item: Partial<ClimateRecord>
): Promise<ClimateRecord> {
  const payload = {
    temperature: Number(item.temperature || 0),
    humidity: Number(item.humidity || 0),
    rainfall: Number(item.rainfall || 0),
    eventType: item.eventType || 'Normal',
    location: item.location || 'Ubicación no definida',
    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
    createdAt: item.createdAt || new Date().toISOString()
  };

  if (item.id) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando clima:', error.message);
      throw error;
    }

    return data as ClimateRecord;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creando clima:', error.message);
    throw error;
  }

  return data as ClimateRecord;
}

export async function deleteClimateFromSupabase(id: string) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error eliminando clima:', error.message);
    throw error;
  }

  return true;
}