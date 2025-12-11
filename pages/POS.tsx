import React, { useEffect, useState } from 'react';
import { Search, ShoppingCart, Trash2, CreditCard, Banknote, Smartphone, CheckCircle } from 'lucide-react';
import { getProducts, createSale } from '../services/storageService';
import { Product, CartItem, PaymentMethod, Role } from '../types';

const POS: React.FC<{ currentRole: Role }> = ({ currentRole }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, cartId: crypto.randomUUID(), quantity: 1 }]);
    }
  };

  const removeFromCart = (cartId: string) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.cartId === cartId) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (!selectedPayment || cart.length === 0) return;

    createSale({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      items: cart.map(c => ({
        productId: c.id,
        productName: c.name,
        quantity: c.quantity,
        total: c.price * c.quantity
      })),
      totalAmount: cartTotal,
      paymentMethod: selectedPayment,
      cashierName: currentRole
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCart([]);
      setSelectedPayment(null);
    }, 2000);
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-100px)] lg:h-[calc(100vh-2rem)] gap-6">
      {/* Left: Product Catalog */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
             <input
               className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-acai-500"
               placeholder="Buscar produto..."
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-acai-300 transition-all flex flex-col items-center text-center h-40 justify-center group"
                >
                   <div className="w-12 h-12 bg-acai-100 rounded-full flex items-center justify-center text-acai-700 mb-3 group-hover:bg-acai-500 group-hover:text-white transition-colors">
                      <span className="font-bold text-lg">{p.name.charAt(0)}</span>
                   </div>
                   <h3 className="font-medium text-gray-800 line-clamp-2 leading-tight mb-1">{p.name}</h3>
                   <span className="text-acai-700 font-bold">R$ {p.price.toFixed(2)}</span>
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-96 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col">
         <div className="p-4 bg-acai-900 text-white rounded-t-xl flex items-center justify-between">
            <h2 className="font-bold text-lg flex items-center">
              <ShoppingCart className="mr-2" size={20} /> Carrinho
            </h2>
            <span className="text-sm opacity-75">{cart.reduce((acc, i) => acc + i.quantity, 0)} itens</span>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cart.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <ShoppingCart size={48} className="mb-2 opacity-20" />
                  <p>Carrinho vazio</p>
               </div>
            ) : (
               cart.map(item => (
                 <div key={item.cartId} className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div className="flex-1">
                       <p className="font-medium text-gray-800 line-clamp-1">{item.name}</p>
                       <p className="text-sm text-gray-500">R$ {item.price.toFixed(2)} un</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="flex items-center border border-gray-200 rounded-lg">
                          <button onClick={() => updateQuantity(item.cartId, -1)} className="px-2 py-1 hover:bg-gray-100 text-gray-600">-</button>
                          <span className="px-2 font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartId, 1)} className="px-2 py-1 hover:bg-gray-100 text-gray-600">+</button>
                       </div>
                       <button onClick={() => removeFromCart(item.cartId)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={18} />
                       </button>
                    </div>
                 </div>
               ))
            )}
         </div>

         <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
            <div className="flex justify-between items-center mb-4">
               <span className="text-gray-600">Total a Pagar</span>
               <span className="text-2xl font-bold text-gray-900">R$ {cartTotal.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
               {[
                 { id: PaymentMethod.CASH, icon: Banknote, label: 'Din' },
                 { id: PaymentMethod.CREDIT, icon: CreditCard, label: 'Créd' },
                 { id: PaymentMethod.DEBIT, icon: CreditCard, label: 'Déb' },
                 { id: PaymentMethod.PIX, icon: Smartphone, label: 'Pix' }
               ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedPayment(m.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                      selectedPayment === m.id
                      ? 'bg-acai-700 text-white border-acai-700'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-acai-300'
                    }`}
                  >
                     <m.icon size={20} className="mb-1" />
                     <span className="text-xs">{m.label}</span>
                  </button>
               ))}
            </div>

            <button
               onClick={handleCheckout}
               disabled={cart.length === 0 || !selectedPayment}
               className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center transition-all ${
                  cart.length > 0 && selectedPayment
                  ? 'bg-green-600 hover:bg-green-700 text-white transform hover:-translate-y-1'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
               }`}
            >
               {showSuccess ? (
                 <>
                   <CheckCircle className="mr-2" /> Venda Realizada!
                 </>
               ) : (
                 'Finalizar Venda'
               )}
            </button>
         </div>
      </div>
    </div>
  );
};

export default POS;
