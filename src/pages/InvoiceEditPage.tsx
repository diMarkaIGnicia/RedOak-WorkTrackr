import React, { useState } from 'react';
import ModuleTemplate from '../layouts/ModuleTemplate';
import { useNavigate, useLocation } from 'react-router-dom';
import { InvoiceForm, InvoiceFormValues } from '../components/InvoiceForm';
import { useInvoices } from '../hooks/useInvoices';
import { useHoursWorked } from '../hooks/useHoursWorked';
import { supabase } from '../services/supabaseClient';
import { toast } from 'react-hot-toast';
import { useUserProfileContext } from '../context/UserProfileContext';
import { calculateInvoiceDate } from '../utils/dateUtils';

export default function InvoiceEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading: loadingProfile } = useUserProfileContext();

  // Si location.state tiene invoice, es edición; si no, es creación
  const invoiceRef = React.useRef((location.state && (location.state as any).invoice) as (InvoiceFormValues & { id?: string }) | undefined);
  const invoice = invoiceRef.current;
  const { addInvoice, updateInvoice } = useInvoices(profile?.id);
  const { batchUpdateInvoiceId, batchClearInvoiceId } = useHoursWorked(profile?.id);

  const handleSubmit = async (values: InvoiceFormValues) => {
    try {
      // Excluir invoice_number del payload y date_off si es una creación
      const { invoice_number, hours_worked_ids = [], date_off, ...restValues } = values;
      const isEdit = !!invoice?.id;

      // Validar que haya horas trabajadas seleccionadas para facturas nuevas
      if (!isEdit && (!hours_worked_ids || hours_worked_ids.length === 0)) {
        toast.error('Debes agregar al menos una hora trabajada para crear una factura');
        return;
      }

      // 1. Obtener las horas trabajadas completas (hours, rate_hour) para calcular el total
      let total = 0;
      if (hours_worked_ids.length > 0) {
        const { data: hoursData, error: hoursError } = await supabase
          .from('hours_worked')
          .select('id, hours, rate_hour')
          .in('id', hours_worked_ids);
        if (hoursError) throw new Error('Error obteniendo horas trabajadas');
        total = (hoursData || []).reduce((sum: number, hw: any) => sum + (Number(hw.hours) * Number(hw.rate_hour)), 0);
      }

      // Si es una factura nueva, establecer la fecha automáticamente
      // Usar el user_id del formulario si está presente (para admins)
      const userIdToUse = values.user_id || profile?.id;
      const invoiceData = isEdit
        ? { ...restValues, user_id: userIdToUse, total }
        : {
          ...restValues,
          user_id: userIdToUse,
          date_off: calculateInvoiceDate(),
          total
        };
      let invoiceId = invoice?.id;
      let prevHoursWorkedIds: string[] = invoice?.hours_worked_ids || [];

      if (isEdit) {
        // Primero actualizar las horas asociadas/desasociadas
        if (hours_worked_ids.length > 0 && invoiceId) {
          await batchUpdateInvoiceId(invoiceId, hours_worked_ids);
        }
        const toUnlink = prevHoursWorkedIds.filter((id) => !hours_worked_ids.includes(id));
        if (toUnlink.length > 0 && invoiceId) {
          await batchClearInvoiceId(toUnlink);
        }
        // Ahora obtener TODAS las horas asociadas a la factura y recalcular el total
        const { data: allHours, error: allHoursError } = await supabase
          .from('hours_worked')
          .select('id, hours, rate_hour')
          .eq('invoice_id', invoiceId);
        if (allHoursError) throw new Error('Error obteniendo horas asociadas');
        const newTotal = (allHours || []).reduce((sum: number, hw: any) => sum + (Number(hw.hours) * Number(hw.rate_hour)), 0);
        // Usar el user_id del formulario si está presente (para admins)
        const userIdToUse = values.user_id || profile?.id;
        await updateInvoice(invoiceId!, { ...restValues, user_id: userIdToUse, total: newTotal });
        toast.success('Factura actualizada correctamente');
      } else {
        // Crear nueva factura con los datos calculados
        const { data, error } = await supabase
          .from('invoices')
          .insert([invoiceData])
          .select('id')
          .single();
        if (error || !data?.id) throw new Error('Error creando la factura');
        invoiceId = data.id;
        toast.success('Factura creada correctamente');
        // Asociar horas seleccionadas a la factura
        if (hours_worked_ids.length > 0 && invoiceId) {
          await batchUpdateInvoiceId(invoiceId, hours_worked_ids);
        }
      }
      navigate('/facturas');
    } catch (err: any) {
      toast.error('Error guardando la factura');
    }
  };

  // Estado para el userId seleccionado
  const [selectedUserId, setSelectedUserId] = useState(invoice?.user_id || profile?.id || '');

  if (loadingProfile) return <ModuleTemplate><div className="p-8">Cargando...</div></ModuleTemplate>;

  return (
    <ModuleTemplate>
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 mt-8">
        <h1 className="text-2xl font-montserrat font-bold mb-6 text-blue-dark">{invoice ? 'Editar Factura' : 'Registrar Factura'}</h1>
        <InvoiceForm
          key={invoice?.id || 'new'}
          initialValues={invoice}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/facturas')}
          submitLabel={invoice ? 'Actualizar' : 'Crear'}
          role={profile?.role || ''}
          userId={selectedUserId}
          onUserIdChange={setSelectedUserId}
        />
      </div>
    </ModuleTemplate>
  );
}
