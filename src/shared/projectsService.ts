import { supabase } from './supabase';
import type { Project } from './types';

const TABLE_NAME = 'projects';
const INVESTMENTS_TABLE = 'investments';

function calculateProjectStatus(goalAmount: number, raisedAmount: number, status?: Project['status']) {
  if (status === 'Cerrado') return 'Cerrado';
  return raisedAmount >= goalAmount ? 'Financiado' : status || 'Activo';
}

export async function getProjectsFromSupabase(): Promise<Project[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('Error cargando proyectos:', error.message);
    throw error;
  }

  return (data || []) as Project[];
}

export async function saveProjectInSupabase(
  item: Partial<Project>
): Promise<Project> {
  const goalAmount = Number(item.goalAmount || 0);
  const raisedAmount = Math.min(goalAmount, Number(item.raisedAmount || 0));

  const payload = {
    title: item.title || '',
    description: item.description || '',
    cattleId: item.cattleId || '',
    goalAmount,
    raisedAmount,
    projectedReturn: Number(item.projectedReturn || 0),
    status: calculateProjectStatus(goalAmount, raisedAmount, item.status),
    endDate: item.endDate || new Date().toISOString().slice(0, 10)
  };

  if (item.id) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq('id', item.id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando proyecto:', error.message);
      throw error;
    }

    return data as Project;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creando proyecto:', error.message);
    throw error;
  }

  return data as Project;
}

export async function deleteProjectFromSupabase(id: string) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error eliminando proyecto:', error.message);
    throw error;
  }

  return true;
}

export async function investProjectInSupabase(
  project: Project,
  amount: number,
  investorName: string
): Promise<Project> {
  const safeAmount = Math.max(0, Number(amount || 0));
  const expectedReturn = safeAmount + safeAmount * (project.projectedReturn / 100);

  const { error: investmentError } = await supabase
    .from(INVESTMENTS_TABLE)
    .insert({
      projectId: project.id,
      investorName,
      amount: safeAmount,
      expectedReturn,
      status: 'En seguimiento',
      createdAt: new Date().toISOString().slice(0, 10)
    });

  if (investmentError) {
    console.error('Error registrando inversión:', investmentError.message);
    throw investmentError;
  }

  const newRaisedAmount = Math.min(
    project.goalAmount,
    Number(project.raisedAmount || 0) + safeAmount
  );

  const newStatus = calculateProjectStatus(
    project.goalAmount,
    newRaisedAmount,
    project.status
  );

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update({
      raisedAmount: newRaisedAmount,
      status: newStatus
    })
    .eq('id', project.id)
    .select()
    .single();

  if (error) {
    console.error('Error actualizando recaudación del proyecto:', error.message);
    throw error;
  }

  return data as Project;
}