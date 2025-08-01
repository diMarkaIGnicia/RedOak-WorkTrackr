import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export interface useReports {
  id: string;
  report_date: string; // date (YYYY-MM-DD)
  report_time: string; // time (HH:mm:ss)
  user_id: string;
  customer_id: string;
  customer_name?: string; // nombre completo del cliente
  description: string;
}

export function useReports(
  userId: string | undefined,
  filters?: {
    report_date?: string;
    customer_id?: string;
    state?: string;
  },
  page: number = 1,
  pageSize: number = 10
) {
  const [reports, setReports] = useState<useReports[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setPage] = useState(page);
  const [currentPageSize] = useState(pageSize);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    const from = (currentPage - 1) * currentPageSize;
    const to = from + currentPageSize - 1;
    let query = supabase
      .from('reports')
      .select('*, customers:customer_id(full_name)', { count: 'exact' });
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (filters?.report_date) {
      query = query.eq('report_date', filters.report_date);
    }
    if (filters?.customer_id) {
      // Si el valor es un UUID (cliente seleccionado), usar búsqueda exacta
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(filters.customer_id)) {
        query = query.eq('customer_id', filters.customer_id);
      } else {
        query = query.ilike('customer_id', `%${filters.customer_id}%`);
      }
    }
    if (filters?.state) {
      query = query.eq('state', filters.state);
    }
    query = query.order('report_date', { ascending: false });
    query = query.range(from, to);
    const { data, error, count } = await query;
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Mapear para incluir customer_name
    const mapped = (data || []).map((item: any) => ({
      ...item,
      customer_name: item.customers?.full_name || '',
    }));
    setReports(mapped);
    setTotalCount(count || 0);
    setLoading(false);
  }, [userId, filters, currentPage, currentPageSize]);

  useEffect(() => {
    // Si userId está definido, filtrar por usuario; si es undefined (admin), traer todos los reportes
    fetchReports();
    // Real-time subscription
    const channel = supabase.channel('public:reports')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        fetchReports
      )
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [userId, fetchReports]);

  // CRUD operations
  const addReport = async (report: Omit<useReports, 'id'>) => {
    const { error } = await supabase.from('reports').insert([{ ...report, user_id: userId }]);
    if (error) setError(error.message);
  };

  const updateReport = async (id: string, updates: Partial<Omit<useReports, 'id'>>) => {
    const { error } = await supabase.from('reports').update(updates).eq('id', id);
    if (error) setError(error.message);
  };

  const deleteReport = async (id: string) => {
    try {

      // Eliminar la tarea
      const { error } = await supabase.from('reports').delete().eq('id', id);
      if (error) throw new Error('Error eliminando el reporte');

      setReports((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.message || 'Error eliminando el reporte');
      alert(err.message || 'Error eliminando el reporte');
    }
  };

  return { reports, loading, error, totalCount, page: currentPage, pageSize: currentPageSize, setPage, addReport, updateReport, deleteReport };
}
