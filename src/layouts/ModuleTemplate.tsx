import React, { ReactNode } from 'react';
import Header from '../components/ModuleHeader';
import Sidebar from '../components/ModuleSidebar';
import ModuleHeader from '../components/ModuleHeader';
import ModuleSidebar from '../components/ModuleSidebar';

interface ModuleTemplateProps {
  children: ReactNode;
}

const ModuleTemplate: React.FC<ModuleTemplateProps> = ({ children }) => {
  const [openSidebar, setOpenSidebar] = React.useState(false);
  return (
    <div className="flex flex-col h-screen bg-white">
      <ModuleHeader onMenuClick={() => setOpenSidebar(true)} />
      <div className="flex flex-1 min-h-0">
        <ModuleSidebar open={openSidebar} onClose={() => setOpenSidebar(false)} />
        <main className="flex-1 overflow-auto bg-white">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ModuleTemplate;
