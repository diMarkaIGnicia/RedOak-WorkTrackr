import { supabase } from '../services/supabaseClient';

export async function getUserIdToNameMap(): Promise<Record<string, string>> {
  // Asume que la tabla de usuarios es 'usuarios' y tiene id y full_name
  const { data, error } = await supabase.from('usuarios').select('id, full_name');
  if (error) return {};
  const map: Record<string, string> = {};
  (data || []).forEach((u: any) => { map[u.id] = u.full_name; });
  return map;
}
