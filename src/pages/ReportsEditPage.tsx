import React from 'react';
import ModuleTemplate from '../layouts/ModuleTemplate';
import { ReportsForm, ReportsFormValues } from '../components/ReportsForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUserProfileContext } from '../context/UserProfileContext';
import { useReports } from '../hooks/useReports';
import { supabase } from '../services/supabaseClient';

export default function ReportsEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile, loading: loadingProfile } = useUserProfileContext();
  const { addReport, updateReport } = useReports(profile?.id);

  // Si location.state tiene task, es edición; si no, es creación
  const report = (location.state && (location.state as any).report) as (ReportsFormValues & { id?: string }) | undefined;

  const handleSubmit = async (values: ReportsFormValues) => {
    if (!profile?.id) {
      alert('Usuario no autenticado');
      return;
    }
    try {
      let report;
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
        const res = await supabase
          .from('reports')
          .update(reportPayload)
          .eq('id', report.id)
          .select()
          .single();
        report = res.data;
        error = res.error;
        if (!report) {
          alert('Error actualizando el reporte: ' + (error?.message || 'Sin datos'));
          return;
        }
        reportId = report.id;
      } else {
        // INSERT si es nueva
        const res = await supabase
          .from('reports')
          .insert([reportPayload])
          .select()
          .single();
        report = res.data;
        error = res.error;
        if (!report) {
          alert('Error registrando el reporte: ' + (error?.message || 'Sin datos'));
          return;
        }
        reportId = report.id;
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
        <h1 className="text-2xl font-montserrat font-bold mb-6 text-blue-dark">{report ? 'Editar Reporte' : 'Registrar Reporte'}</h1>
        <ReportsForm
          initialValues={report}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/reportes')}
          submitLabel={report ? 'Actualizar' : 'Crear'}
          role={profile?.role || ''}
        />
      </div>
    </ModuleTemplate>
  );
}
