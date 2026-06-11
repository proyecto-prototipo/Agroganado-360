import { supabase } from './supabase';
import type { Cattle } from './types';

const TABLE_NAME = 'cattle';

export async function getCattleFromSupabase(): Promise<Cattle[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error cargando ganado:', error.message);
    throw error;
  }

  return (data || []) as Cattle[];
}

export async function saveCattleInSupabase(
  item: Partial<Cattle>
): Promise<Cattle> {
  const payload = {
    code: item.code || '',
    name: item.name || '',
    breed: item.breed || '',
    sex: item.sex || 'Hembra',
    weight: Number(item.weight || 0),
    temperature: Number(item.temperature || 0),
    healthStatus: item.healthStatus || 'Sano',
    location: item.location || '',
    gps: item.gps || '',
    funded: Boolean(item.funded),
    images: (item.images || []).slice(0, 4)
  };

  if (item.id) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando ganado:', error.message);
      throw error;
    }

    return data as Cattle;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creando ganado:', error.message);
    throw error;
  }

  return data as Cattle;
}

export async function deleteCattleFromSupabase(id: string) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error eliminando ganado:', error.message);
    throw error;
  }

  return true;
}