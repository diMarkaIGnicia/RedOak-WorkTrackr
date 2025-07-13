import React from 'react';
import ModuleTemplate from '../layouts/ModuleTemplate';
import { TaskForm, TaskFormValues } from '../components/TaskForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserProfileContext } from '../context/UserProfileContext';
import { useTasks } from '../hooks/useTasks';
import { supabase } from '../services/supabaseClient';

export default function TaskEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile, loading: loadingProfile } = useUserProfileContext();
  const { addTask, updateTask } = useTasks(profile?.id);

  // Si location.state tiene task, es edición; si no, es creación
  const task = (location.state && (location.state as any).task) as (TaskFormValues & { id?: string }) | undefined;

  const handleSubmit = async (values: TaskFormValues, attachments: Array<{ file: File, tipo_archivo: string }>) => {
    if (!profile?.id) {
      alert('Usuario no autenticado');
      return;
    }
    try {
      let tarea;
      let error;
      let tareaId;
      if (task && task.id) {
        // UPDATE si existe
        const res = await supabase
          .from('tareas')
          .update({
            ...values,
            descripcion: values.descripcion || null,
            estado: (profile.rol === 'administrador') ? values.estado : 'Creada',
            usuario_id: profile.id,
          })
          .eq('id', task.id)
          .select()
          .single();
        tarea = res.data;
        error = res.error;
        tareaId = tarea.id;
      } else {
        // INSERT si es nueva
        const res = await supabase
          .from('tareas')
          .insert([{
            ...values,
            descripcion: values.descripcion || null,
            estado: (profile.rol === 'administrador') ? values.estado : 'Creada',
            usuario_id: profile.id,
          }])
          .select()
          .single();
        tarea = res.data;
        error = res.error;
        tareaId = tarea.id;
      }
      if (error) throw error;

      // 2. Subir adjuntos a storage y registrar en la tabla
      for (const adj of attachments) {
        const fileExt = adj.file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const storagePath = `adjuntos/${tareaId}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('tareas').upload(storagePath, adj.file);
        if (!uploadError) {
          await supabase.from('tarea_adjuntos').insert([{
            tarea_id: tareaId,
            tipo_archivo: adj.tipo_archivo,
            archivo_path: `${tareaId}/${fileName}`,
          }]);
        } else {
          alert('Error subiendo un adjunto');
        }
      }
      navigate('/tareas');
    } catch (err: any) {
      alert('Error guardando la tarea');
      console.error(err);
    }
  };


  if (loadingProfile) return <ModuleTemplate><div className="p-8">Cargando...</div></ModuleTemplate>;

  return (
    <ModuleTemplate>
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 mt-8">
        <h1 className="text-2xl font-montserrat font-bold mb-6 text-blue-dark">{task ? 'Editar Tarea' : 'Nueva Tarea'}</h1>
        <TaskForm
          initialValues={task}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/tareas')}
          submitLabel={task ? 'Actualizar' : 'Crear'}
          rol={profile?.rol || ''}
        />
      </div>
    </ModuleTemplate>
  );
}
