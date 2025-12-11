import React, { useEffect, useState } from 'react';
import { Plus, Coffee, Trash2, Save } from 'lucide-react';
import { getProducts, getInventory, saveProduct } from '../services/storageService';
import { Product, InventoryItem, ProductIngredient } from '../types';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    setProducts(getProducts());
    setInventory(getInventory());
  }, []);

  const handleEdit = (product?: Product) => {
    if (product) {
      setEditingProduct({ ...product });
    } else {
      setEditingProduct({
        id: crypto.randomUUID(),
        name: '',
        price: 0,
        category: 'Açaí',
        ingredients: []
      });
    }
  };

  const handleSave = () => {
    if (editingProduct && editingProduct.name && editingProduct.price) {
      saveProduct(editingProduct as Product);
      setProducts(getProducts());
      setEditingProduct(null);
    }
  };

  const addIngredient = () => {
    if (!editingProduct) return;
    const newIng: ProductIngredient = { inventoryItemId: inventory[0]?.id || '', quantityRequired: 0 };
    setEditingProduct({
      ...editingProduct,
      ingredients: [...(editingProduct.ingredients || []), newIng]
    });
  };

  const removeIngredient = (index: number) => {
    if (!editingProduct || !editingProduct.ingredients) return;
    const newIngs = [...editingProduct.ingredients];
    newIngs.splice(index, 1);
    setEditingProduct({ ...editingProduct, ingredients: newIngs });
  };

  const updateIngredient = (index: number, field: keyof ProductIngredient, value: any) => {
    if (!editingProduct || !editingProduct.ingredients) return;
    const newIngs = [...editingProduct.ingredients];
    newIngs[index] = { ...newIngs[index], [field]: value };
    setEditingProduct({ ...editingProduct, ingredients: newIngs });
  };

  if (editingProduct) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <Coffee className="mr-2 text-acai-700" />
          {editingProduct.name ? `Editando: ${editingProduct.name}` : 'Novo Produto / Receita'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-2"
              value={editingProduct.name}
              onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço Venda (R$)</label>
                <input
                  type="number" step="0.01"
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={editingProduct.price}
                  onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2"
                  value={editingProduct.category}
                  onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                />
             </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Ficha Técnica (Composição)</h3>
            <button
              onClick={addIngredient}
              className="text-sm bg-acai-100 text-acai-800 px-3 py-1 rounded-lg hover:bg-acai-200"
            >
              + Adicionar Insumo
            </button>
          </div>
          
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
             {(!editingProduct.ingredients || editingProduct.ingredients.length === 0) && (
                <p className="text-gray-400 text-sm text-center">Nenhum insumo configurado. O estoque não será baixado ao vender este item.</p>
             )}
             {editingProduct.ingredients?.map((ing, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                   <select
                      className="flex-1 border border-gray-300 rounded-lg p-2 text-sm"
                      value={ing.inventoryItemId}
                      onChange={e => updateIngredient(idx, 'inventoryItemId', e.target.value)}
                   >
                      {inventory.map(inv => (
                        <option key={inv.id} value={inv.id}>{inv.name} ({inv.unit})</option>
                      ))}
                   </select>
                   <input
                      type="number" step="0.001"
                      className="w-24 border border-gray-300 rounded-lg p-2 text-sm"
                      placeholder="Qtd"
                      value={ing.quantityRequired}
                      onChange={e => updateIngredient(idx, 'quantityRequired', parseFloat(e.target.value))}
                   />
                   <button onClick={() => removeIngredient(idx)} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 size={18} />
                   </button>
                </div>
             ))}
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            * A quantidade definida aqui será descontada do estoque automaticamente a cada venda.
          </div>
        </div>

        <div className="flex gap-4 mt-8">
            <button
              onClick={() => setEditingProduct(null)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-acai-700 text-white rounded-lg hover:bg-acai-900 flex items-center"
            >
              <Save size={18} className="mr-2" />
              Salvar Produto
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Produtos & Receitas</h1>
        <button
          onClick={() => handleEdit()}
          className="bg-acai-700 hover:bg-acai-900 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-4">
               <div>
                 <h3 className="font-bold text-lg text-gray-800">{p.name}</h3>
                 <span className="text-sm text-gray-500">{p.category}</span>
               </div>
               <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-bold">
                 R$ {p.price.toFixed(2)}
               </span>
             </div>
             
             <div className="mb-4">
               <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Composição (Ficha Técnica):</p>
               <ul className="text-sm text-gray-600 space-y-1">
                 {p.ingredients.slice(0, 3).map((ing, i) => {
                    const invItem = inventory.find(inv => inv.id === ing.inventoryItemId);
                    return (
                      <li key={i} className="flex justify-between">
                         <span>{invItem?.name || 'Item Removido'}</span>
                         <span className="text-gray-400">{ing.quantityRequired} {invItem?.unit}</span>
                      </li>
                    );
                 })}
                 {p.ingredients.length > 3 && <li className="text-xs text-gray-400">+ {p.ingredients.length - 3} itens</li>}
                 {p.ingredients.length === 0 && <li className="italic text-gray-400">Sem composição definida</li>}
               </ul>
             </div>

             <button
                onClick={() => handleEdit(p)}
                className="w-full py-2 border border-acai-200 text-acai-700 rounded-lg hover:bg-acai-50 text-sm font-medium"
             >
                Editar Receita
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
