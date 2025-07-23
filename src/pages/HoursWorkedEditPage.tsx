import React from 'react';
import ModuleTemplate from '../layouts/ModuleTemplate';
import { HoursWorkedForm, HoursWorkedFormValues } from '../components/HoursWorkedForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserProfileContext } from '../context/UserProfileContext';
import { useHoursWorked } from '../hooks/useHoursWorked';
import { supabase } from '../services/supabaseClient';

export default function HoursWorkedEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile, loading: loadingProfile } = useUserProfileContext();
  const { addHoursWorked, updateHoursWorked } = useHoursWorked(profile?.id);

  // Si location.state tiene task, es edición; si no, es creación
  const hoursWorked = (location.state && (location.state as any).hoursWorked) as (HoursWorkedFormValues & { id?: string }) | undefined;

  const handleSubmit = async (values: HoursWorkedFormValues) => {
    if (!profile?.id) {
      alert('Usuario no autenticado');
      return;
    }
    try {
      let hoursWorked;
      let error;
      let hoursWorkedId;
      const hoursWorkedPayload = {
        date_worked: values.date_worked,
        customer_id: values.customer_id,
        type_work: values.type_work,
        type_work_other: values.type_work_other,
        hours: values.hours,
        rate_hour: values.rate_hour,
        state: (profile.role === 'administrator') ? values.state : 'Creada',
        user_id: profile.id,
      };
      if (hoursWorked && hoursWorked.id) {
        // UPDATE si existe
        const res = await supabase
          .from('hours_worked')
          .update(hoursWorkedPayload)
          .eq('id', hoursWorked.id)
          .select()
          .single();
        hoursWorked = res.data;
        error = res.error;
        if (!hoursWorked) {
          alert('Error actualizando las horas trabajadas: ' + (error?.message || 'Sin datos'));
          return;
        }
        hoursWorkedId = hoursWorked.id;
      } else {
        // INSERT si es nueva
        const res = await supabase
          .from('hours_worked')
          .insert([hoursWorkedPayload])
          .select()
          .single();
        hoursWorked = res.data;
        error = res.error;
        if (!hoursWorked) {
          alert('Error registrando las horas trabajadas: ' + (error?.message || 'Sin datos'));
          return;
        }
        hoursWorkedId = hoursWorked.id;
      }
      if (error) throw error;

      navigate('/horas-trabajadas');
    } catch (err: any) {
      alert('Error guardando las horas trabajadas');
      console.error(err);
    }
  };


  if (loadingProfile) return <ModuleTemplate><div className="p-8">Cargando...</div></ModuleTemplate>;

  return (
    <ModuleTemplate>
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 mt-8">
        <h1 className="text-2xl font-montserrat font-bold mb-6 text-blue-dark">{hoursWorked ? 'Editar Horas Trabajadas' : 'Registrar Horas Trabajadas'}</h1>
        <HoursWorkedForm
          initialValues={hoursWorked}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/horas-trabajadas')}
          submitLabel={hoursWorked ? 'Actualizar' : 'Crear'}
          role={profile?.role || ''}
        />
      </div>
    </ModuleTemplate>
  );
}
