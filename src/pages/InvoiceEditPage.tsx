import React from 'react';
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
      
      // Si es una factura nueva, establecer la fecha automáticamente
      const invoiceData = isEdit 
        ? { ...restValues, user_id: profile?.id }
        : { 
            ...restValues, 
            user_id: profile?.id,
            date_off: calculateInvoiceDate()
          };
      let invoiceId = invoice?.id;
      let prevHoursWorkedIds: string[] = invoice?.hours_worked_ids || [];

      if (isEdit) {
        await updateInvoice(invoiceId!, { ...restValues, user_id: profile?.id });
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
      }

      // Asociar horas seleccionadas a la factura
      if (hours_worked_ids.length > 0 && invoiceId) {
        await batchUpdateInvoiceId(invoiceId, hours_worked_ids);
      }
      // Desasociar horas que antes estaban asociadas y ya no
      if (isEdit && invoiceId) {
        const toUnlink = prevHoursWorkedIds.filter((id) => !hours_worked_ids.includes(id));
        if (toUnlink.length > 0) {
          await batchClearInvoiceId(toUnlink);
        }
      }
      navigate('/facturas');
    } catch (err: any) {
      toast.error('Error guardando la factura');
    }
  };

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
        />
      </div>
    </ModuleTemplate>
  );
}
