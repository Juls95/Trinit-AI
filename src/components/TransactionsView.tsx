"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ContactUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  category: string;
  date: string;
  sharedWith?: ContactUser[];
  isSharedWithMe?: boolean;
  owner?: ContactUser;
}

const CATEGORIES = ["All", "Income", "Housing", "Food", "Entertainment", "Utilities", "Savings", "Health", "Investments", "Transportation", "Shopping", "Other"];

function formatCurrency(amount: number) {
  const abs = Math.abs(amount);
  return `${amount < 0 ? "-" : "+"}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

export default function TransactionsView() {
  const [filter, setFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTx, setNewTx] = useState({ description: "", amount: "", type: "EXPENSE" as Transaction["type"], category: "Food", sharedWithIds: [] as string[] });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sharedTransactions, setSharedTransactions] = useState<Transaction[]>([]);
  const [contacts, setContacts] = useState<{ id: string; nickname: string | null; user: ContactUser }[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"all" | "mine" | "shared">("all");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [editShareTx, setEditShareTx] = useState<Transaction | null>(null);
  const [editShareIds, setEditShareIds] = useState<string[]>([]);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch("/api/transactions");
      if (res.ok) {
        const data = await res.json();
        setTransactions((data.transactions || []).map((t: Transaction & { date: string }) => ({
          ...t,
          date: new Date(t.date).toISOString().split("T")[0],
        })));
        setSharedTransactions((data.shared || []).map((t: Transaction & { date: string }) => ({
          ...t,
          date: new Date(t.date).toISOString().split("T")[0],
        })));
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch("/api/contacts");
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchContacts();
  }, [fetchTransactions, fetchContacts]);

  const allTransactions = [
    ...transactions,
    ...sharedTransactions,
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displayList = viewMode === "all" ? allTransactions : viewMode === "shared" ? sharedTransactions : transactions;
  const filtered = filter === "All" ? displayList : displayList.filter((t) => t.category === filter);

  const ownIncome = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => {
    const share = (t.sharedWith && t.sharedWith.length > 0) ? 0.5 : 1;
    return s + Math.abs(t.amount) * share;
  }, 0);
  const ownExpenses = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => {
    const share = (t.sharedWith && t.sharedWith.length > 0) ? 0.5 : 1;
    return s + Math.abs(t.amount) * share;
  }, 0);
  const sharedIncome = sharedTransactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + Math.abs(t.amount) * 0.5, 0);
  const sharedExpenses = sharedTransactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + Math.abs(t.amount) * 0.5, 0);
  const totalIncome = ownIncome + sharedIncome;
  const totalExpenses = ownExpenses + sharedExpenses;

  const toggleSharedWith = (userId: string) => {
    setNewTx((prev) => ({
      ...prev,
      sharedWithIds: prev.sharedWithIds.includes(userId)
        ? prev.sharedWithIds.filter((id) => id !== userId)
        : [...prev.sharedWithIds, userId],
    }));
  };

  const handleAdd = async () => {
    if (!newTx.description || !newTx.amount) return;
    const amt = parseFloat(newTx.amount);
    if (isNaN(amt)) return;

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: newTx.description,
          amount: newTx.type === "EXPENSE" ? -Math.abs(amt) : Math.abs(amt),
          type: newTx.type,
          category: newTx.category,
          sharedWithIds: newTx.sharedWithIds,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTransactions((prev) => [{
          ...data.transaction,
          date: new Date(data.transaction.date).toISOString().split("T")[0],
        }, ...prev]);
        setNewTx({ description: "", amount: "", type: "EXPENSE", category: "Food", sharedWithIds: [] });
        setShowAddModal(false);
      } else {
        const err = await res.json();
        if (err.error === "FREE_LIMIT") {
          setShowAddModal(false);
          setShowUpgrade(true);
        }
      }
    } catch (error) {
      console.error("Failed to add transaction:", error);
    }
  };

  const openEditShare = (tx: Transaction) => {
    setEditShareTx(tx);
    setEditShareIds(tx.sharedWith?.map((u) => u.id) || []);
  };

  const handleUpdateShare = async () => {
    if (!editShareTx) return;
    try {
      const res = await fetch("/api/transactions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editShareTx.id, sharedWithIds: editShareIds }),
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions((prev) => prev.map((t) =>
          t.id === editShareTx.id ? { ...t, sharedWith: data.transaction.sharedWith } : t
        ));
        setEditShareTx(null);
      }
    } catch (error) {
      console.error("Failed to update sharing:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-white/60 text-lg">
          Loading transactions...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-10 relative" style={{ scrollbarWidth: "none" }}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-wide">Transactions</h1>
            <p className="text-white/50 mt-1 text-sm">Track every dollar in and out</p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-white/5 border border-white/10 rounded-full overflow-hidden">
              {([["all", "All"], ["mine", "Mine"], ["shared", "Shared"]] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 text-xs font-medium transition-colors ${
                    viewMode === mode
                      ? mode === "shared" ? "bg-purple-500/20 text-purple-300" : "bg-white/20 text-white"
                      : "text-white/50 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-colors shadow-lg"
            >
              <span className="text-lg leading-none">+</span> Add Transaction
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Income", value: formatCurrency(totalIncome), color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
            { label: "Total Expenses", value: `-$${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
            { label: "Net", value: formatCurrency(totalIncome - totalExpenses), color: totalIncome - totalExpenses >= 0 ? "text-green-400" : "text-red-400", bg: "bg-white/5 border-white/10" },
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

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
                filter === cat ? "bg-white/20 border-white/30 text-white" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
        >
          <div className="hidden md:grid grid-cols-[1fr_120px_100px_140px_110px_40px] gap-4 px-6 py-3 border-b border-white/10 text-white/40 text-xs uppercase tracking-wider">
            <span>Description</span>
            <span>Category</span>
            <span className="text-right">Amount</span>
            <span>Shared with</span>
            <span className="text-right">Date</span>
            <span></span>
          </div>

          <AnimatePresence mode="popLayout">
            {filtered.map((tx, i) => (
              <motion.div
                key={tx.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.03 }}
                className="grid grid-cols-1 md:grid-cols-[1fr_120px_100px_140px_110px_40px] gap-1 md:gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    tx.type === "INCOME" ? "bg-green-500/20" : tx.type === "TRANSFER" ? "bg-blue-500/20" : "bg-red-500/20"
                  }`}>
                    {tx.type === "INCOME" ? "↗" : tx.type === "TRANSFER" ? "↔" : "↙"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/90 text-sm font-medium">{tx.description}</span>
                    {tx.isSharedWithMe && tx.owner && (
                      <span className="text-purple-400/60 text-xs">from {tx.owner.name}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-white/40 text-xs bg-white/5 px-2 py-0.5 rounded-full border border-white/10">{tx.category}</span>
                </div>
                <div className="flex items-center justify-end">
                  <span className={`font-mono text-sm font-medium ${tx.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {formatCurrency(tx.amount)}
                  </span>
                </div>
                <div
                  className={`flex items-center gap-1 flex-wrap ${!tx.isSharedWithMe ? "cursor-pointer hover:opacity-80" : ""}`}
                  onClick={() => !tx.isSharedWithMe && openEditShare(tx)}
                  title={!tx.isSharedWithMe ? "Click to edit sharing" : undefined}
                >
                  {tx.sharedWith && tx.sharedWith.length > 0 ? (
                    tx.sharedWith.map((u) => (
                      <span key={u.id} className="text-xs bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20 truncate max-w-[120px]" title={u.email}>
                        {u.name?.split(" ")[0] || u.email}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/20 text-xs">{tx.isSharedWithMe ? "—" : "+ Share"}</span>
                  )}
                </div>
                <div className="flex items-center justify-end">
                  <span className="text-white/30 text-xs font-mono">{tx.date}</span>
                </div>
                <div className="flex items-center justify-center">
                  {!tx.isSharedWithMe && (
                    <button
                      onClick={() => handleDelete(tx.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-white/30 text-sm">
              {viewMode === "shared"
                ? "No shared transactions yet."
                : transactions.length === 0
                ? "No transactions yet. Add your first one!"
                : "No transactions in this category."}
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/90 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-white mb-6">Add Transaction</h3>
              <div className="flex flex-col gap-4">
                <input
                  value={newTx.description}
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  placeholder="Description"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 text-sm"
                />
                <input
                  value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: e.target.value })}
                  placeholder="Amount"
                  type="number"
                  step="0.01"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 text-sm font-mono"
                />
                <div className="flex gap-2">
                  {(["EXPENSE", "INCOME", "TRANSFER"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewTx({ ...newTx, type: t })}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
                        newTx.type === t ? "bg-white/20 border-white/30 text-white" : "bg-white/5 border-white/10 text-white/50"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <select
                  value={newTx.category}
                  onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/30 appearance-none"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c} className="bg-black text-white">{c}</option>
                  ))}
                </select>

                <div>
                  <p className="text-white/50 text-xs mb-2 uppercase tracking-wider">Share with contacts</p>
                  {contacts.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {contacts.map((c) => (
                        <button
                          key={c.user.id}
                          onClick={() => toggleSharedWith(c.user.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                            newTx.sharedWithIds.includes(c.user.id)
                              ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                              : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                          }`}
                        >
                          {c.user.avatarUrl ? (
                            <img src={c.user.avatarUrl} alt="" className="w-4 h-4 rounded-full" />
                          ) : (
                            <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px]">
                              {c.user.name?.[0] || "?"}
                            </span>
                          )}
                          {c.nickname || c.user.name?.split(" ")[0] || c.user.email}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/30 text-xs bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                      No contacts yet. Go to the <span className="text-purple-400">👥 Contacts</span> tab to invite people, then you can share transactions with them.
                    </p>
                  )}
                  {newTx.sharedWithIds.length > 0 && (
                    <p className="text-purple-400/70 text-xs mt-2">
                      ✓ This transaction will appear in {newTx.sharedWithIds.length} contact{newTx.sharedWithIds.length > 1 ? "s'" : "'s"} transactions
                    </p>
                  )}
                </div>

                <div className="flex gap-3 mt-2">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 bg-white/5 border border-white/10 text-white/60 py-3 rounded-full text-sm hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleAdd} className="flex-1 bg-white text-black py-3 rounded-full text-sm font-medium hover:bg-white/90 transition-colors">
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUpgrade && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setShowUpgrade(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/90 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl text-center"
            >
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-white mb-2">Daily Limit Reached</h3>
              <p className="text-white/50 text-sm mb-6">
                Free accounts are limited to 5 transactions per day. Upgrade to Trinit Pro for unlimited transactions, AI chat, and reports.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowUpgrade(false)} className="flex-1 bg-white/5 border border-white/10 text-white/60 py-3 rounded-full text-sm hover:bg-white/10 transition-colors">
                  Maybe Later
                </button>
                <button
                  onClick={async () => {
                    const res = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: "monthly" }) });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  }}
                  className="flex-1 bg-white text-black py-3 rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
                >
                  Upgrade — $8/mo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editShareTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setEditShareTx(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black/90 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-2">Edit Sharing</h3>
              <p className="text-white/40 text-sm mb-4">
                <span className="text-white/70">{editShareTx.description}</span> — {formatCurrency(editShareTx.amount)}
              </p>
              <p className="text-white/50 text-xs mb-3 uppercase tracking-wider">Select contacts to share with</p>
              {contacts.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-6">
                  {contacts.map((c) => (
                    <button
                      key={c.user.id}
                      onClick={() => setEditShareIds((prev) =>
                        prev.includes(c.user.id) ? prev.filter((id) => id !== c.user.id) : [...prev, c.user.id]
                      )}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                        editShareIds.includes(c.user.id)
                          ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                          : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                      }`}
                    >
                      {c.user.avatarUrl ? (
                        <img src={c.user.avatarUrl} alt="" className="w-4 h-4 rounded-full" />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px]">
                          {c.user.name?.[0] || "?"}
                        </span>
                      )}
                      {c.nickname || c.user.name?.split(" ")[0] || c.user.email}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-xs bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6">
                  No contacts yet. Go to <span className="text-purple-400">👥 Contacts</span> to add people first.
                </p>
              )}
              <div className="flex gap-3">
                <button onClick={() => setEditShareTx(null)} className="flex-1 bg-white/5 border border-white/10 text-white/60 py-3 rounded-full text-sm hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button onClick={handleUpdateShare} className="flex-1 bg-white text-black py-3 rounded-full text-sm font-medium hover:bg-white/90 transition-colors">
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
