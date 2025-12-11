import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, DollarSign, Menu, X, LogOut, Coffee } from 'lucide-react';
import { Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentRole: Role;
  onLogout: () => void;
  activePage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentRole, onLogout, activePage, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, roles: [Role.ADMIN] },
    { id: 'pos', label: 'PDV (Vendas)', icon: ShoppingCart, roles: [Role.ADMIN, Role.CASHIER] },
    { id: 'inventory', label: 'Estoque & Insumos', icon: Package, roles: [Role.ADMIN] },
    { id: 'products', label: 'Produtos & Receitas', icon: Coffee, roles: [Role.ADMIN] },
    { id: 'finance', label: 'Financeiro', icon: DollarSign, roles: [Role.ADMIN] },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-acai-900 text-white transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-between h-16 px-6 bg-acai-700">
          <span className="text-xl font-bold tracking-wider">Açaí Master</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.filter(item => item.roles.includes(currentRole)).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setSidebarOpen(false);
              }}
              className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors ${
                activePage === item.id ? 'bg-acai-500 text-white' : 'text-gray-300 hover:bg-acai-700 hover:text-white'
              }`}
            >
              <item.icon size={20} className="mr-3" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 bg-acai-900 border-t border-acai-700">
          <div className="flex items-center justify-between text-sm text-gray-300 mb-4 px-2">
            <span>{currentRole}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut size={18} className="mr-2" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <Menu size={24} />
          </button>
          <span className="text-lg font-semibold text-gray-800">Açaí Master</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
