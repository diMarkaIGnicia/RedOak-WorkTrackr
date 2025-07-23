import React from 'react';
import ModuleTemplate from '../layouts/ModuleTemplate';
import { TaskForm, TaskFormValues } from '../components/TaskForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserProfileContext } from '../context/UserProfileContext';

export default function HoursWorkedDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading: loadingProfile } = useUserProfileContext();

  // Recibe la tarea por location.state (igual que en edición)
  const task = (location.state && (location.state as any).task) as (TaskFormValues & { id?: string }) | undefined;

  if (loadingProfile) return <ModuleTemplate><div className="p-8">Cargando...</div></ModuleTemplate>;

  return (
    <ModuleTemplate>
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 mt-8">
        <h1 className="text-2xl font-montserrat font-bold mb-6 text-blue-dark">Detalle de Tarea</h1>
        <TaskForm
          initialValues={task}
          onSubmit={undefined}
          onCancel={() => navigate('/tareas')}
          submitLabel={undefined}
          rol={profile?.rol || ''}
          readOnly={true}
        />
      </div>
    </ModuleTemplate>
  );
}
