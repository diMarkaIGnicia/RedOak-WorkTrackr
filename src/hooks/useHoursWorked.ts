import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export interface HoursWorked {
  id: string;
  date_worked: string; // date (YYYY-MM-DD)
  user_id: string;
  customer_id: string;
  customer_name?: string; // nombre completo del cliente
  type_work: string;
  rate_hour: number;
  hours: number;
  description: string;
  state: string;
  created_at: string;
}

export function useHoursWorked(
  userId: string | undefined,
  filters?: {
    date_worked?: string;
    customer_id?: string;
    state?: string;
  },
  page: number = 1,
  pageSize: number = 10
) {
  const [hoursWorked, setHoursWorked] = useState<HoursWorked[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setPage] = useState(page);
  const [currentPageSize] = useState(pageSize);

  const fetchHoursWorked = useCallback(async () => {
    setLoading(true);
    setError(null);
    const from = (currentPage - 1) * currentPageSize;
    const to = from + currentPageSize - 1;
    let query = supabase
      .from('hours_worked')
      .select('*, customers:customer_id(full_name)', { count: 'exact' })
      .eq('user_id', userId);
    if (filters?.date_worked) {
      query = query.eq('date_worked', filters.date_worked);
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
    query = query.order('date_worked', { ascending: false });
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
    setHoursWorked(mapped);
    setTotalCount(count || 0);
    setLoading(false);
  }, [userId, filters, currentPage, currentPageSize]);

  useEffect(() => {
    if (!userId) return;
    fetchHoursWorked();
    // Real-time subscription
    const channel = supabase.channel('public:hours_worked')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hours_worked', filter: `user_id=eq.${userId}` },
        fetchHoursWorked
      )
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [userId, fetchHoursWorked]);

  // CRUD operations
  const addHoursWorked = async (hoursWorked: Omit<HoursWorked, 'id'>) => {
    const { error } = await supabase.from('hours_worked').insert([{ ...hoursWorked, user_id: userId }]);
    if (error) setError(error.message);
  };

  const updateHoursWorked = async (id: string, updates: Partial<Omit<HoursWorked, 'id'>>) => {
    const { error } = await supabase.from('hours_worked').update(updates).eq('id', id);
    if (error) setError(error.message);
  };

  const deleteHoursWorked = async (id: string) => {
    try {

      // Eliminar la tarea
      const { error } = await supabase.from('hours_worked').delete().eq('id', id);
      if (error) throw new Error('Error eliminando la tarea');

      setHoursWorked((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.message || 'Error eliminando las horas registradas');
      alert(err.message || 'Error eliminando las horas registradas');
    }
  };

  return { hoursWorked, loading, error, totalCount, page: currentPage, pageSize: currentPageSize, setPage, addHoursWorked, updateHoursWorked, deleteHoursWorked };
}
