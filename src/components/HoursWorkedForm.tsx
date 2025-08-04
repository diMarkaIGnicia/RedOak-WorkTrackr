import React, { useState, useMemo } from 'react';
import CustomerAutocomplete from './CustomerAutocomplete';
import { useUsers } from '../hooks/useUsers';
import { useUserProfileContext } from '../context/UserProfileContext';


export interface HoursWorkedFormValues {
  date_worked: string;
  customer_id: string;
  type_work: string;
  type_work_other: string;
  hours: number;
  rate_hour: number;
  state: string;
  user_id: string;
}

interface HoursWorkedFormProps {
  initialValues?: Partial<HoursWorkedFormValues>;
  onSubmit?: (values: HoursWorkedFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  readOnly?: boolean;
  userId?: string;
  onUserIdChange?: (userId: string) => void;
}

const TIPOS_TRABAJO = [
  'Doméstico',
  'Comercial',
  'Entrenamiento',
  'Otro'
];

const ESTADOS = ['Creada', 'Enviada', 'Pagada'];


export const HoursWorkedForm: React.FC<HoursWorkedFormProps & { role: string }> = (props) => {

  // --- USUARIO SELECTOR ---
  const userFilters = useMemo(() => ({}), []); // Objeto estable para evitar ciclos
  const { users, loading: loadingUsers } = props.role === 'administrator'
    ? useUsers(userFilters, 1, 100)
    : { users: [], loading: false }; // Solo admins ven la lista

  const { profile, loading: loadingProfile } = useUserProfileContext();
  const safeInitialValues = React.useRef(props.initialValues || {});


  const {
    initialValues = {},
    onSubmit,
    onCancel,
    submitLabel = 'Guardar',
    role,
    readOnly = false,
    userId,
    onUserIdChange,
  } = props;

  const [form, setForm] = React.useState<HoursWorkedFormValues>(() => ({
    date_worked: safeInitialValues.current.date_worked || '',
    customer_id: safeInitialValues.current.customer_id || '',
    type_work: safeInitialValues.current.type_work || '',
    type_work_other: safeInitialValues.current.type_work_other || '',
    hours: safeInitialValues.current.hours || 0,
    rate_hour: safeInitialValues.current.rate_hour || 0,
    state: safeInitialValues.current.state || 'Creada',
    user_id: safeInitialValues.current.user_id || userId || profile?.id || '',
  }));
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (readOnly) return;
    const { name, value } = e.target;
    setForm((f: HoursWorkedFormValues) => ({
      ...f,
      [name]: name === 'hours' || name === 'rate_hour' ? parseFloat(value) || 0 : value,
    }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    // Validación detallada
    if (!form.date_worked) {
      setError('Debes ingresar la fecha.');
      return;
    }
    if (!form.customer_id) {
      setError('Debes seleccionar el cliente.');
      return;
    }
    if (!form.type_work) {
      setError('Debes seleccionar el tipo de trabajo.');
      return;
    }
    if (form.type_work === 'Otro' && !form.type_work_other) {
      setError('Debes especificar el campo "Otro, ¿cuál?"');
      return;
    }
    if (!form.hours) {
      setError('Debes ingresar las horas trabajadas.');
      return;
    }
    if (!form.rate_hour) {
      setError('Debes ingresar la tarifa por hora.');
      return;
    }
    setError('');

    let submitValues = { ...form };
    if (role !== 'administrator' && profile?.id) {
      submitValues.user_id = profile.id;
    }
    console.log('submitValues', submitValues);
    onSubmit && onSubmit(submitValues);
  };

  // Estado para el userId seleccionado
  const [selectedUserId, setSelectedUserId] = useState(form.user_id || profile?.id || '');
  

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-4 text-red-600 bg-red-100 border border-red-300 rounded px-4 py-2">
          {error}
        </div>
      )}
      {/* --- Campos básicos de la tarea --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        {role === 'administrator' && (
          <div>
            <label className="block text-sm font-medium mb-1">Usuario</label>
            <select
              value={userId}
              onChange={e => {
                const newUserId = selectedUserId;
                onUserIdChange?.(newUserId);
                setForm(prev => ({
                  ...prev,
                  user_id: newUserId,
                }));
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition bg-white"
              disabled={readOnly || loadingUsers}
              required
            >
              <option value="">Seleccione un usuario</option>
              {users.map((u: any) => (
                <option key={u.id} value={u.id}>{u.full_name || u.email}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Fecha <span className="text-red-500">*</span></label>
          <input type="date" className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition" name="date_worked" value={form.date_worked} onChange={handleChange} required />
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
          <label className="block text-sm font-medium mb-1">Tipo de trabajo <span className="text-red-500">*</span></label>
          <select className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition" name="type_work" value={form.type_work} onChange={handleChange} required>
            <option value="">Selecciona...</option>
            {TIPOS_TRABAJO.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
          </select>
          {form.type_work === 'Otro' && (
            <input
              type="text"
              className="w-full mt-2 border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
              name="type_work_other"
              value={form.type_work_other}
              onChange={handleChange}
              placeholder="Otro, ¿cuál?"
              required
              disabled={readOnly}
            />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Horas trabajadas <span className="text-red-500">*</span></label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
            name="hours"
            value={form.hours}
            onChange={handleChange}
            min={0}
            step={0.01}
            inputMode="decimal"
            pattern="^\d+(\.\d{1,2})?$"
            required
            onFocus={e => e.target.select()}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tarifa por hora <span className="text-red-500">*</span></label>
          <div className="flex items-center border border-gray-300 rounded-lg px-2 py-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-500 bg-white">
            <span className="text-blue-600 font-normal mr-2">$</span>
            <input
              type="number"
              className="flex-1 outline-none bg-transparent px-2 py-1 placeholder-gray-400 focus:ring-0 border-none shadow-none"
              name="rate_hour"
              value={form.rate_hour}
              onChange={handleChange}
              min={0}
              step={0.01}
              required
              placeholder="0.00"
              onFocus={e => e.target.select()}
            />

          </div>
        </div>
      </div>

      {/* Total dinámico */}
      <div className="mt-8 text-right">
        <span className="font-semibold text-lg">Total: </span>
        <span className="font-mono text-lg">$
          {Number(form.hours * form.rate_hour).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
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

export default HoursWorkedForm;
