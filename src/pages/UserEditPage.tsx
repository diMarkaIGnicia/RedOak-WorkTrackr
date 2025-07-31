import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { toast } from 'react-hot-toast';
import { UserForm, User, UserFormValues } from '../components/UserForm';
import ModuleTemplate from '../layouts/ModuleTemplate';

export default function UserEditPage() {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [user, setUser] = useState<User | null>(null);
  const isEdit = !!id;

  // Load user data if in edit mode
  useEffect(() => {
    if (!id) return;

    const loadUser = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        console.log('[UserEditPage] Usuario cargado de supabase:', data);
        setUser(data);
      } catch (error) {
        console.error('Error loading user:', error);
        toast.error('Error al cargar el usuario');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  const handleSubmit = async (values: UserFormValues) => {
    try {
      if (isEdit && id) {
        // Update existing user
        console.log('[UserEditPage] Actualizando usuario:', { id, values });
        const { data, error } = await supabase
          .from('users')
          .update({
            full_name: values.full_name,
            role: values.role,
            active: values.active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .select();
        console.log('[UserEditPage] Resultado update:', { data, error });

        if (error) {
          toast.error(`Error al actualizar: ${error.message || error}`);
          throw error;
        }
        if (!data || data.length === 0) {
          toast.error('No se encontró el usuario a actualizar.');
          return;
        }
        toast.success('Usuario actualizado correctamente');
      } else {
        // Create new user with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password || '',
          options: {
            data: {
              full_name: values.full_name,
            },
          },
        });

        if (authError) throw authError;

        // Save additional user data to users table
        const { error: userError } = await supabase.from('users').insert([
          {
            id: authData.user?.id,
            email: values.email,
            full_name: values.full_name,
            role: values.role,
            active: values.active,
            auth_user_id: authData.user?.id,
          },
        ]);

        if (userError) throw userError;

        toast.success('Usuario creado correctamente');
      }

      navigate('/usuarios');
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast.error(error.message || 'Error al guardar el usuario');
    }
  };

  if (loading) {
    return (
      <ModuleTemplate>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </ModuleTemplate>
    );
  }

  // If in edit mode but no user data, show error
  if (isEdit && !user) {
    return (
      <ModuleTemplate>
        <div className="p-4 text-red-600">
          No se pudo cargar la información del usuario
        </div>
      </ModuleTemplate>
    );
  }

  return (
    <ModuleTemplate>
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 mt-8" style={{ overflow: 'visible' }}>
        <h1 className="text-2xl font-montserrat font-bold mb-6 text-blue-dark">
          {isEdit ? 'Editar Usuario' : 'Registrar Usuario'}
        </h1>
        <UserForm
          initialValues={user || undefined}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/usuarios')}
          submitLabel={isEdit ? 'Actualizar' : 'Crear'}
          isEdit={isEdit}
        />
      </div>
    </ModuleTemplate>
  );
}
