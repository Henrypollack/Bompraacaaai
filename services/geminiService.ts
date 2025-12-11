import { InventoryItem, Transaction, TransactionType } from "../types";

// Agora este serviço roda localmente sem IA, apenas analisando números
export const analyzeBusiness = async (inventory: InventoryItem[], transactions: Transaction[]) => {
    // Simula um pequeno delay para parecer processamento
    await new Promise(resolve => setTimeout(resolve, 800));

    const lowStock = inventory.filter(i => i.quantity <= i.minStock);
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const income = transactions.filter(t => t.type === TransactionType.INCOME);
    
    const totalExpenses = expenses.reduce((acc, t) => acc + t.amount, 0);
    const totalIncome = income.reduce((acc, t) => acc + t.amount, 0);
    const profit = totalIncome - totalExpenses;

    let insights = `### Análise do Sistema (Modo Offline)\n\n`;

    // 1. Análise de Estoque
    if (lowStock.length > 0) {
        insights += `* ⚠️ **Atenção ao Estoque:** Você tem ${lowStock.length} itens abaixo do mínimo. Reponha urgentemente: ${lowStock.map(i => i.name).join(', ')}.\n`;
    } else {
        insights += `* ✅ **Estoque Saudável:** Todos os seus insumos estão com níveis adequados de quantidade.\n`;
    }

    // 2. Análise Financeira
    if (profit < 0) {
        insights += `* 📉 **Alerta Financeiro:** Seu negócio está com prejuízo de R$ ${Math.abs(profit).toFixed(2)} no período. Revise seus custos fixos ou aumente o volume de vendas.\n`;
    } else if (profit > 0 && profit < 500) {
        insights += `* ⚖️ **Lucro Moderado:** Você está no azul, mas com margem apertada (R$ ${profit.toFixed(2)}). Tente promoções para aumentar o ticket médio.\n`;
    } else {
        insights += `* 🚀 **Excelente Resultado:** Seu lucro está sólido (R$ ${profit.toFixed(2)}). Considere reinvestir parte desse valor em novos equipamentos.\n`;
    }

    // 3. Dica Geral
    if (income.length === 0) {
        insights += `* 💡 **Dica:** Comece a registrar suas vendas no PDV para gerar dados mais precisos.`;
    } else {
        insights += `* 💡 **Dica:** Mantenha o registro diário de todas as despesas para que o cálculo de lucro seja real.`;
    }

    return insights;
};