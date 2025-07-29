import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className={`bg-white rounded-xl shadow-xl w-full ${maxWidth} relative`}>
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          &times;
        </button>
        {title && <div className="px-6 pt-6 pb-2 text-lg font-semibold text-blue-dark">{title}</div>}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
