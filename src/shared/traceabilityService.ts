import { supabase } from './supabase';
import type { TraceabilityEvent } from './types';

const TABLE_NAME = 'traceability_events';

export function generateTraceHash() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const random = Math.random().toString(16).slice(2, 8).toUpperCase();

  return `AG360-${date}-${random}`;
}

export async function getTraceabilityFromSupabase(): Promise<TraceabilityEvent[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error cargando trazabilidad:', error.message);
    throw error;
  }

  return (data || []) as TraceabilityEvent[];
}

export async function saveTraceabilityInSupabase(
  item: Partial<TraceabilityEvent>
): Promise<TraceabilityEvent> {
  const payload = {
    cattleId: item.cattleId || '',
    investmentId: item.investmentId || null,
    eventType: item.eventType || '',
    description: item.description || '',
    hashCode: item.hashCode || generateTraceHash(),
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
      console.error('Error actualizando trazabilidad:', error.message);
      throw error;
    }

    return data as TraceabilityEvent;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creando trazabilidad:', error.message);
    throw error;
  }

  return data as TraceabilityEvent;
}

export async function deleteTraceabilityFromSupabase(id: string) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error eliminando trazabilidad:', error.message);
    throw error;
  }

  return true;
}