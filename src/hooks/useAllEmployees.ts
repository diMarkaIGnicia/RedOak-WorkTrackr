import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export interface EmployeeProfile {
  id: string;
  full_name: string;
  role: string;
  photo_url?: string;
}

export interface EmployeeWithTasks extends EmployeeProfile {
  tareas: any[];
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
        .from('usuarios')
        .select('*')
        .eq('rol', 'empleado');
      if (errorUsers) {
        setError(errorUsers.message);
        setLoading(false);
        return;
      }
      // 2. Obtener todas las tareas (filtradas por rango si aplica)
      let tareasQuery = supabase.from('tareas').select('*');
      if (rango && rango !== 'all') {
        // Suponiendo que existe columna fecha_inicio tipo date
        const dias = parseInt(rango, 10);
        if (!isNaN(dias)) {
          const fechaLimite = new Date();
          fechaLimite.setDate(fechaLimite.getDate() - dias);
          tareasQuery = tareasQuery.gte('fecha_inicio', fechaLimite.toISOString().slice(0, 10));
        }
      }
      const { data: tareas, error: errorTareas } = await tareasQuery;
      if (errorTareas) {
        setError(errorTareas.message);
        setLoading(false);
        return;
      }
      // 3. Mapear tareas a cada empleado
      const empleadosConTareas: EmployeeWithTasks[] = (users || []).map((emp: any) => ({
        ...emp,
        tareas: (tareas || []).filter((t: any) => t.usuario_id === emp.id),
      }));
      setEmpleados(empleadosConTareas);
      setLoading(false);
    }
    fetchEmployeesAndTasks();
  }, [rango]);

  return { empleados, loading, error };
}
