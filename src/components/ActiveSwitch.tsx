import React from 'react';

interface ActiveSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  showLabel?: boolean;
}

/**
 * Switch visual accesible y reutilizable para campos booleanos tipo "Activo".
 * - checked: estado booleano.
 * - onChange: callback con el nuevo valor.
 * - disabled: deshabilita interacción.
 * - label: texto opcional a la derecha.
 */
const ActiveSwitch: React.FC<ActiveSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  label = '',
  className = '',
  showLabel = false,
}) => {
  return (
    <span className={`inline-flex items-center ${showLabel ? '' : 'gap-0'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        tabIndex={0}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-5 w-10 items-center rounded-full border border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        style={{ minWidth: 40 }}
      >
        <span className="sr-only">{label || 'Activo'}</span>
        <span
          aria-hidden="true"
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out border border-gray-300 ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
      {showLabel && (
        <span className={`ml-3 text-sm select-none ${checked ? 'text-blue-700' : 'text-gray-400'}`}>{checked ? (label || 'Activo') : 'Inactivo'}</span>
      )}
    </span>
  );
};

export default ActiveSwitch;
