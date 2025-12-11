import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import POS from './pages/POS';
import Finance from './pages/Finance';
import Login from './pages/Login';
import { Role } from './types';
import { seedDatabase } from './services/storageService';

const App: React.FC = () => {
  const [role, setRole] = useState<Role | null>(null);
  const [page, setPage] = useState<string>('dashboard');

  useEffect(() => {
    // Initialize mock database with sample data if empty
    seedDatabase();
  }, []);

  const handleLogin = (selectedRole: Role) => {
    setRole(selectedRole);
    // Redirect cashier directly to POS
    setPage(selectedRole === Role.CASHIER ? 'pos' : 'dashboard');
  };

  const handleLogout = () => {
    setRole(null);
    setPage('dashboard');
  };

  if (!role) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <Inventory />;
      case 'products': return <Products />;
      case 'pos': return <POS currentRole={role} />;
      case 'finance': return <Finance />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout
      currentRole={role}
      onLogout={handleLogout}
      activePage={page}
      onNavigate={setPage}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;
