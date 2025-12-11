export enum UnitOfMeasure {
  KG = 'Kg',
  G = 'g',
  L = 'L',
  ML = 'ml',
  UNIT = 'Un',
  PACK = 'Pct'
}

export enum PaymentMethod {
  CASH = 'Dinheiro',
  CREDIT = 'Crédito',
  DEBIT = 'Débito',
  PIX = 'Pix'
}

export enum TransactionType {
  INCOME = 'Receita',
  EXPENSE = 'Despesa'
}

export enum TransactionCategory {
  SALES = 'Vendas',
  STOCK_PURCHASE = 'Compra de Estoque',
  RENT = 'Aluguel',
  UTILITIES = 'Contas (Água/Luz)',
  SALARY = 'Salários',
  OTHER = 'Outros'
}

export enum Role {
  ADMIN = 'Administrador',
  CASHIER = 'Operador de Caixa'
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: UnitOfMeasure;
  quantity: number;
  costPrice: number; // Cost per unit
  minStock: number;
}

export interface ProductIngredient {
  inventoryItemId: string;
  quantityRequired: number; // How much of the inventory item logic unit is needed
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  ingredients: ProductIngredient[]; // The "Ficha Técnica"
}

export interface CartItem extends Product {
  cartId: string;
  quantity: number;
}

export interface Sale {
  id: string;
  date: string; // ISO string
  items: { productId: string; productName: string; quantity: number; total: number }[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  cashierName: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
}

export interface DashboardStats {
  todaySales: number;
  monthSales: number;
  lowStockCount: number;
  netProfit: number;
}
