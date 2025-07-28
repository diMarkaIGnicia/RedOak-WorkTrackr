import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export interface Invoice {
  id: string;
  invoice_number: string;
  user_id: string;
  account_name: string;
  account_number: string;
  bsb: string;
  abn: string;
  mobile_number: string;
  address: string;
  date_off: string;
  created_at?: string;
}

export function useInvoices(
  userId?: string,
  filters?: Partial<Invoice>,
  page: number = 1,
  pageSize: number = 10
) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setPage] = useState(page);
  const [currentPageSize] = useState(pageSize);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    let query = supabase.from('invoices').select('*', { count: 'exact' });
    if (userId) query = query.eq('user_id', userId);
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query = query.eq(key, value);
      });
    }
    query = query.range((currentPage - 1) * currentPageSize, currentPage * currentPageSize - 1);
    const { data, error, count } = await query;
    if (error) setError(error.message);
    setInvoices(data || []);
    setTotalCount(count || 0);
    setLoading(false);
  }, [userId, filters, currentPage, currentPageSize]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  // CRUD operations
  const addInvoice = async (invoice: Omit<Invoice, 'id'>) => {
    const { error } = await supabase.from('invoices').insert([{ ...invoice, user_id: userId }]);
    if (error) setError(error.message);
    else fetchInvoices();
  };
  const updateInvoice = async (id: string, updates: Partial<Omit<Invoice, 'id'>>) => {
    const { error } = await supabase.from('invoices').update(updates).eq('id', id);
    if (error) setError(error.message);
    else fetchInvoices();
  };
  const deleteInvoice = async (id: string) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) setError(error.message);
    else fetchInvoices();
  };

  return {
    invoices,
    loading,
    error,
    totalCount,
    page: currentPage,
    pageSize: currentPageSize,
    setPage,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    fetchInvoices,
  };
}
