import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'administrator' | 'employee';
  auth_user_id: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export function useUsers(filters: Partial<User> = {}, page = 1, pageSize = 10) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .is('deleted_at', null); // Only fetch non-deleted users

      // Apply filters
      if (filters.full_name) {
        query = query.ilike('full_name', `%${filters.full_name}%`);
      }
      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }
      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      // Add pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, error: queryError, count } = await query.range(from, to);

      if (queryError) throw queryError;

      setUsers(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const softDeleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          deleted_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
      
      // Refresh the list
      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      console.error('Error soft deleting user:', err);
      return { 
        success: false, 
        error: err.message || 'Error al eliminar el usuario' 
      };
    }
  };

  const updateUserActiveStatus = async (userId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ active, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      
      // Update local state to reflect the change immediately
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, active } : user
        )
      );
      
      return { success: true };
    } catch (err: any) {
      console.error('Error updating user active status:', err);
      return { 
        success: false, 
        error: err.message || 'Error al actualizar el estado del usuario' 
      };
    }
  };

  return {
    users,
    loading,
    error,
    totalCount,
    page,
    pageSize,
    deleteUser: softDeleteUser, // Keep the same function name for backward compatibility
    softDeleteUser,
    updateUserActiveStatus,
    refetch: fetchUsers,
  };
}
