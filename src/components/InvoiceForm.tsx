import React from 'react';

export interface InvoiceFormValues {
  invoice_number: string;
  user_id: string;
  account_name: string;
  account_number: string;
  bsb: string;
  abn: string;
  mobile_number: string;
  address: string;
  date_off: string;
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
  const {
    initialValues = {},
    onSubmit,
    onCancel,
    submitLabel = 'Guardar',
    role,
    readOnly = false,
  } = props;
  // Garantizar que initialValues nunca sea null/undefined
  const safeInitialValues = initialValues || {};
  const [values, setValues] = React.useState<InvoiceFormValues>({
    invoice_number: safeInitialValues.invoice_number || '',
    user_id: safeInitialValues.user_id || '',
    account_name: safeInitialValues.account_name || '',
    account_number: safeInitialValues.account_number || '',
    bsb: safeInitialValues.bsb || '',
    abn: safeInitialValues.abn || '',
    mobile_number: safeInitialValues.mobile_number || '',
    address: safeInitialValues.address || '',
    date_off: safeInitialValues.date_off || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
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
        <div>
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
        <div>
          <label className="block text-sm font-medium mb-1">Fecha de Emisión <span className="text-red-500">*</span></label>
          <input
            type="date"
            name="date_off"
            value={values.date_off}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
            disabled={readOnly}
            required
          />
        </div>
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
