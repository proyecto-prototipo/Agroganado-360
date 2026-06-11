import { supabase } from './supabase';
import type { UserProfile } from './types';

const TABLE_NAME = 'profiles';

export async function getUsersFromSupabase(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('fullName', { ascending: true });

  if (error) {
    console.error('Error cargando usuarios:', error.message);
    throw error;
  }

  return data as UserProfile[];
}

export async function saveUserInSupabase(
  user: Partial<UserProfile>
): Promise<UserProfile> {
  const payload = {
    fullName: user.fullName || '',
    email: user.email || '',
    role: user.role || 'productor',
    phone: user.phone || '',
    status: user.status || 'Activo',
    lastAccess: user.lastAccess || new Date().toLocaleString('es-PE')
  };

  if (user.id) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(payload)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error actualizando usuario:', error.message);
      throw error;
    }

    return data as UserProfile;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('Error creando usuario:', error.message);
    throw error;
  }

  return data as UserProfile;
}

export async function deleteUserFromSupabase(id: string) {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error eliminando usuario:', error.message);
    throw error;
  }

  return true;
}