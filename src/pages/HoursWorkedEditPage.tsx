import React, { useState } from 'react';
import ModuleTemplate from '../layouts/ModuleTemplate';
import { HoursWorkedForm, HoursWorkedFormValues } from '../components/HoursWorkedForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserProfileContext } from '../context/UserProfileContext';
import { useHoursWorked } from '../hooks/useHoursWorked';
import { supabase } from '../services/supabaseClient';
import { toast } from 'react-hot-toast';

export default function HoursWorkedEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading: loadingProfile } = useUserProfileContext();
  const { addHoursWorked, updateHoursWorked } = useHoursWorked(profile?.id);

  // Si location.state tiene task, es edición; si no, es creación
  const hoursWorked = (location.state && (location.state as any).hoursWorked) as (HoursWorkedFormValues & { id?: string }) | undefined;

  const handleSubmit = async (values: HoursWorkedFormValues) => {
    if (!profile?.id) {
      toast.error('Usuario no autenticado');
      return;
    }
    try {
      let result;
      let error;
      let hoursWorkedId;
      const hoursWorkedPayload = {
        date_worked: values.date_worked,
        customer_id: values.customer_id,
        type_work: values.type_work,
        type_work_other: values.type_work_other,
        hours: values.hours,
        rate_hour: values.rate_hour,
        user_id: values.user_id,
      };
      if (hoursWorked && hoursWorked.id) {
        // UPDATE si existe
        const res = await supabase
          .from('hours_worked')
          .update(hoursWorkedPayload)
          .eq('id', hoursWorked.id)
          .select()
          .single();
        result = res.data;
        error = res.error;
        if (!result) {
          toast.error('Error actualizando las horas trabajadas: ' + (error?.message || 'Sin datos'));
          return;
        }
        hoursWorkedId = result.id;
        toast.success('Hora de trabajo actualizada correctamente');
      } else {
        // INSERT si es nueva
        const res = await supabase
          .from('hours_worked')
          .insert([hoursWorkedPayload])
          .select()
          .single();
        result = res.data;
        error = res.error;
        if (!result) {
          toast.error('Error registrando las horas trabajadas: ' + (error?.message || 'Sin datos'));
          return;
        }
        hoursWorkedId = result.id;
        toast.success('Hora de trabajo creada correctamente');
      }
      if (error) throw error;

      navigate('/horas-trabajadas');
    } catch (err: any) {
      toast.error('Error guardando las horas trabajadas');
      console.error(err);
    }
  };

  // Estado para el userId seleccionado
  const [selectedUserId, setSelectedUserId] = useState(hoursWorked?.user_id || profile?.id || '');

  if (loadingProfile) return <ModuleTemplate><div className="p-8">Cargando...</div></ModuleTemplate>;

  return (
    <ModuleTemplate>
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 mt-8">
        <h1 className="text-2xl font-montserrat font-bold mb-6 text-blue-dark">{hoursWorked ? 'Editar Horas Trabajadas' : 'Registrar Horas Trabajadas'}</h1>
        <HoursWorkedForm
          key={hoursWorked?.id || 'new'}
          initialValues={hoursWorked}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/horas-trabajadas')}
          submitLabel={hoursWorked ? 'Actualizar' : 'Crear'}
          role={profile?.role || ''}
          userId={selectedUserId}
          onUserIdChange={setSelectedUserId}
        />
      </div>
    </ModuleTemplate>
  );
}
