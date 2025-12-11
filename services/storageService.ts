import { InventoryItem, Product, Sale, Transaction, TransactionType, TransactionCategory, PaymentMethod } from '../types';

const KEYS = {
  INVENTORY: 'acai_inventory',
  PRODUCTS: 'acai_products',
  SALES: 'acai_sales',
  TRANSACTIONS: 'acai_transactions',
  USER_ROLE: 'acai_user_role'
};

// --- Helpers ---
const get = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const set = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
  window.dispatchEvent(new Event('storage-update')); // Custom event for reactivity
};

// --- Inventory ---
export const getInventory = (): InventoryItem[] => get<InventoryItem>(KEYS.INVENTORY);

export const saveInventoryItem = (item: InventoryItem) => {
  const items = getInventory();
  const index = items.findIndex(i => i.id === item.id);
  if (index >= 0) {
    items[index] = item;
  } else {
    items.push(item);
  }
  set(KEYS.INVENTORY, items);
};

export const adjustStock = (id: string, adjustment: number) => {
  const items = getInventory();
  const item = items.find(i => i.id === id);
  if (item) {
    item.quantity += adjustment;
    set(KEYS.INVENTORY, items);
  }
};

// --- Products (Recipes) ---
export const getProducts = (): Product[] => get<Product>(KEYS.PRODUCTS);

export const saveProduct = (product: Product) => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  set(KEYS.PRODUCTS, products);
};

// --- Sales & Financials ---
export const getSales = (): Sale[] => get<Sale>(KEYS.SALES);

export const getTransactions = (): Transaction[] => get<Transaction>(KEYS.TRANSACTIONS);

export const createSale = (sale: Sale) => {
  // 1. Save Sale
  const sales = getSales();
  sales.push(sale);
  set(KEYS.SALES, sales);

  // 2. Create Revenue Transaction
  const transaction: Transaction = {
    id: crypto.randomUUID(),
    date: sale.date,
    description: `Venda #${sale.id.slice(0, 6)}`,
    amount: sale.totalAmount,
    type: TransactionType.INCOME,
    category: TransactionCategory.SALES
  };
  const transactions = getTransactions();
  transactions.push(transaction);
  set(KEYS.TRANSACTIONS, transactions);

  // 3. Deduct Inventory (The "Ficha Técnica" Logic)
  const inventory = getInventory();
  const products = getProducts();

  sale.items.forEach(saleItem => {
    const product = products.find(p => p.id === saleItem.productId);
    if (product && product.ingredients) {
      product.ingredients.forEach(ing => {
        const invItem = inventory.find(i => i.id === ing.inventoryItemId);
        if (invItem) {
          // Deduct: Ingredient Required * Quantity Sold
          invItem.quantity -= (ing.quantityRequired * saleItem.quantity);
        }
      });
    }
  });
  set(KEYS.INVENTORY, inventory);
};

export const addExpense = (transaction: Transaction) => {
  const transactions = getTransactions();
  transactions.push(transaction);
  set(KEYS.TRANSACTIONS, transactions);
};

// --- Utils ---
export const seedDatabase = () => {
  // 1. Seed Inventory & Products if empty
  if (getInventory().length === 0) {
    const inv: InventoryItem[] = [
      { id: '1', name: 'Açaí Base', unit: 'Kg' as any, quantity: 10, costPrice: 15.00, minStock: 5 },
      { id: '2', name: 'Leite em Pó', unit: 'Kg' as any, quantity: 2, costPrice: 20.00, minStock: 0.5 },
      { id: '3', name: 'Copo 300ml', unit: 'Un' as any, quantity: 100, costPrice: 0.20, minStock: 20 },
      { id: '4', name: 'Copo 500ml', unit: 'Un' as any, quantity: 100, costPrice: 0.30, minStock: 20 },
      { id: '5', name: 'Granola', unit: 'Kg' as any, quantity: 5, costPrice: 12.00, minStock: 1 },
    ];
    set(KEYS.INVENTORY, inv);

    const prods: Product[] = [
      {
        id: 'p1', name: 'Açaí 300ml Tradicional', price: 12.00, category: 'Açaí',
        ingredients: [
          { inventoryItemId: '1', quantityRequired: 0.250 }, // 250g acai
          { inventoryItemId: '2', quantityRequired: 0.020 }, // 20g milk powder
          { inventoryItemId: '5', quantityRequired: 0.030 }, // 30g granola
          { inventoryItemId: '3', quantityRequired: 1 }      // 1 cup
        ]
      },
      {
        id: 'p2', name: 'Açaí 500ml Tradicional', price: 18.00, category: 'Açaí',
        ingredients: [
           { inventoryItemId: '1', quantityRequired: 0.400 },
           { inventoryItemId: '2', quantityRequired: 0.030 },
           { inventoryItemId: '5', quantityRequired: 0.050 },
           { inventoryItemId: '4', quantityRequired: 1 }
        ]
      }
    ];
    set(KEYS.PRODUCTS, prods);
  }

  // 2. Seed Sales & Finance if empty
  if (getSales().length === 0) {
    const today = new Date();
    const mockSales: Sale[] = [];
    const mockTransactions: Transaction[] = [];

    // Helper to subtract days
    const addDays = (date: Date, days: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    // --- Mock Expenses ---
    // Rent 10 days ago
    mockTransactions.push({
      id: crypto.randomUUID(),
      date: addDays(today, -10).toISOString(),
      description: 'Aluguel Loja Centro',
      amount: 1200.00,
      type: TransactionType.EXPENSE,
      category: TransactionCategory.RENT
    });

    // Stock Purchase 8 days ago
    mockTransactions.push({
      id: crypto.randomUUID(),
      date: addDays(today, -8).toISOString(),
      description: 'Compra Fornecedor (Frutas)',
      amount: 450.00,
      type: TransactionType.EXPENSE,
      category: TransactionCategory.STOCK_PURCHASE
    });

    // Utilities 2 days ago
    mockTransactions.push({
      id: crypto.randomUUID(),
      date: addDays(today, -2).toISOString(),
      description: 'Conta de Energia (CPFL)',
      amount: 320.50,
      type: TransactionType.EXPENSE,
      category: TransactionCategory.UTILITIES
    });

    // --- Mock Sales ---
    // Generate ~20 sales over the last 7 days
    const products = getProducts();
    const paymentMethods = [PaymentMethod.PIX, PaymentMethod.CASH, PaymentMethod.CREDIT, PaymentMethod.DEBIT];
    
    // Safety check: only generate sales if we have products seeded
    if (products.length > 0) {
      for (let i = 0; i < 20; i++) {
        const daysAgo = Math.floor(Math.random() * 7); // 0 to 6 days ago
        const saleDate = addDays(today, -daysAgo).toISOString();
        
        // Pick a random product
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = Math.random() > 0.8 ? 2 : 1; // Mostly 1 item, sometimes 2
        const total = product.price * qty;
        
        const saleId = crypto.randomUUID();
        
        const sale: Sale = {
          id: saleId,
          date: saleDate,
          items: [{
             productId: product.id,
             productName: product.name,
             quantity: qty,
             total: total
          }],
          totalAmount: total,
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          cashierName: 'Administrador'
        };
        
        mockSales.push(sale);
        
        // Add corresponding income transaction
        mockTransactions.push({
          id: crypto.randomUUID(),
          date: saleDate,
          description: `Venda #${saleId.slice(0, 6)}`,
          amount: total,
          type: TransactionType.INCOME,
          category: TransactionCategory.SALES
        });
      }
    }

    set(KEYS.SALES, mockSales);
    
    // Combine with any existing transactions (though likely empty if we are here)
    const existingTrans = getTransactions();
    set(KEYS.TRANSACTIONS, [...existingTrans, ...mockTransactions]);
  }
};