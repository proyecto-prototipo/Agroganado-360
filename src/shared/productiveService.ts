import { supabase } from './supabase';
import type { ProductiveRecord } from './types';

const TABLE_NAME = 'productive_records';

export async function getProductiveFromSupabase(): Promise<ProductiveRecord[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('recordDate', { ascending: false });

  if (error) {
    console.error('Error cargando historial productivo:', error.message);
    throw error;
  }

  return (data || []) as ProductiveRecord[];
}

export async function saveProductiveInSupabase(
  item: Partial<ProductiveRecord>
): Promise<ProductiveRecord> {
  const payload = {
    cattleId: item.cattleId || '',
    recordDate: item.recordDate || new Date().toISOString().slice(0, 10),
    weight: Number(item.weight || 0),
    milkProduction: Number(item.milkProduction || 0),
    note: item.note || ''
  };

  if (item.id) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando historial productivo:', error.message);
      throw error;
    }

    return data as ProductiveRecord;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creando historial productivo:', error.message);
    throw error;
  }

  return data as ProductiveRecord;
}

export async function deleteProductiveFromSupabase(id: string) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error eliminando historial productivo:', error.message);
    throw error;
  }

  return true;
}