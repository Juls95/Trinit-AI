"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface BillingInfo {
  isPaid: boolean;
  plan: string | null;
  priceAmount: number | null;
  billingPeriodEnd: string | null;
  hasSubscription: boolean;
  email: string;
}

const PLAN_LABELS: Record<string, string> = {
  monthly: "Monthly",
  annual: "Annual",
  lifetime: "Founding Member (Lifetime)",
};

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function SettingsView() {
  const [billing, setBilling] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [message, setMessage] = useState("");

  const fetchBilling = useCallback(async () => {
    try {
      const res = await fetch("/api/billing");
      if (res.ok) {
        setBilling(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch billing:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBilling();
  }, [fetchBilling]);

  const handleCancel = async () => {
    setCancelling(true);
    setMessage("");
    try {
      const res = await fetch("/api/billing", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setCancelConfirm(false);
        fetchBilling();
      } else {
        setMessage(data.error || "Failed to cancel");
      }
    } catch {
      setMessage("Network error");
    } finally {
      setCancelling(false);
    }
  };

  const handleUpgrade = async (plan: string) => {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-white/60 text-lg">
          Loading settings...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-10 relative" style={{ scrollbarWidth: "none" }}>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-white tracking-wide mb-1">Settings</h1>
          <p className="text-white/50 text-sm mb-8">Manage your account and billing</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Account</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-lg font-medium">
              {billing?.email?.[0]?.toUpperCase() || "?"}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{billing?.email}</p>
              <p className="text-white/40 text-xs">
                {billing?.isPaid ? (
                  <span className="text-green-400">Pro Member</span>
                ) : (
                  <span className="text-white/40">Free Plan</span>
                )}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Billing & Subscription</h2>

          {billing?.isPaid ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/40 text-xs mb-1">Plan</p>
                  <p className="text-white font-medium text-sm">{PLAN_LABELS[billing.plan || ""] || billing.plan || "Pro"}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/40 text-xs mb-1">Price</p>
                  <p className="text-white font-medium text-sm font-mono">
                    {billing.priceAmount ? formatPrice(billing.priceAmount) : "—"}
                    {billing.plan === "monthly" && "/mo"}
                    {billing.plan === "annual" && "/yr"}
                    {billing.plan === "lifetime" && " (one-time)"}
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/40 text-xs mb-1">Status</p>
                  <p className="text-green-400 font-medium text-sm">Active</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/40 text-xs mb-1">
                    {billing.plan === "lifetime" ? "Access" : "Next billing date"}
                  </p>
                  <p className="text-white font-medium text-sm font-mono">
                    {billing.plan === "lifetime"
                      ? "Forever"
                      : billing.billingPeriodEnd
                      ? new Date(billing.billingPeriodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                      : "—"}
                  </p>
                </div>
              </div>

              {billing.hasSubscription && billing.plan !== "lifetime" && (
                <div className="pt-4 border-t border-white/10">
                  {!cancelConfirm ? (
                    <button
                      onClick={() => setCancelConfirm(true)}
                      className="text-red-400/60 hover:text-red-400 text-sm transition-colors"
                    >
                      Cancel subscription
                    </button>
                  ) : (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <p className="text-white text-sm mb-3">Are you sure? Your subscription will remain active until the end of the current billing period.</p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setCancelConfirm(false)}
                          className="flex-1 bg-white/5 border border-white/10 text-white/60 py-2 rounded-full text-sm hover:bg-white/10 transition-colors"
                        >
                          Keep subscription
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={cancelling}
                          className="flex-1 bg-red-500/20 border border-red-500/30 text-red-400 py-2 rounded-full text-sm hover:bg-red-500/30 transition-colors disabled:opacity-50"
                        >
                          {cancelling ? "Cancelling..." : "Yes, cancel"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {message && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 text-xs mt-2">
                  {message}
                </motion.p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <p className="text-white/40 text-xs mb-1">Current Plan</p>
                <p className="text-white font-medium text-sm">Free</p>
                <p className="text-white/40 text-xs mt-1">5 transactions/day • No AI Chat • No Reports</p>
              </div>

              <p className="text-white/50 text-xs uppercase tracking-wider mt-4">Upgrade to Pro</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { plan: "monthly", label: "Monthly", price: "$8/mo" },
                  { plan: "annual", label: "Annual", price: "$80/yr" },
                  { plan: "lifetime", label: "Lifetime", price: "$199" },
                ].map((p) => (
                  <button
                    key={p.plan}
                    onClick={() => handleUpgrade(p.plan)}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl p-4 text-left transition-colors group"
                  >
                    <p className="text-white text-sm font-medium group-hover:text-white">{p.label}</p>
                    <p className="text-white/60 text-lg font-mono font-bold mt-1">{p.price}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Free Plan Limits</h2>
          <div className="space-y-3">
            {[
              { feature: "Transactions", free: "5 per day", pro: "Unlimited" },
              { feature: "AI Chat", free: "Locked", pro: "Full access" },
              { feature: "Reports", free: "Locked", pro: "Full access" },
              { feature: "Budget Tracking", free: "✓", pro: "✓" },
              { feature: "Shared Transactions", free: "✓", pro: "✓" },
              { feature: "Contacts", free: "✓", pro: "✓" },
            ].map((row) => (
              <div key={row.feature} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-white/70 text-sm">{row.feature}</span>
                <div className="flex gap-6">
                  <span className="text-white/30 text-xs w-20 text-right">{row.free}</span>
                  <span className="text-green-400/70 text-xs w-20 text-right">{row.pro}</span>
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-6 pt-1">
              <span className="text-white/20 text-[10px] uppercase w-20 text-right">Free</span>
              <span className="text-green-400/40 text-[10px] uppercase w-20 text-right">Pro</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
