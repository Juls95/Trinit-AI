"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  budgeted: number;
  spent: number;
  color: string;
  month: string;
}

const ICON_OPTIONS = ["🏠", "🍕", "🚗", "🎮", "⚡", "💊", "🛍️", "🏦", "📱", "✈️", "🎓", "👶", "🐾", "💰", "📦", "🔧"];
const COLOR_OPTIONS = [
  { label: "Blue", value: "bg-blue-500" },
  { label: "Orange", value: "bg-orange-500" },
  { label: "Purple", value: "bg-purple-500" },
  { label: "Pink", value: "bg-pink-500" },
  { label: "Yellow", value: "bg-yellow-500" },
  { label: "Green", value: "bg-green-500" },
  { label: "Red", value: "bg-red-500" },
  { label: "Teal", value: "bg-teal-500" },
];

const DEFAULT_BUDGETS = [
  { name: "Housing", icon: "🏠", budgeted: 1500, color: "bg-blue-500" },
  { name: "Food", icon: "🍕", budgeted: 600, color: "bg-orange-500" },
  { name: "Transportation", icon: "🚗", budgeted: 300, color: "bg-purple-500" },
  { name: "Entertainment", icon: "🎮", budgeted: 200, color: "bg-pink-500" },
  { name: "Utilities", icon: "⚡", budgeted: 250, color: "bg-yellow-500" },
  { name: "Health", icon: "💊", budgeted: 150, color: "bg-green-500" },
  { name: "Shopping", icon: "🛍️", budgeted: 300, color: "bg-red-500" },
  { name: "Savings", icon: "🏦", budgeted: 500, color: "bg-teal-500" },
];

export default function BudgetView() {
  const [budgets, setBudgets] = useState<BudgetCategory[]>([]);
  const [currentMonth, setCurrentMonth] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newBudgeted, setNewBudgeted] = useState("");
  const [newIcon, setNewIcon] = useState("💰");
  const [newColor, setNewColor] = useState("bg-blue-500");
  const [saving, setSaving] = useState(false);

  const fetchBudgets = useCallback(async () => {
    try {
      const res = await fetch("/api/budgets");
      if (res.ok) {
        const data = await res.json();
        setCurrentMonth(data.month);
        if (data.budgets.length > 0) {
          setBudgets(data.budgets);
        } else {
          await seedDefaultBudgets(data.month);
        }
      }
    } catch (error) {
      console.error("Failed to fetch budgets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const seedDefaultBudgets = async (month: string) => {
    const created: BudgetCategory[] = [];
    for (const b of DEFAULT_BUDGETS) {
      try {
        const res = await fetch("/api/budgets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...b, month }),
        });
        if (res.ok) {
          const data = await res.json();
          created.push(data.budget);
        }
      } catch (error) {
        console.error("Failed to create budget:", error);
      }
    }
    setBudgets(created);
  };

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleEditStart = (budget: BudgetCategory) => {
    setEditingId(budget.id);
    setEditValue(budget.budgeted.toString());
  };

  const handleEditSave = async (id: string) => {
    const val = parseFloat(editValue);
    if (isNaN(val) || val < 0) {
      setEditingId(null);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, budgeted: val }),
      });
      if (res.ok) {
        setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, budgeted: val } : b)));
      }
    } catch (error) {
      console.error("Failed to update budget:", error);
    } finally {
      setSaving(false);
      setEditingId(null);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter") handleEditSave(id);
    if (e.key === "Escape") setEditingId(null);
  };

  const handleAddBudget = async () => {
    if (!newName.trim() || !newBudgeted.trim()) return;
    const val = parseFloat(newBudgeted);
    if (isNaN(val) || val <= 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          icon: newIcon,
          budgeted: val,
          color: newColor,
          month: currentMonth,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBudgets((prev) => [...prev, { ...data.budget, spent: 0 }]);
        setNewName("");
        setNewBudgeted("");
        setNewIcon("💰");
        setNewColor("bg-blue-500");
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Failed to add budget:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/budgets?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setBudgets((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete budget:", error);
    } finally {
      setSaving(false);
    }
  };

  const totalBudgeted = budgets.reduce((s, b) => s + b.budgeted, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const remaining = totalBudgeted - totalSpent;

  const monthLabel = currentMonth
    ? new Date(currentMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-white/60 text-lg">
          Loading budgets...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-10 relative" style={{ scrollbarWidth: "none" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">Budget</h1>
            <p className="text-white/50 mt-1 text-sm">{monthLabel} — Click any amount to edit</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition-colors"
          >
            {showAddForm ? "✕ Cancel" : "+ Add Category"}
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 className="text-white/90 font-medium mb-4">New Budget Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">Category Name</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Groceries"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs mb-1 block">Monthly Budget ($)</label>
                    <input
                      type="number"
                      value={newBudgeted}
                      onChange={(e) => setNewBudgeted(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-white/50 text-xs mb-2 block">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setNewIcon(icon)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                          newIcon === icon ? "bg-white/20 ring-2 ring-white/40 scale-110" : "bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-white/50 text-xs mb-2 block">Color</label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setNewColor(c.value)}
                        className={`w-8 h-8 rounded-full ${c.value} transition-all ${
                          newColor === c.value ? "ring-2 ring-white/60 scale-110" : "opacity-60 hover:opacity-100"
                        }`}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-5 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAddBudget}
                    disabled={saving || !newName.trim() || !newBudgeted.trim()}
                    className="px-6 py-2.5 rounded-xl bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? "Saving..." : "Add Category"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: "spring" }} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
            <p className="text-white/50 text-xs mb-1">Total Budgeted</p>
            <p className="text-2xl font-bold font-mono text-white">${totalBudgeted.toLocaleString()}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, type: "spring" }} className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
            <p className="text-white/50 text-xs mb-1">Total Spent</p>
            <p className="text-2xl font-bold font-mono text-orange-400">${totalSpent.toLocaleString()}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: "spring" }} className={`border backdrop-blur-xl rounded-2xl p-5 ${remaining >= 0 ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
            <p className="text-white/50 text-xs mb-1">Remaining</p>
            <p className={`text-2xl font-bold font-mono ${remaining >= 0 ? "text-green-400" : "text-red-400"}`}>${Math.abs(remaining).toLocaleString()}</p>
          </motion.div>
        </div>

        {totalBudgeted > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8">
            <h3 className="text-white/90 font-medium mb-4">Overall Progress</h3>
            <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalSpent / totalBudgeted) * 100, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                className={`h-full rounded-full ${(totalSpent / totalBudgeted) > 0.9 ? "bg-red-500" : (totalSpent / totalBudgeted) > 0.7 ? "bg-orange-500" : "bg-green-500"}`}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-white/40">
              <span>{Math.round((totalSpent / totalBudgeted) * 100)}% used</span>
              <span>${remaining.toLocaleString()} left</span>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((budget, i) => {
            const pct = budget.budgeted > 0 ? Math.min((budget.spent / budget.budgeted) * 100, 100) : 0;
            const over = budget.spent > budget.budgeted;
            const isEditing = editingId === budget.id;
            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, type: "spring" }}
                className={`group bg-white/5 backdrop-blur-xl border rounded-2xl p-5 transition-colors hover:bg-white/[0.07] ${over ? "border-red-500/30" : "border-white/10"}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg">{budget.icon}</div>
                    <div>
                      <h4 className="text-white/90 font-medium text-sm">{budget.name}</h4>
                      <p className="text-white/40 text-xs">
                        ${budget.spent.toLocaleString()} of{" "}
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleEditSave(budget.id)}
                            onKeyDown={(e) => handleEditKeyDown(e, budget.id)}
                            autoFocus
                            min="0"
                            step="0.01"
                            className="inline-block w-24 bg-white/10 border border-white/30 rounded px-2 py-0.5 text-white text-xs font-mono focus:outline-none focus:border-white/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        ) : (
                          <button
                            onClick={() => handleEditStart(budget)}
                            className="cursor-pointer hover:text-white/80 underline underline-offset-2 decoration-dashed decoration-white/30 transition-colors"
                            title="Click to edit budget amount"
                          >
                            ${budget.budgeted.toLocaleString()}
                          </button>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-sm font-mono font-medium ${over ? "text-red-400" : "text-white/60"}`}>
                      {over ? `-$${(budget.spent - budget.budgeted).toLocaleString()}` : `$${(budget.budgeted - budget.spent).toLocaleString()}`}
                    </div>
                    <button
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center justify-center hover:bg-red-500/20 transition-all"
                      title="Delete category"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 + i * 0.05 }}
                    className={`h-full rounded-full ${over ? "bg-red-500" : pct > 80 ? "bg-orange-500" : budget.color}`}
                  />
                </div>
                {over && <p className="text-red-400/70 text-[10px] mt-1.5">Over budget by ${(budget.spent - budget.budgeted).toLocaleString()}</p>}
              </motion.div>
            );
          })}
        </div>

        {budgets.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-white/30 text-sm mb-4">No budgets set up yet.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20 transition-colors"
            >
              + Create Your First Budget
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
