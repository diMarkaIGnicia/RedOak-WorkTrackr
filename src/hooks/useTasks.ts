import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export interface Task {
  id: string;
  fecha_inicio: string; // date (YYYY-MM-DD)
  hora_inicio: string; // time (HH:mm:ss)
  usuario_id: string;
  cliente: string;
  tipo_trabajo: string;
  tarifa_por_hora: number;
  horas_trabajadas: number;
  descripcion: string;
  estado: string;
  primerAdjuntoUrl?: string; // signed URL for the first image/video attachment
  fecha_creacion?: string; // ISO string for creation date
}

export function useTasks(
  userId: string | undefined,
  filters?: {
    fecha_inicio?: string;
    cliente?: string;
    estado?: string;
  },
  page: number = 1,
  pageSize: number = 10
) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setPage] = useState(page);
  const [currentPageSize] = useState(pageSize);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const from = (currentPage - 1) * currentPageSize;
    const to = from + currentPageSize - 1;
    let query = supabase
      .from('tareas')
      .select('*', { count: 'exact' })
      .eq('usuario_id', userId);
    if (filters?.fecha_inicio) {
      query = query.eq('fecha_inicio', filters.fecha_inicio);
    }
    if (filters?.cliente) {
      query = query.ilike('cliente', `%${filters.cliente}%`); // búsqueda parcial
    }
    if (filters?.estado) {
      query = query.eq('estado', filters.estado);
    }
    query = query.order('fecha_inicio', { ascending: false });
    query = query.range(from, to);
    const { data, error, count } = await query;
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // Para cada tarea, buscar el primer adjunto (foto/video) y generar URL firmada
    const tareasConAdjunto = await Promise.all(
      (data || []).map(async (tarea) => {
        // Buscar el primer adjunto tipo foto o video
        const { data: adjuntos, error: adjError } = await supabase
          .from('tarea_adjuntos')
          .select('archivo_path, tipo_archivo')
          .eq('tarea_id', tarea.id)
          .in('tipo_archivo', ['foto', 'video'])
          .order('fecha_creacion', { ascending: true })
          .limit(1);
        if (!adjError && adjuntos && adjuntos.length > 0) {
          let relativePath = adjuntos[0].archivo_path;
          if (!relativePath.startsWith('adjuntos/')) {
            relativePath = `adjuntos/${relativePath}`;
          }
          const { data: signed, error: signErr } = await supabase.storage.from('tareas').createSignedUrl(relativePath, 60 * 60);
          if (!signErr && signed?.signedUrl) {
            return { ...tarea, primerAdjuntoUrl: signed.signedUrl };
          }
        }
        return { ...tarea };
      })
    );
    setTasks(tareasConAdjunto);
    setTotalCount(count || 0);
    setLoading(false);
  }, [userId, filters, currentPage, currentPageSize]);

  useEffect(() => {
    if (!userId) return;
    fetchTasks();
    // Real-time subscription
    const channel = supabase.channel('public:tareas')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tareas', filter: `usuario_id=eq.${userId}` },
        fetchTasks
      )
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [userId, fetchTasks]);

  // CRUD operations
  const addTask = async (task: Omit<Task, 'id'>) => {
    const { error } = await supabase.from('tareas').insert([{ ...task, usuario_id: userId }]);
    if (error) setError(error.message);
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id'>>) => {
    const { error } = await supabase.from('tareas').update(updates).eq('id', id);
    if (error) setError(error.message);
  };

  const deleteTask = async (id: string) => {
  try {
    // 1. Obtener todos los adjuntos de la tarea
    const { data: adjuntos, error: fetchError } = await supabase
      .from('tarea_adjuntos')
      .select('id, archivo_path')
      .eq('tarea_id', id);
    if (fetchError) throw new Error('Error consultando adjuntos');

    // 2. Eliminar archivos del storage
    if (adjuntos && adjuntos.length > 0) {
      const paths = adjuntos.map((a: any) => {
        let path = a.archivo_path;
        if (!path.startsWith('adjuntos/')) path = `adjuntos/${path}`;
        return path;
      });
      const { error: storageError } = await supabase.storage.from('tareas').remove(paths);
      if (storageError) throw new Error('Error eliminando archivos adjuntos del storage');
    }

    // 3. Eliminar registros de tarea_adjuntos
    const { error: dbAdjError } = await supabase
      .from('tarea_adjuntos')
      .delete()
      .eq('tarea_id', id);
    if (dbAdjError) throw new Error('Error eliminando registros de adjuntos');

    // 4. Eliminar la tarea
    const { error } = await supabase.from('tareas').delete().eq('id', id);
    if (error) throw new Error('Error eliminando la tarea');

    setTasks((prev) => prev.filter((t) => t.id !== id));
  } catch (err: any) {
    setError(err.message || 'Error eliminando la tarea y sus adjuntos');
    alert(err.message || 'Error eliminando la tarea y sus adjuntos');
  }
};

  return { tasks, loading, error, totalCount, page: currentPage, pageSize: currentPageSize, setPage, addTask, updateTask, deleteTask };
}
