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

  const handleSubmit = async (values: TaskFormValues, attachments: Array<{ file: File, tipo_archivo: string }>, observaciones?: Array<{ imagen: File | null, preview: string | null, nota: string }>) => {
    if (!profile?.id) {
      alert('Usuario no autenticado');
      return;
    }
    try {
      let tarea;
let error;
let tareaId;
const tareaPayload = {
  fecha_inicio: values.fecha_inicio,
  hora_inicio: values.hora_inicio,
  cliente: values.cliente,
  tipo_trabajo: values.tipo_trabajo,
  horas_trabajadas: values.horas_trabajadas,
  tarifa_por_hora: values.tarifa_por_hora,
  estado: (profile.rol === 'administrador') ? values.estado : 'Creada',
  descripcion: values.descripcion || null,
  usuario_id: profile.id,
};
if (task && task.id) {
  // UPDATE si existe
  const res = await supabase
    .from('tareas')
    .update(tareaPayload)
    .eq('id', task.id)
    .select()
    .single();
  tarea = res.data;
  error = res.error;
  if (!tarea) {
    alert('Error actualizando la tarea: ' + (error?.message || 'Sin datos'));
    return;
  }
  tareaId = tarea.id;
} else {
  // INSERT si es nueva
  const res = await supabase
    .from('tareas')
    .insert([tareaPayload])
    .select()
    .single();
  tarea = res.data;
  error = res.error;
  if (!tarea) {
    alert('Error creando la tarea: ' + (error?.message || 'Sin datos'));
    return;
  }
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
      // 3. Guardar observaciones (si existen)
      if (observaciones && observaciones.length > 0) {
        for (const obs of observaciones) {
          if (obs.imagen) {
            const ext = obs.imagen.name.split('.').pop();
            const uuid = crypto.randomUUID();
            const tipo_archivo = obs.imagen.type.startsWith('video/') ? 'video' : 'imagen';
            const storagePath = `observaciones/${tareaId}/${uuid}.${ext}`;
            const { error: uploadError } = await supabase.storage.from('tareas').upload(storagePath, obs.imagen);
            if (!uploadError) {
              await supabase.from('tarea_observaciones').insert([{
                tarea_id: tareaId,
                tipo_archivo,
                archivo_path: `${tareaId}/${uuid}.${ext}`,
                nota: obs.nota,
              }]);
            } else {
              alert('Error subiendo una observación');
            }
          }
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
