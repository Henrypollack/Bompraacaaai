import React, { useEffect, useState } from 'react';
import { getTransactions, addExpense } from '../services/storageService';
import { Transaction, TransactionType, TransactionCategory } from '../types';
import { Plus, ArrowUpCircle, ArrowDownCircle, Filter } from 'lucide-react';

const Finance: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: TransactionCategory.OTHER,
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
    window.addEventListener('storage-update', loadData);
    return () => window.removeEventListener('storage-update', loadData);
  }, []);

  const loadData = () => {
    // Sort by date desc
    const trans = getTransactions().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(trans);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newTrans: Transaction = {
      id: crypto.randomUUID(),
      date: new Date(formData.date).toISOString(),
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: TransactionType.EXPENSE,
      category: formData.category
    };
    addExpense(newTrans);
    setIsModalOpen(false);
    setFormData({ description: '', amount: '', category: TransactionCategory.OTHER, date: new Date().toISOString().split('T')[0] });
  };

  const filtered = transactions.filter(t => filterType === 'all' || t.type === filterType);

  const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Financeiro</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Lançar Despesa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm font-medium">Receitas Totais</p>
            <p className="text-2xl font-bold text-green-600 mt-1">R$ {totalIncome.toFixed(2)}</p>
         </div>
         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm font-medium">Despesas Totais</p>
            <p className="text-2xl font-bold text-red-600 mt-1">R$ {totalExpense.toFixed(2)}</p>
         </div>
         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-sm font-medium">Resultado (Lucro/Prejuízo)</p>
            <p className={`text-2xl font-bold mt-1 ${totalIncome - totalExpense >= 0 ? 'text-acai-700' : 'text-red-500'}`}>
               R$ {(totalIncome - totalExpense).toFixed(2)}
            </p>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-gray-700">Extrato de Movimentações</h3>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              className="bg-white border border-gray-300 rounded-lg text-sm p-1"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="all">Todas</option>
              <option value={TransactionType.INCOME}>Receitas</option>
              <option value={TransactionType.EXPENSE}>Despesas</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-gray-500 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Descrição</th>
                <th className="px-6 py-3 font-medium">Categoria</th>
                <th className="px-6 py-3 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {filtered.map(t => (
                 <tr key={t.id} className="hover:bg-gray-50">
                   <td className="px-6 py-3 text-gray-600">{new Date(t.date).toLocaleDateString()}</td>
                   <td className="px-6 py-3 font-medium text-gray-800 flex items-center">
                     {t.type === TransactionType.INCOME ? (
                       <ArrowUpCircle size={16} className="text-green-500 mr-2" />
                     ) : (
                       <ArrowDownCircle size={16} className="text-red-500 mr-2" />
                     )}
                     {t.description}
                   </td>
                   <td className="px-6 py-3 text-gray-500">
                     <span className="bg-gray-100 px-2 py-1 rounded text-xs">{t.category}</span>
                   </td>
                   <td className={`px-6 py-3 text-right font-bold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                     {t.type === TransactionType.EXPENSE ? '-' : '+'} R$ {t.amount.toFixed(2)}
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4 text-red-700">Lançar Despesa</h2>
              <form onSubmit={handleAddExpense} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <input
                      required
                      className="w-full border border-gray-300 rounded-lg p-2"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Ex: Aluguel Fevereiro"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                      <input
                        required type="number" step="0.01"
                        className="w-full border border-gray-300 rounded-lg p-2"
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                      <input
                        required type="date"
                        className="w-full border border-gray-300 rounded-lg p-2"
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                      />
                   </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg p-2"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as TransactionCategory })}
                    >
                       <option value={TransactionCategory.RENT}>Aluguel</option>
                       <option value={TransactionCategory.UTILITIES}>Contas (Água/Luz)</option>
                       <option value={TransactionCategory.SALARY}>Salários</option>
                       <option value={TransactionCategory.OTHER}>Outros</option>
                    </select>
                 </div>
                 <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
                    <button type="submit" className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Lançar</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
