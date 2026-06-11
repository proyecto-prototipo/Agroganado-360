import { supabase } from './supabase';
import type { Cattle, Project } from './types';

export async function getCattleFromSupabase(): Promise<Cattle[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('cattle').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((item: any) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    breed: item.breed,
    sex: item.sex,
    weight: Number(item.weight),
    temperature: Number(item.temperature),
    healthStatus: item.health_status,
    location: item.location,
    gps: item.gps || '',
    funded: Boolean(item.funded),
    createdAt: item.created_at
  }));
}

export async function getProjectsFromSupabase(): Promise<Project[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('investment_projects').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    cattleId: item.cattle_id,
    goalAmount: Number(item.goal_amount),
    raisedAmount: Number(item.raised_amount),
    projectedReturn: Number(item.projected_return),
    status: item.status,
    endDate: item.end_date
  }));
}
