import React, { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`${typeStyles[type]} border-l-4 p-4 rounded shadow-lg`}
        role="alert"
      >
        <div className="flex">
          <div className="py-1">
            <svg
              className={`fill-current h-6 w-6 ${
                type === 'success'
                  ? 'text-green-500'
                  : type === 'error'
                  ? 'text-red-500'
                  : type === 'warning'
                  ? 'text-yellow-500'
                  : 'text-blue-500'
              } mr-4`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M2.93 17.07A10 10 0 1 1 17.07 2.07 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
            </svg>
          </div>
          <div>
            <p className="font-bold">
              {type === 'success'
                ? '¡Éxito!'
                : type === 'error'
                ? 'Error'
                : type === 'warning'
                ? 'Advertencia'
                : 'Información'}
            </p>
            <p className="text-sm">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
