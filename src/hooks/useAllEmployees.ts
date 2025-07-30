import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export interface EmployeeProfile {
  id: string;
  full_name: string;
  role: string;
  photo_path: string | null;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeWithTasks extends EmployeeProfile {
  tareas: any[];
  photo_url?: string; // Temporary URL for the photo
}

/**
 * Hook para obtener todos los empleados y sus tareas asociadas.
 * Opcionalmente permite filtrar tareas por rango de fechas.
 */
export function useAllEmployeesWithTasks({ rango }: { rango?: string } = {}) {
  const [empleados, setEmpleados] = useState<EmployeeWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEmployeesAndTasks() {
      setLoading(true);
      setError(null);
      // 1. Obtener todos los empleados
      const { data: users, error: errorUsers } = await supabase
        .from('users')
        .select('id, full_name, role, photo_path, email, created_at, updated_at')
        .eq('role', 'employee');
      if (errorUsers) {
        setError(errorUsers.message);
        setLoading(false);
        return;
      }
      // 2. Obtener todas las tareas (filtradas por rango si aplica)
      let tareasQuery = supabase.from('hours_worked').select('*');
      if (rango && rango !== 'all') {
        // Suponiendo que existe columna fecha_inicio tipo date
        const dias = parseInt(rango, 10);
        if (!isNaN(dias)) {
          const fechaLimite = new Date();
          fechaLimite.setDate(fechaLimite.getDate() - dias);
          tareasQuery = tareasQuery.gte('date_worked', fechaLimite.toISOString().slice(0, 10));
        }
      }
      const { data: tareas, error: errorTareas } = await tareasQuery;
      if (errorTareas) {
        setError(errorTareas.message);
        setLoading(false);
        return;
      }
      // 3. Mapear tareas a cada empleado y generar signed URLs para las fotos
      const empleadosConTareas: EmployeeWithTasks[] = await Promise.all(
        (users || []).map(async (emp: any) => {
          let photoUrl = null;
          
          // Generate signed URL for the photo if it exists
          if (emp.photo_path) {
            try {
              const { data } = await supabase.storage
                .from('profile-photos')
                .createSignedUrl(emp.photo_path, 3600); // URL expires in 1 hour
              if (data) {
                photoUrl = data.signedUrl;
              }
            } catch (error) {
              console.error('Error generating signed URL for employee photo:', error);
            }
          }
          
          return {
            ...emp,
            tareas: (tareas || []).filter((t: any) => t.user_id === emp.id),
            photo_url: photoUrl
          };
        })
      );
      setEmpleados(empleadosConTareas);
      setLoading(false);
    }
    fetchEmployeesAndTasks();
  }, [rango]);

  return { empleados, loading, error };
}
