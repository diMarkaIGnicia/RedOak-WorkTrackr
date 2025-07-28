import React from 'react';
import ModuleTemplate from '../layouts/ModuleTemplate';
import { useNavigate, useLocation } from 'react-router-dom';
import { InvoiceForm, InvoiceFormValues } from '../components/InvoiceForm';
import { useInvoices } from '../hooks/useInvoices';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useUserProfileContext } from '../context/UserProfileContext';

export default function InvoiceEditPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile, loading: loadingProfile } = useUserProfileContext();

  // Si location.state tiene invoice, es edición; si no, es creación
  const invoice = (location.state && (location.state as any).invoice) as (InvoiceFormValues & { id?: string }) | undefined;
  const { addInvoice, updateInvoice } = useInvoices(profile?.id);

  const handleSubmit = async (values: InvoiceFormValues) => {
    try {
      // Excluir invoice_number del payload, ya que es autoincremental
      const { invoice_number, ...restValues } = values;
      if (invoice && invoice.id) {
        await updateInvoice(invoice.id, { ...restValues, user_id: profile?.id || user?.id });
        toast.success('Factura actualizada correctamente');
      } else {
        // Forzar el user_id al del usuario autenticado
        await addInvoice({ ...restValues, user_id: profile?.id || user?.id });
        toast.success('Factura creada correctamente');
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
