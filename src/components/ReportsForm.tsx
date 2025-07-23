import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import CustomerAutocomplete from './CustomerAutocomplete';


export interface ReportsFormValues {
  report_date: string;
  report_time: string;
  customer_id: string;
  description: string;
}

interface ReportsFormProps {
  initialValues?: ReportsFormValues;
  onSubmit?: (values: ReportsFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  readOnly?: boolean;
}


export const ReportsForm: React.FC<ReportsFormProps & { role: string }> = ({ initialValues, onSubmit, onCancel, submitLabel, role, readOnly = false }) => {

  const [form, setForm] = useState<ReportsFormValues>(
    initialValues || {
      report_date: '',
      report_time: '',
      customer_id: '',
      description: '',
    }
  );
  const [error, setError] = useState('');



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f: ReportsFormValues) => ({
      ...f,
      [name]: value,
    }));
  };


  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (readOnly) return;
      // Validación detallada
      if (!form.report_date) {
        setError('Debes ingresar la fecha.');
        return;
      }

      if (!form.report_time) {
        setError('Debes ingresar la hora.');
        return;
      }

      if (!form.customer_id) {
        setError('Debes seleccionar el cliente.');
        return;
      }
     
      if (!form.description) {
        setError('Debes ingresar la descripción.');
        return;
      }
      setError('');
      // Solo pasa los datos y adjuntos al padre; observaciones se pasan como tercer argumento
      // eslint-disable-next-line
      (onSubmit as any) && onSubmit({ ...form });
    };


  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 text-red-600 bg-red-100 border border-red-300 rounded px-4 py-2">
          {error}
        </div>
      )}
      {/* --- Campos básicos del reporte --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Fecha <span className="text-red-500">*</span></label>
          <input type="date" className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition" name="report_date" value={form.report_date} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hora <span className="text-red-500">*</span></label>
          <input type="time" className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition" name="report_time" value={form.report_time} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cliente <span className="text-red-500">*</span></label>
          <CustomerAutocomplete
            value={form.customer_id}
            onChange={(id, name) => setForm(f => ({ ...f, customer_id: id }))}
            readOnly={readOnly}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Descripción <span className="text-red-500">*</span></label>
          <textarea className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition" name="description" value={form.description} onChange={handleChange} required></textarea>
        </div>
      </div>

      

      {/* Botones de acción */}
      <div className="mt-6 flex gap-4 justify-end">
        <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={onCancel}>Cancelar</button>
        {!readOnly && (
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow">{submitLabel || "Guardar"}</button>
        )}
      </div>
    </form>
  );
}

export default ReportsForm;
