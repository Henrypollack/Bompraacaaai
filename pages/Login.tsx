import React from 'react';
import { User, ShieldCheck } from 'lucide-react';
import { Role } from '../types';

interface LoginProps {
  onLogin: (role: Role) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-acai-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-acai-900 mb-2">Açaí Master</h1>
           <p className="text-gray-500">Sistema de Gestão Integrado</p>
        </div>
        
        <div className="space-y-4">
           <button
             onClick={() => onLogin(Role.ADMIN)}
             className="w-full p-4 border-2 border-acai-100 rounded-xl hover:border-acai-500 hover:bg-acai-50 transition-all flex items-center group"
           >
              <div className="bg-acai-100 p-3 rounded-full text-acai-700 group-hover:bg-acai-500 group-hover:text-white transition-colors">
                 <ShieldCheck size={24} />
              </div>
              <div className="ml-4 text-left">
                 <h3 className="font-bold text-gray-800">Administrador</h3>
                 <p className="text-sm text-gray-500">Acesso total ao sistema</p>
              </div>
           </button>

           <button
             onClick={() => onLogin(Role.CASHIER)}
             className="w-full p-4 border-2 border-gray-100 rounded-xl hover:border-acai-500 hover:bg-gray-50 transition-all flex items-center group"
           >
              <div className="bg-gray-100 p-3 rounded-full text-gray-600 group-hover:bg-acai-500 group-hover:text-white transition-colors">
                 <User size={24} />
              </div>
              <div className="ml-4 text-left">
                 <h3 className="font-bold text-gray-800">Operador de Caixa</h3>
                 <p className="text-sm text-gray-500">Apenas PDV</p>
              </div>
           </button>
        </div>
        
        <p className="mt-8 text-xs text-gray-400">Versão 1.0.0 &copy; 2024</p>
      </div>
    </div>
  );
};

export default Login;
