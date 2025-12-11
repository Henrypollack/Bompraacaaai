import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react';
import { getInventory, getSales, getTransactions } from '../services/storageService';
import { analyzeBusiness } from '../services/geminiService';
import { DashboardStats, TransactionType } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({ todaySales: 0, monthSales: 0, lowStockCount: 0, netProfit: 0 });
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    window.addEventListener('storage-update', loadData);
    return () => window.removeEventListener('storage-update', loadData);
  }, []);

  const loadData = () => {
    const sales = getSales();
    const inventory = getInventory();
    const transactions = getTransactions();

    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales
      .filter(s => s.date.startsWith(today))
      .reduce((acc, curr) => acc + curr.totalAmount, 0);

    const monthSales = sales.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const lowStockCount = inventory.filter(i => i.quantity <= i.minStock).length;

    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + t.amount, 0);

    setStats({
      todaySales,
      monthSales,
      lowStockCount,
      netProfit: totalIncome - totalExpense
    });

    // Prepare chart data (last 7 days sales)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const data = last7Days.map(date => {
      const daySales = sales
        .filter(s => s.date.startsWith(date))
        .reduce((sum, s) => sum + s.totalAmount, 0);
      return { name: date.split('-').slice(1).join('/'), vendas: daySales };
    });
    setChartData(data);
  };

  const handleGenerateInsight = async () => {
    setLoadingAi(true);
    const inv = getInventory();
    const trans = getTransactions();
    const insight = await analyzeBusiness(inv, trans);
    setAiInsight(insight);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Visão Geral do Negócio</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Vendas Hoje" value={`R$ ${stats.todaySales.toFixed(2)}`} icon={ShoppingBag} color="text-blue-600" bg="bg-blue-100" />
        <StatCard title="Vendas Totais" value={`R$ ${stats.monthSales.toFixed(2)}`} icon={TrendingUp} color="text-green-600" bg="bg-green-100" />
        <StatCard title="Lucro Líquido" value={`R$ ${stats.netProfit.toFixed(2)}`} icon={DollarSign} color={stats.netProfit >= 0 ? "text-green-600" : "text-red-600"} bg={stats.netProfit >= 0 ? "bg-green-100" : "bg-red-100"} />
        <StatCard title="Estoque Baixo" value={`${stats.lowStockCount} Itens`} icon={AlertTriangle} color="text-orange-600" bg="bg-orange-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Desempenho de Vendas (7 dias)</h2>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                  <Bar dataKey="vendas" fill="#8884d8" name="Vendas" />
                </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
              Dicas do Negócio
            </h2>
            <button
              onClick={handleGenerateInsight}
              disabled={loadingAi}
              className="text-xs bg-acai-100 text-acai-700 px-3 py-1 rounded hover:bg-acai-200 disabled:opacity-50"
            >
              {loadingAi ? 'Analisando...' : 'Gerar Relatório'}
            </button>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg p-4 text-sm text-gray-700 overflow-y-auto">
            {aiInsight ? (
              <div className="prose prose-sm" dangerouslySetInnerHTML={{ __html: aiInsight.replace(/\n/g, '<br/>') }} />
            ) : (
              <p className="text-gray-400 italic text-center mt-10">
                Clique em "Gerar Relatório" para receber uma análise automática do seu estoque e finanças.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
    <div className={`p-3 rounded-full ${bg} ${color} mr-4`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

export default Dashboard;