"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface DashboardData {
  netWorth: number;
  totalIncome: number;
  totalExpenses: number;
  recurringCount: number;
  isPaid: boolean;
  transactions: { id: string; description: string; amount: number; type: string; category: string; date: string }[];
  budgets: { id: string; name: string; budgeted: number; spent: number }[];
}

const Widget = ({ title, children, className = "", delay = 0 }: { title: string; children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, type: "spring" }}
    className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col ${className}`}
  >
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-white/90 font-medium font-sans">{title}</h3>
    </div>
    <div className="flex-1 flex flex-col">
      {children}
    </div>
  </motion.div>
);

export default function DashboardGrid() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-white/60 text-lg">
          Loading dashboard...
        </motion.div>
      </div>
    );
  }

  const netWorth = data?.netWorth ?? 0;
  const totalIncome = data?.totalIncome ?? 0;
  const totalExpenses = data?.totalExpenses ?? 0;
  const recentTx = data?.transactions?.slice(0, 5) ?? [];
  const budgets = data?.budgets?.slice(0, 4) ?? [];

  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-10 z-10 relative" style={{ scrollbarWidth: 'none' }}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-end mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">Good evening!</h1>
            <p className="text-white/50 mt-1 text-sm">Here&apos;s your financial overview</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Net Worth", value: `$${netWorth.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: netWorth >= 0 ? "text-green-400" : "text-red-400", bg: "bg-white/5 border-white/10" },
            { label: "Total Income", value: `$${totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
            { label: "Total Expenses", value: `$${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, type: "spring" }}
              className={`${card.bg} border backdrop-blur-xl rounded-2xl p-5`}
            >
              <p className="text-white/50 text-xs mb-1">{card.label}</p>
              <p className={`text-2xl font-bold font-mono ${card.color}`}>{card.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-6">
            <Widget title="Recent Transactions" delay={0.2}>
              {recentTx.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                  <p className="text-white/40 text-sm">No transactions yet.</p>
                  <p className="text-white/30 text-xs">Add transactions from the Transactions tab or chat with Trinit.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {recentTx.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          tx.type === "INCOME" ? "bg-green-500/20" : tx.type === "TRANSFER" ? "bg-blue-500/20" : "bg-red-500/20"
                        }`}>
                          {tx.type === "INCOME" ? "↗" : tx.type === "TRANSFER" ? "↔" : "↙"}
                        </div>
                        <div>
                          <span className="text-white/90 text-sm">{tx.description}</span>
                          <span className="text-white/30 text-xs ml-2">{tx.category}</span>
                        </div>
                      </div>
                      <span className={`font-mono text-sm font-medium ${tx.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Widget>

            <Widget title="Net Worth" delay={0.4}>
              <div className="h-48 w-full mt-4 relative flex items-end">
                <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  <motion.path
                    d="M 0 35 L 20 30 L 40 32 L 60 25 L 80 20 L 100 15"
                    fill="transparent"
                    stroke="#4ade80"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
                  />
                  <motion.circle
                    cx="100" cy="15" r="2" fill="#4ade80"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}
                  />
                </svg>
                <div className="absolute top-2 right-2 text-right">
                  <p className="text-white/40 text-xs">Current</p>
                  <p className={`text-lg font-mono font-bold ${netWorth >= 0 ? "text-green-400" : "text-red-400"}`}>
                    ${netWorth.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </Widget>
          </div>

          <div className="flex flex-col gap-6">
            <Widget title="Budget Overview" delay={0.3}>
              {budgets.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                  <p className="text-white/40 text-sm">No budgets set up yet.</p>
                  <p className="text-white/30 text-xs">Visit the Budget tab to create one.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {budgets.map((b) => {
                    const pct = b.budgeted > 0 ? Math.min((b.spent / b.budgeted) * 100, 100) : 0;
                    return (
                      <div key={b.id} className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/70">{b.name}</span>
                          <span className="text-white/40 font-mono">${b.spent} / ${b.budgeted}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-orange-500" : "bg-green-500"}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Widget>

            <Widget title="Quick Stats" delay={0.5}>
              <div className="flex flex-col gap-3 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">Savings Rate</span>
                  <span className={`font-mono text-sm font-medium ${totalIncome > 0 && ((totalIncome - totalExpenses) / totalIncome) >= 0.2 ? "text-green-400" : "text-orange-400"}`}>
                    {totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">Recurring Bills</span>
                  <span className="text-white/80 font-mono text-sm">{data?.recurringCount ?? 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">Plan</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${data?.isPaid ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/10 text-white/60 border border-white/20"}`}>
                    {data?.isPaid ? "Premium" : "Free"}
                  </span>
                </div>
              </div>
            </Widget>

            <Widget title="Advice" delay={0.7}>
              <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                <h4 className="text-white/90 text-sm font-medium leading-relaxed">Chat with Trinit for personalized financial advice</h4>
                <p className="text-white/40 text-xs">Ask about budgeting, saving goals, or spending habits.</p>
              </div>
            </Widget>
          </div>
        </div>
      </div>
    </div>
  );
}
