import React, { useState } from 'react';
import ModuleTemplate from '../layouts/ModuleTemplate';
import { HoursWorkedForm, HoursWorkedFormValues } from '../components/HoursWorkedForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserProfileContext } from '../context/UserProfileContext';

export default function HoursWorkedDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading: loadingProfile } = useUserProfileContext();

  // Recibe la tarea por location.state (igual que en edición)
  const hoursWorked = (location.state && (location.state as any).hoursWorked) as (HoursWorkedFormValues & { id?: string }) | undefined;

  // Estado para el userId seleccionado
  const [selectedUserId, setSelectedUserId] = useState(hoursWorked?.user_id || profile?.id || '');
  
  if (loadingProfile) return <ModuleTemplate><div className="p-8">Cargando...</div></ModuleTemplate>;

  return (
    <ModuleTemplate>
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 mt-8">
        <h1 className="text-2xl font-montserrat font-bold mb-6 text-blue-dark">Detalle de las horas trabajadas</h1>
        <HoursWorkedForm
          initialValues={hoursWorked}
          onSubmit={undefined}
          onCancel={() => navigate('/horas-trabajadas')}
          submitLabel={undefined}
          role={profile?.role || ''}
          readOnly={true}
          userId={selectedUserId}
          onUserIdChange={setSelectedUserId}
        />
      </div>
    </ModuleTemplate>
  );
}
