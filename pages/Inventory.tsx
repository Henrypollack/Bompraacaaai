import React, { useEffect, useState } from 'react';
import { Plus, AlertTriangle, Search, Package } from 'lucide-react';
import { getInventory, saveInventoryItem, addExpense, adjustStock } from '../services/storageService';
import { InventoryItem, UnitOfMeasure, TransactionType, TransactionCategory } from '../types';

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '', unit: UnitOfMeasure.KG, quantity: 0, costPrice: 0, minStock: 0
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    setItems(getInventory());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if it's a new stock entry to log expense
    const isNew = !editingId;
    const oldItem = isNew ? null : items.find(i => i.id === editingId);
    
    // Calculate expense for new entries or added quantity
    // Simplified logic: If adding quantity manually here, we assume it's a purchase/correction
    // For a real purchase feature, we might want a separate "Purchase Order" form.
    // Here we treat manual adds as generic adjustments, but we can log expense if quantity increased.
    
    const newItem: InventoryItem = {
      id: editingId || crypto.randomUUID(),
      name: formData.name!,
      unit: formData.unit!,
      quantity: Number(formData.quantity),
      costPrice: Number(formData.costPrice),
      minStock: Number(formData.minStock)
    };

    saveInventoryItem(newItem);
    
    // Log expense if it's a new item or quantity increased significantly (Simulating purchase)
    if (isNew && newItem.quantity > 0 && newItem.costPrice > 0) {
        addExpense({
            id: crypto.randomUUID(),
            date: new Date().toISOString(),
            description: `Compra Estoque: ${newItem.name}`,
            amount: newItem.quantity * newItem.costPrice,
            type: TransactionType.EXPENSE,
            category: TransactionCategory.STOCK_PURCHASE
        });
    }

    setItems(getInventory());
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', unit: UnitOfMeasure.KG, quantity: 0, costPrice: 0, minStock: 0 });
  };

  const openEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setFormData(item);
    setIsModalOpen(true);
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Estoque & Insumos</h1>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-acai-700 hover:bg-acai-900 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Novo Insumo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar insumo..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-acai-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-semibold uppercase">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Unidade</th>
                <th className="px-6 py-4">Quantidade</th>
                <th className="px-6 py-4">Custo Unit.</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4">{item.unit}</td>
                  <td className="px-6 py-4 font-bold">{item.quantity.toFixed(3)}</td>
                  <td className="px-6 py-4">R$ {item.costPrice.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    {item.quantity <= item.minStock ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertTriangle size={12} className="mr-1" /> Baixo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Normal
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(item)} className="text-acai-700 hover:text-acai-900 font-medium">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Package size={48} className="mx-auto mb-3 opacity-50" />
                    Nenhum insumo encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar Insumo' : 'Novo Insumo / Entrada'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Item</label>
                <input
                  required
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-acai-500"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value as UnitOfMeasure })}
                  >
                    {Object.values(UnitOfMeasure).map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mín.</label>
                   <input
                    type="number" step="0.001"
                    className="w-full border border-gray-300 rounded-lg p-2"
                    value={formData.minStock}
                    onChange={e => setFormData({ ...formData, minStock: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade Atual</label>
                  <input
                    type="number" step="0.001" required
                    className="w-full border border-gray-300 rounded-lg p-2"
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Custo Unit. (R$)</label>
                  <input
                    type="number" step="0.01" required
                    className="w-full border border-gray-300 rounded-lg p-2"
                    value={formData.costPrice}
                    onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-acai-700 text-white rounded-lg hover:bg-acai-900"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
