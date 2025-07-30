import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../services/supabaseClient';

export interface HoursWorked {
  id: string;
  date_worked: string; // date (YYYY-MM-DD)
  user_id: string;
  customer_id: string;
  customer_name?: string; // nombre completo del cliente
  type_work: string;
  type_work_other?: string;
  rate_hour: number;
  hours: number;
  description: string;
  created_at: string;
  invoice_id?: string | null; // id de la factura asociada (opcional)
}

export function useHoursWorked(
  userId: string | undefined,
  filters?: {
    date_worked?: string;
    customer_id?: string;
    invoice_id?: string | null;
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

  // fetchHoursWorked como función estable (no useCallback)
  async function fetchHoursWorked() {
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
    if (filters?.invoice_id === null) {
      // Solo horas sin factura asociada
      query = query.is('invoice_id', null);
    } else if (filters?.invoice_id) {
      // Solo horas asociadas a una factura específica
      query = query.eq('invoice_id', filters.invoice_id);
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
  }

  // Un solo useEffect para fetch y suscripción, con logs de depuración
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!userId) return;
    if (filters && Object.prototype.hasOwnProperty.call(filters, 'invoice_id') && typeof filters.invoice_id === 'undefined') return;
    mountedRef.current = true;
    fetchHoursWorked();
    const channel = supabase.channel('public:hours_worked')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'hours_worked', filter: `user_id=eq.${userId}` },
        fetchHoursWorked
      )
      .subscribe();
    return () => {
      channel.unsubscribe();
      mountedRef.current = false;
    };
  }, [userId, JSON.stringify(filters), currentPage, currentPageSize]);

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
      // Primero verificar si la hora está asociada a una factura
      const { data: hourData, error: fetchError } = await supabase
        .from('hours_worked')
        .select('invoice_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        // Solo mostramos el error en consola y retornamos false
        console.error('Error al verificar la hora trabajada:', fetchError);
        return { success: false, error: 'No se pudo verificar la hora trabajada' };
      }
      
      if (hourData?.invoice_id) {
        return { 
          success: false, 
          error: 'No se puede eliminar una hora que ya está incluida en una factura' 
        };
      }

      // Si no está asociada a ninguna factura, proceder con la eliminación
      const { error } = await supabase.from('hours_worked').delete().eq('id', id);
      if (error) {
        console.error('Error eliminando la hora trabajada:', error);
        return { 
          success: false, 
          error: 'No se pudo eliminar la hora trabajada' 
        };
      }

      // Actualizar el estado local
      setHoursWorked((prev) => prev.filter((t) => t.id !== id));
      
      return { success: true };
    } catch (err: any) {
      console.error('Error inesperado al eliminar hora trabajada:', err);
      return { 
        success: false, 
        error: 'Ocurrió un error inesperado' 
      };
    }
  };

  // Actualizar en lote el invoice_id de varias horas trabajadas
  const batchUpdateInvoiceId = async (invoiceId: string, hourIds: string[]) => {
    if (!hourIds.length) return;
    const { error } = await supabase
      .from('hours_worked')
      .update({ invoice_id: invoiceId })
      .in('id', hourIds);
    if (error) setError(error.message);
  };

  // Desasociar horas (poner invoice_id a null)
  const batchClearInvoiceId = async (hourIds: string[]) => {
    if (!hourIds.length) return;
    const { error } = await supabase
      .from('hours_worked')
      .update({ invoice_id: null })
      .in('id', hourIds);
    if (error) setError(error.message);
  };

  return { hoursWorked, loading, error, totalCount, page: currentPage, pageSize: currentPageSize, setPage, addHoursWorked, updateHoursWorked, deleteHoursWorked, batchUpdateInvoiceId, batchClearInvoiceId };
}
