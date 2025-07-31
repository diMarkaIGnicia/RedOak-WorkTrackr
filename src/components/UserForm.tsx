import React from 'react';

import ActiveSwitch from './ActiveSwitch';

export type Role = 'administrator' | 'employee';

export interface User {
  id?: string;
  full_name: string;
  email: string;
  role: Role;
  active: boolean;
  auth_user_id?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface UserFormValues {
  full_name: string;
  email: string;
  role: Role;
  active: boolean;
  password?: string;
  confirmPassword?: string;
}

interface UserFormProps {
  initialValues?: Partial<UserFormValues>;
  onSubmit: (values: Omit<UserFormValues, 'confirmPassword'>) => void;
  onCancel: () => void;
  submitLabel?: string;
  isEdit?: boolean;
}



export const UserForm: React.FC<UserFormProps> = ({
  initialValues = {
    full_name: '',
    email: '',
    role: 'employee' as Role,
    active: true,
  },
  onSubmit,
  onCancel,
  submitLabel = 'Guardar',
  isEdit = false,
}) => {
  const [values, setValues] = React.useState<UserFormValues>({
    full_name: initialValues.full_name || '',
    email: initialValues.email || '',
    role: initialValues.role || 'employee',
    active: initialValues.active !== undefined ? initialValues.active : true,
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof UserFormValues, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSwitchChange = (val: boolean) => {
    setValues(prev => ({ ...prev, active: val }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormValues, string>> = {};
    if (!values.full_name.trim()) newErrors.full_name = 'El nombre es requerido';
    if (!values.email.trim()) newErrors.email = 'El correo es requerido';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(values.email)) newErrors.email = 'Correo electrónico inválido';
    if (!values.role || (values.role !== 'employee' && values.role !== 'administrator')) newErrors.role = 'Rol inválido';
    if (typeof values.active !== 'boolean') newErrors.active = 'El estado es requerido';
    if (!isEdit) {
      if (!values.password) newErrors.password = 'La contraseña es requerida';
      else if (values.password.length < 8) newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
      if (!values.confirmPassword) newErrors.confirmPassword = 'Confirma tu contraseña';
      else if (values.password !== values.confirmPassword) newErrors.confirmPassword = 'Las contraseñas deben coincidir';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const { confirmPassword, ...submitValues } = values;
    onSubmit(submitValues);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium mb-1">Nombre completo <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="full_name"
            value={values.full_name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border border-gray-400 rounded focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.full_name ? 'border-red-500' : ''
            }`}
          />
          {errors.full_name && (
            <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
          )}
        </div>

        {/* Email */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium mb-1">Correo electrónico <span className="text-red-500">*</span></label>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={handleChange}
            disabled={isEdit}
            className={`w-full px-3 py-2 border border-gray-400 rounded focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
              errors.email ? 'border-red-500' : ''
            } ${isEdit ? 'bg-gray-100' : ''}`}
          />
          {isEdit && (
            <input type="hidden" name="email" value={values.email} />
          )}
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Password Fields */}
        {!isEdit && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Contraseña <span className="text-red-500">*</span></label>
              <input
                type="password"
                name="password"
                value={values.password || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border border-gray-400 rounded focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.password ? 'border-red-500' : ''
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Confirmar contraseña <span className="text-red-500">*</span></label>
              <input
                type="password"
                name="confirmPassword"
                value={values.confirmPassword || ''}
                onChange={handleChange}
                className={`w-full px-3 py-2 border border-gray-400 rounded focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.confirmPassword ? 'border-red-500' : ''
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </>
        )}

        {/* Role */}
        <div>
          <label className="block text-sm font-medium mb-1">Rol <span className="text-red-500">*</span></label>
          <select
            name="role"
            value={values.role}
            onChange={handleChange}
            className={`w-full px-3 py-3 border border-gray-400 rounded focus:border-blue-500 focus:ring-blue-500 text-base md:text-base lg:text-lg appearance-auto bg-white ${
              errors.role ? 'border-red-500' : ''
            }`}
          >
            <option value="employee">Empleado</option>
            <option value="administrator">Administrador</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
        </div>

        {/* Active Status */}
        <div>
          <label className="block text-sm font-medium mb-1">Estado <span className="text-red-500">*</span></label>
          <ActiveSwitch
            checked={values.active}
            onChange={handleSwitchChange}
            label="Activo"
            showLabel={true}
            className="ml-1"
          />
          {errors.active && (
            <p className="mt-1 text-sm text-red-600">{errors.active}</p>
          )}
        </div>
        </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {submitLabel}
        </button>
      </div>
      {Object.keys(errors).length > 0 && (
        <div className="text-red-600 text-sm mt-2">
          Hay errores de validación en el formulario. Revisa los campos marcados en rojo.
        </div>
      )}
    </form>
  );
};
