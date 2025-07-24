import React from 'react';
import ModuleTemplate from '../layouts/ModuleTemplate';
import { ReportsForm, ReportsFormValues } from '../components/ReportsForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserProfileContext } from '../context/UserProfileContext';
import { useReports } from '../hooks/useReports';
import { supabase } from '../services/supabaseClient';

export default function ReportsEditPage() {
  const [isSaving, setIsSaving] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile, loading: loadingProfile } = useUserProfileContext();
  const { addReport, updateReport } = useReports(profile?.id);

  // Si location.state tiene task, es edición; si no, es creación
  const report = (location.state && (location.state as any).report) as (ReportsFormValues & { id?: string }) | undefined;

  const [initialObservations, setInitialObservations] = React.useState<any[]>([]);
  React.useEffect(() => {
    const fetchObservations = async () => {
      if (report?.id) {
        const { data, error } = await supabase
          .from('report_observations')
          .select('*')
          .eq('report_id', report.id);
        if (!error && data) {
          // Firmar las URLs para visualización
          const signedObs = await Promise.all(
            data.map(async obs => {
              let signedUrl = '';
              if (obs.path) {
                const { data: signed, error: signErr } = await supabase.storage.from('reports').createSignedUrl(obs.path, 60 * 60);
                if (!signErr && signed?.signedUrl) signedUrl = signed.signedUrl;
              }
              return {
                id: obs.id,
                file: undefined,
                fileType: obs.file_type,
                fileUrl: signedUrl || '', // Usar la URL firmada para mostrar
                pathRel: obs.path,        // Guardar la ruta relativa para delete/update
                note: obs.note || '',
              };
            })
          );
          setInitialObservations(signedObs);
        }
      }
    };
    fetchObservations();
    // eslint-disable-next-line
  }, [report?.id]);

  // Recibe (values, observations)
  const handleSubmit = async (values: ReportsFormValues, observations: any[] = []) => {
    setIsSaving(true);
    if (!profile?.id) {
      alert('Usuario no autenticado');
      return;
    }
    try {
      let reportResult;
      let error;
      let reportId;
      const reportPayload = {
        report_date: values.report_date,
        report_time: values.report_time,
        customer_id: values.customer_id,
        description: values.description || null,
        user_id: profile.id,
      };
      if (report && report.id) {
        // UPDATE si existe
        const res = await supabase.from('reports').update(reportPayload).eq('id', report.id).select().single();
        reportResult = res.data;
        error = res.error;
        if (!reportResult) {
          alert('Error actualizando el reporte: ' + (error?.message || 'Sin datos'));
          return;
        }
        reportId = reportResult.id;
      } else {
        // INSERT si es nueva
        const res = await supabase.from('reports').insert([reportPayload]).select().single();
        reportResult = res.data;
        error = res.error;
        if (!reportResult) {
          alert('Error registrando el reporte: ' + (error?.message || 'Sin datos'));
          return;
        }
        reportId = reportResult.id;
      }
      if (error) throw error;

      // --- Observaciones: subir archivos y guardar en DB ---
      if (reportId && Array.isArray(observations) && observations.length > 0) {
        for (const obs of observations) {
          // 1. Eliminar observaciones marcadas como deleted y que tengan id en DB
          if (obs.deleted && obs.id && !obs.file) {
            // Eliminar de storage usando la ruta relativa (pathRel) si existe
            let storagePath = obs.pathRel;
            // Backup: si no hay pathRel, intentar extraer de fileUrl
            if (!storagePath && obs.fileUrl) {
              const match = obs.fileUrl.match(/(observations\/.+?)(\?|$)/);
              storagePath = match ? match[1] : undefined;
            }
            if (storagePath) {
              await supabase.storage.from('reports').remove([storagePath]);
            }
            // Eliminar de DB
            await supabase.from('report_observations').delete().eq('id', obs.id);
            continue;
          }
          // 2. Actualizar nota de observaciones existentes
          if (obs.updated && obs.id && obs.fileUrl) {
            await supabase.from('report_observations').update({ note: obs.note }).eq('id', obs.id);
            continue;
          }
          // 3. Insertar nuevas observaciones
          let fileUrl = obs.fileUrl;
          let fileType = obs.fileType;
          if (obs.file && !fileUrl) {
            const ext = obs.file.name.split('.').pop();
            const filePath = `observations/${reportId}/${crypto.randomUUID()}.${ext}`;
            const { error: uploadError } = await supabase.storage.from('reports').upload(filePath, obs.file);
            if (uploadError) {
              alert('Error subiendo archivo de observación: ' + uploadError.message);
              continue;
            }
            // Storage es privado: guardar la ruta relativa
            fileUrl = filePath;
            fileType = obs.file.type;
          }
          if (fileUrl && obs.id) {
            const { data: insertData, error: insertError } = await supabase.from('report_observations').insert({
              report_id: reportId,
              file_type: fileType,
              path: fileUrl,
              note: obs.note,
            }).select('*').single();
            if (insertError) {
              alert('Error guardando observación: ' + insertError.message);
            }
          }
        }
      }

      navigate('/reportes');
    } catch (err: any) {
      alert('Error guardando el reporte');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };


  if (loadingProfile) return <ModuleTemplate><div className="p-8">Cargando...</div></ModuleTemplate>;

  return (
    <ModuleTemplate>
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 mt-8">
        <h1 className="text-2xl font-montserrat font-bold mb-6 text-blue-dark">{report ? 'Editar Reporte' : 'Registrar Reporte'}</h1>
        <ReportsForm
          initialValues={report}
          initialObservations={initialObservations}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/reportes')}
          submitLabel={report ? 'Actualizar' : 'Crear'}
          role={profile?.role || ''}
          isSaving={isSaving}
        />
      </div>
    </ModuleTemplate>
  );
}
