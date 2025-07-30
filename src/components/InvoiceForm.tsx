import React from 'react';
import HoursWorkedMultiSelectTable from './HoursWorkedMultiSelectTable';
import Modal from './Modal';
import { useUserProfileContext } from '../context/UserProfileContext';
import { useHoursWorked } from '../hooks/useHoursWorked';

export type InvoiceStatus =  'Creada' | 'Enviada' | 'En Revisión' | 'Pagada';

export interface InvoiceFormValues {
  id?: string;
  invoice_number: string;
  user_id: string;
  account_name: string;
  account_number: string;
  bsb: string;
  bank_name: string;
  abn: string;
  mobile_number: string;
  status?: InvoiceStatus;
  address: string;
  date_off: string;
  hours_worked_ids?: string[]; // IDs de horas trabajadas asociadas
}

interface InvoiceFormProps {
  initialValues?: Partial<InvoiceFormValues>;
  onSubmit?: (values: InvoiceFormValues) => void;
  onCancel?: () => void;
  submitLabel?: string;
  role: string;
  readOnly?: boolean;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = (props) => {
  const { profile, loading: loadingProfile } = useUserProfileContext();
  // Cargar horas ya asociadas a esta factura (para mostrar fuera del modal)
  const shouldFetchAssociated = !loadingProfile && !!profile?.id && props.initialValues?.id;
  const { hoursWorked: associatedHours, loading: loadingAssociated } = shouldFetchAssociated
    ? useHoursWorked(profile.id, { invoice_id: props.initialValues?.id || '' }, 1, 100)
    : { hoursWorked: [], loading: false };

  // Cargar horas no asociadas a ninguna factura (para mostrar en el modal)
  const shouldFetchAvailable = !loadingProfile && !!profile?.id;
  const { hoursWorked: availableHours, loading: loadingAvailable } = shouldFetchAvailable
    ? useHoursWorked(profile.id, { invoice_id: null }, 1, 100)
    : { hoursWorked: [], loading: true };

  const {
    initialValues = {},
    onSubmit,
    onCancel,
    submitLabel = 'Guardar',
    role,
    readOnly = false,
  } = props;
  // Garantizar que initialValues nunca sea null/undefined
  const safeInitialValues = React.useRef(initialValues || {});
  const [values, setValues] = React.useState<InvoiceFormValues>(() => ({
    invoice_number: safeInitialValues.current.invoice_number || '',
    user_id: safeInitialValues.current.user_id || profile?.id || '',
    account_name: safeInitialValues.current.account_name || profile?.account_name || '',
    account_number: safeInitialValues.current.account_number || profile?.account_number || '',
    bsb: safeInitialValues.current.bsb || profile?.bsb || '',
    abn: safeInitialValues.current.abn || profile?.abn || '',
    mobile_number: safeInitialValues.current.mobile_number || profile?.mobile_number || '',
    status: safeInitialValues.current.status || 'Creada',
    address: safeInitialValues.current.address || profile?.address || '',
    date_off: safeInitialValues.current.date_off || new Date().toISOString().split('T')[0],
    hours_worked_ids: safeInitialValues.current.hours_worked_ids || [],
  }));

  // Update form values when profile loads
  React.useEffect(() => {
    if (profile && !safeInitialValues.current.id) { // Only auto-fill for new invoices
      setValues(prev => ({
        ...prev,
        user_id: profile.id,
        account_name: profile.account_name || prev.account_name,
        account_number: profile.account_number || prev.account_number,
        bsb: profile.bsb || prev.bsb,
        abn: profile.abn || prev.abn,
        mobile_number: profile.mobile_number || prev.mobile_number,
        address: profile.address || prev.address,
      }));
    }
  }, [profile]);

  // Estado para el modal y la selección temporal
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalSelected, setModalSelected] = React.useState<string[]>(values.hours_worked_ids || []);

  // Mantener sincronizada la selección temporal con el formulario
  React.useEffect(() => {
    if (modalOpen) {
      setModalSelected(values.hours_worked_ids || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  // Handler para selección múltiple de horas trabajadas
  const handleHoursWorkedChange = (ids: string[]) => {
    setValues((v) => ({ ...v, hours_worked_ids: ids }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(values);
  };



  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Número de Factura y Usuario (ID) ocultos del formulario visual */}
        <div>
          <label className="block text-sm font-medium mb-1">Nombre de la Cuenta <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="account_name"
            value={values.account_name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
            disabled={readOnly}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Número de Cuenta <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="account_number"
            value={values.account_number}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
            disabled={readOnly}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">BSB <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="bsb"
            value={values.bsb}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
            disabled={readOnly}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ABN <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="abn"
            value={values.abn}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
            disabled={readOnly}
            required
          />
        </div>
        <div >
            <label className="block text-sm font-medium mb-1">Teléfono <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="mobile_number"
              value={values.mobile_number}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
              disabled={readOnly}
              required
            />
        </div>
        {!readOnly && (
            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <select
                name="status"
                value={values.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition bg-white"
                disabled={readOnly}
              >
                {role === 'employee' ? (
                  <>
                    <option value="Creada">Creada</option>
                    <option value="Enviada">Enviada</option>
                  </>
                ) : (
                  <>
                    <option value="Creada">Creada</option>
                    <option value="Enviada">Enviada</option>
                    <option value="En Revisión">En Revisión</option>
                    <option value="Pagada">Pagada</option>
                  </>
                )}
              </select>
            </div>
          )}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Dirección <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="address"
            value={values.address}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
            disabled={readOnly}
            required
          />
        </div>
        {/* Fecha de Emisión oculta - se calcula automáticamente */}
        <input type="hidden" name="date_off" value={values.date_off} />
      </div>

      {/* Botón y modal para agregar horas trabajadas */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-normal border border-gray-400 flex items-center gap-1.5 transition-colors"
            onClick={() => setModalOpen(true)}
            disabled={readOnly || loadingProfile || !profile?.id}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            Agregar horas
          </button>
          {modalSelected.length > 0 && (
            <span className="text-sm text-gray-600">
              {modalSelected.length} hora{modalSelected.length !== 1 ? 's' : ''} seleccionada{modalSelected.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <Modal
          open={modalOpen}
          onClose={() => {
            setModalSelected([]);
            setModalOpen(false);
          }}
          title="Selecciona Horas Trabajadas"
          maxWidth="max-w-3xl"
        >
          <HoursWorkedMultiSelectTable
            selected={modalSelected}
            onChange={setModalSelected}
            disabled={false}
            hoursWorked={availableHours}
            loading={loadingAvailable}
          />
          <div className="flex justify-end gap-3 mt-6">
            <button 
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors border border-gray-300" 
              onClick={() => {
                setModalSelected([]);
                setModalOpen(false);
              }} 
              type="button"
            >
              Cancelar
            </button>
            <button
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 shadow-sm"
              type="button"
              onClick={() => {
                handleHoursWorkedChange(modalSelected);
                setModalOpen(false);
              }}
            >
              Agregar
            </button>
          </div>
        </Modal>
        {/* Mostrar resumen de horas seleccionadas */}
        {associatedHours.length > 0 && (
          <div className="mt-4">
            <div className="mb-1 text-sm font-medium text-gray-700">Horas asociadas a esta factura:</div>
            <table className="min-w-full divide-y divide-gray-200 text-xs bg-white rounded shadow">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left">Fecha</th>
                  <th className="px-2 py-2 text-left">Cliente</th>
                  <th className="px-2 py-2 text-right">Costo del Servicio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {associatedHours.map(hw => (
                  <tr key={hw.id}>
                    <td className="px-2 py-1 whitespace-nowrap">{new Date(hw.date_worked).toLocaleDateString()}</td>
                    <td className="px-2 py-1">{hw.customer_name || hw.customer_id}</td>
                    <td className="px-2 py-1 text-right">${Number(hw.hours * hw.rate_hour).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t border-gray-200">
                  <td className="px-2 py-2 font-semibold text-right" colSpan={2}>Total</td>
                  <td className="px-2 py-2 font-semibold text-right">
                    ${associatedHours.reduce((sum, hw) => sum + (hw.hours * hw.rate_hour), 0).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
      <div className="mt-6 flex gap-4 justify-end">
        <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={onCancel}>Cancelar</button>
        {!readOnly && (
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow">{submitLabel}</button>
        )}
      </div>
    </form>
  );
};
