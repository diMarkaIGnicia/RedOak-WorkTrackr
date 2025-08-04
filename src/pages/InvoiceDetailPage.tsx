import React, { useState, useEffect, useMemo } from 'react';
import ModuleTemplate from '../layouts/ModuleTemplate';
import { useNavigate, useLocation } from 'react-router-dom';
import { InvoiceForm, InvoiceFormValues, HoursWorkedItem, InvoiceStatus } from '../components/InvoiceForm';
import { useUserProfileContext } from '../context/UserProfileContext';
import { useInvoices, Invoice } from '../hooks/useInvoices';
import { supabase } from '../services/supabaseClient';

export default function InvoiceDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading: loadingProfile } = useUserProfileContext();
  const { invoices, loading } = useInvoices(profile?.id);

  // Recibe la factura por location.state o la busca por id
  const invoice = (location.state && (location.state as any).invoice) as (InvoiceFormValues & { id?: string }) | undefined;
  const [invoiceData, setInvoiceData] = useState<InvoiceFormValues & { id?: string } | undefined>(invoice);
  
  // Actualizar invoiceData cuando cambie invoice o se carguen las facturas
  useEffect(() => {
    const updateInvoiceData = async () => {
      if (invoice) {
        // Si ya tenemos la factura del location.state, usarla
        setInvoiceData({
          ...invoice,
          date_off: invoice.date_off || new Date().toISOString().split('T')[0],
          hours_worked_ids: invoice.hours_worked_ids || []
        });
      } else if (!loading && invoices.length > 0) {
        // Si no, buscar la factura por ID
        const id = (location.pathname.split('/').pop() || '').trim();
        const foundInvoice = invoices.find(i => i.id === id);
        
        if (foundInvoice) {
          // Obtener las horas trabajadas para esta factura
          const { data: hoursWorkedData } = await supabase
            .from('hours_worked')
            .select('id')
            .eq('invoice_id', foundInvoice.id);
            
          const hoursWorkedIds = hoursWorkedData?.map(hw => hw.id) || [];
          
          // Crear el objeto InvoiceFormValues con los datos de la factura
          const formattedInvoice: InvoiceFormValues = {
            id: foundInvoice.id,
            invoice_number: foundInvoice.invoice_number || '',
            user_id: foundInvoice.user_id || '',
            account_name: foundInvoice.account_name || '',
            account_number: foundInvoice.account_number || '',
            bsb: '', // Este campo no existe en la interfaz Invoice
            bank: foundInvoice.bank || '',
            abn: foundInvoice.abn || '',
            mobile_number: foundInvoice.mobile_number || '',
            address: foundInvoice.address || '',
            date_off: new Date().toISOString().split('T')[0], // Usar fecha actual como valor por defecto
            hours_worked_ids: hoursWorkedIds,
            status: foundInvoice.status as InvoiceStatus || 'Creada'
          };
          
          setInvoiceData(formattedInvoice);
        }
      }
    };
    
    updateInvoiceData();
  }, [invoice, invoices, loading]);

  // Obtener las horas trabajadas asociadas
  const [hoursWorked, setHoursWorked] = useState<HoursWorkedItem[]>([]);
  
  useEffect(() => {
    const fetchHoursWorked = async () => {
      if (invoiceData?.hours_worked_ids?.length) {
        const { data, error } = await supabase
          .from('hours_worked')
          .select('*, customers:customer_id(full_name)')
          .in('id', invoiceData.hours_worked_ids);
          
        if (!error && data) {
          const formattedHours = data.map((hw: any) => ({
            id: hw.id,
            date_worked: hw.date_worked,
            hours: hw.hours,
            rate_hour: hw.rate_hour,
            customer_name: hw.customers?.full_name,
            customer_id: hw.customer_id
          }));
          setHoursWorked(formattedHours);
        }
      }
    };
    
    fetchHoursWorked();
  }, [invoiceData?.hours_worked_ids]);
  
  // Combinar los datos de la factura con las horas trabajadas
  const invoiceWithHours = useMemo(() => {
    if (!invoiceData) return undefined;
    
    // Si hay horas trabajadas, asegurarse de que tengan el formato correcto
    const formattedHoursWorked = hoursWorked.length > 0 ? hoursWorked : [];
    
    return { 
      ...invoiceData, 
      hours_worked: formattedHoursWorked,
      // Asegurar que los campos requeridos tengan un valor por defecto
      bsb: invoiceData.bsb || '',
      date_off: invoiceData.date_off || new Date().toISOString().split('T')[0]
    };
  }, [invoiceData, hoursWorked]);

  // Estado para el userId seleccionado
  const [selectedUserId, setSelectedUserId] = useState(invoice?.user_id || profile?.id || '');

  if (loadingProfile || loading) return <ModuleTemplate><div className="p-8">Cargando...</div></ModuleTemplate>;

  return (
    <ModuleTemplate>
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-gray-200 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-montserrat font-bold text-blue-dark">Detalle de la Factura</h1>
          {invoiceData?.status && (
            <div className="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium">
              Estado: {invoiceData.status}
            </div>
          )}
        </div>
        <InvoiceForm
          initialValues={invoiceData}
          onSubmit={undefined}
          onCancel={() => navigate('/facturas')}
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
