"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  category: string;
  date: string;
}

interface Budget {
  id: string;
  name: string;
  icon: string;
  budgeted: number;
  spent: number;
  color: string;
  month: string;
}

interface CategoryBreakdown {
  name: string;
  amount: number;
  pct: number;
  color: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Housing: "bg-blue-500",
  Food: "bg-orange-500",
  Savings: "bg-teal-500",
  Shopping: "bg-red-500",
  Transportation: "bg-purple-500",
  Entertainment: "bg-pink-500",
  Utilities: "bg-yellow-500",
  Health: "bg-green-500",
  Investments: "bg-cyan-500",
  Income: "bg-emerald-500",
  Other: "bg-gray-500",
};

function formatCurrency(n: number) {
  return `$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default function ReportsView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [txRes, budgetRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/budgets"),
      ]);
      if (txRes.ok) {
        const txData = await txRes.json();
        const all = [...(txData.transactions || []), ...(txData.shared || [])];
        setTransactions(all.map((t: Transaction & { date: string }) => ({
          ...t,
          date: new Date(t.date).toISOString().split("T")[0],
        })));
      }
      if (budgetRes.ok) {
        const bData = await budgetRes.json();
        setBudgets(bData.budgets || []);
      }
    } catch (err) {
      console.error("Failed to fetch report data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-white/60 text-lg">
          Loading reports...
        </motion.div>
      </div>
    );
  }

  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  const expensesByCategory: Record<string, number> = {};
  transactions
    .filter((t) => t.type === "EXPENSE")
    .forEach((t) => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + Math.abs(t.amount);
    });

  const categoryBreakdown: CategoryBreakdown[] = Object.entries(expensesByCategory)
    .map(([name, amount]) => ({
      name,
      amount,
      pct: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      color: CATEGORY_COLORS[name] || "bg-gray-500",
    }))
    .sort((a, b) => b.amount - a.amount);

  const monthlyData: Record<string, { income: number; expenses: number }> = {};
  transactions.forEach((t) => {
    const month = t.date.substring(0, 7);
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expenses: 0 };
    if (t.type === "INCOME") monthlyData[month].income += Math.abs(t.amount);
    if (t.type === "EXPENSE") monthlyData[month].expenses += Math.abs(t.amount);
  });

  const months = Object.keys(monthlyData).sort().slice(-6);
  const monthLabels = months.map((m) => {
    const d = new Date(m + "-01");
    return d.toLocaleDateString("en-US", { month: "short" });
  });
  const incomeData = months.map((m) => monthlyData[m]?.income || 0);
  const expenseData = months.map((m) => monthlyData[m]?.expenses || 0);
  const maxVal = Math.max(...incomeData, ...expenseData, 1);

  const totalBudgeted = budgets.reduce((s, b) => s + b.budgeted, 0);
  const totalBudgetSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const budgetUsage = totalBudgeted > 0 ? Math.round((totalBudgetSpent / totalBudgeted) * 100) : 0;

  const hasData = transactions.length > 0;

  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-10 relative" style={{ scrollbarWidth: "none" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">Reports</h1>
            <p className="text-white/50 mt-1 text-sm">Based on your real transaction & budget data</p>
          </div>
        </motion.div>

        {!hasData ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-16 text-center">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-white/40 text-sm">No transaction data yet. Add transactions to see your reports.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Income", value: formatCurrency(totalIncome), color: "text-green-400" },
                { label: "Total Expenses", value: formatCurrency(totalExpenses), color: "text-red-400" },
                { label: "Net Savings", value: `${netSavings >= 0 ? "" : "-"}${formatCurrency(netSavings)}`, color: netSavings >= 0 ? "text-green-400" : "text-red-400" },
                { label: "Savings Rate", value: `${savingsRate}%`, color: savingsRate >= 20 ? "text-green-400" : savingsRate >= 0 ? "text-orange-400" : "text-red-400" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, type: "spring" }}
                  className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4"
                >
                  <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className={`text-xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {months.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-white/90 font-medium">Income vs Expenses</h3>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /> Income</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Expenses</div>
                  </div>
                </div>
                <div className="flex items-end gap-3 h-48">
                  {monthLabels.map((month, i) => (
                    <div key={month + i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center gap-1 h-40">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(incomeData[i] / maxVal) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: "easeOut" }}
                          className="w-[40%] bg-green-500/60 rounded-t-md min-h-[2px]"
                        />
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${(expenseData[i] / maxVal) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + i * 0.08, ease: "easeOut" }}
                          className="w-[40%] bg-red-500/60 rounded-t-md min-h-[2px]"
                        />
                      </div>
                      <span className="text-white/40 text-[10px] font-mono">{month}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <h3 className="text-white/90 font-medium mb-5">Spending by Category</h3>
                {categoryBreakdown.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {categoryBreakdown.map((cat, i) => (
                      <motion.div
                        key={cat.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <div className={`w-2 h-2 rounded-full ${cat.color} flex-shrink-0`} />
                        <span className="text-white/70 text-sm flex-1 truncate">{cat.name}</span>
                        <span className="text-white/40 text-xs font-mono">{cat.pct}%</span>
                        <span className="text-white/60 text-sm font-mono w-24 text-right">{formatCurrency(cat.amount)}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/30 text-sm">No expense data yet.</p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
              >
                <h3 className="text-white/90 font-medium mb-5">Budget Overview</h3>
                {budgets.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/50 text-xs">Total Budget Usage</span>
                      <span className={`text-sm font-mono font-bold ${budgetUsage > 100 ? "text-red-400" : budgetUsage > 80 ? "text-orange-400" : "text-green-400"}`}>
                        {budgetUsage}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(budgetUsage, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${budgetUsage > 100 ? "bg-red-500" : budgetUsage > 80 ? "bg-orange-500" : "bg-green-500"}`}
                      />
                    </div>
                    {budgets.map((b, i) => {
                      const usage = b.budgeted > 0 ? Math.round((b.spent / b.budgeted) * 100) : 0;
                      return (
                        <motion.div
                          key={b.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.05 }}
                          className="flex items-center gap-3"
                        >
                          <span className="text-base">{b.icon}</span>
                          <span className="text-white/70 text-sm flex-1">{b.name}</span>
                          <span className={`text-xs font-mono ${usage > 100 ? "text-red-400" : "text-white/40"}`}>
                            {formatCurrency(b.spent)} / {formatCurrency(b.budgeted)}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-white/30 text-sm">No budgets set. Go to Budget tab to create one.</p>
                )}
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8"
            >
              <h3 className="text-white/90 font-medium mb-5">Recent Transactions</h3>
              <div className="flex flex-col gap-2">
                {transactions.slice(0, 10).map((tx, i) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.03 }}
                    className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      tx.type === "INCOME" ? "bg-green-500/20" : "bg-red-500/20"
                    }`}>
                      {tx.type === "INCOME" ? "↗" : "↙"}
                    </div>
                    <span className="text-white/70 text-sm flex-1 truncate">{tx.description}</span>
                    <span className="text-white/30 text-xs font-mono">{tx.date}</span>
                    <span className={`font-mono text-sm ${tx.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {tx.amount >= 0 ? "+" : "-"}{formatCurrency(tx.amount)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
