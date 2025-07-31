import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface ModuleTemplateProps {
  children: ReactNode;
  title?: string;
  backButton?: boolean;
  backButtonText?: string;
  onBack?: () => void;
  className?: string;
}

export default function ModuleTemplate({
  children,
  title,
  backButton = true,
  backButtonText = 'Volver',
  onBack,
  className = '',
}: ModuleTemplateProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              {title && (
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              )}
            </div>
            {backButton && (
              <div>
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {backButtonText}
                </button>
              </div>
            )}
          </div>
          <div className={className}>{children}</div>
        </div>
      </div>
    </div>
  );
}
