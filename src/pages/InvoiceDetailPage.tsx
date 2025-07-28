import React from 'react';
import ModuleTemplate from '../layouts/ModuleTemplate';
import { useNavigate, useLocation } from 'react-router-dom';
import { InvoiceForm, InvoiceFormValues } from '../components/InvoiceForm';
import { useUserProfileContext } from '../context/UserProfileContext';
import { useInvoices } from '../hooks/useInvoices';

export default function InvoiceDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading: loadingProfile } = useUserProfileContext();
  const { invoices, loading } = useInvoices(profile?.id);

  // Recibe la factura por location.state o la busca por id
  const invoice = (location.state && (location.state as any).invoice) as (InvoiceFormValues & { id?: string }) | undefined;
  let invoiceData = invoice;
  if (!invoiceData && !loading && invoices.length > 0) {
    const id = (location.pathname.split('/').pop() || '').trim();
    invoiceData = invoices.find(i => i.id === id);
  }

  if (loadingProfile || loading) return <ModuleTemplate><div className="p-8">Cargando...</div></ModuleTemplate>;

  return (
    <ModuleTemplate>
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 mt-8">
        <h1 className="text-2xl font-montserrat font-bold mb-6 text-blue-dark">Detalle de la Factura</h1>
        <InvoiceForm
          initialValues={invoiceData}
          onSubmit={undefined}
          onCancel={() => navigate('/facturas')}
          submitLabel={undefined}
          role={profile?.role || ''}
          readOnly={true}
        />
      </div>
    </ModuleTemplate>
  );
}
