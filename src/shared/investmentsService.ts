import { supabase } from './supabase';
import type { Investment } from './types';

const TABLE_NAME = 'investments';

export async function getInvestmentsFromSupabase(): Promise<Investment[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error cargando inversiones:', error.message);
    throw error;
  }

  return (data || []) as Investment[];
}

export async function saveInvestmentInSupabase(
  item: Partial<Investment>
): Promise<Investment> {
  const payload = {
    projectId: item.projectId || '',
    investorName: item.investorName || '',
    amount: Number(item.amount || 0),
    expectedReturn: Number(item.expectedReturn || 0),
    status: item.status || 'Registrado',
    createdAt: item.createdAt || new Date().toISOString().slice(0, 10)
  };

  if (item.id) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando inversión:', error.message);
      throw error;
    }

    return data as Investment;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creando inversión:', error.message);
    throw error;
  }

  return data as Investment;
}

export async function deleteInvestmentFromSupabase(id: string) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error eliminando inversión:', error.message);
    throw error;
  }

  return true;
}