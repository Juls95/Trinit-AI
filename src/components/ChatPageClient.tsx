"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSafeUser as useUser, SafeSignInButton as SignInButton, SafeUserButton as UserButton } from '@/lib/use-safe-clerk';
import ChatInterface from "@/components/ChatInterface";
import DashboardGrid from "@/components/DashboardGrid";
import TransactionsView from "@/components/TransactionsView";
import BudgetView from "@/components/BudgetView";
import ReportsView from "@/components/ReportsView";
import ContactsView from "@/components/ContactsView";
import SettingsView from "@/components/SettingsView";

export default function ChatPageClient() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [inviteHandled, setInviteHandled] = useState(false);

  React.useEffect(() => {
    if (!isSignedIn) return;
    const params = new URLSearchParams(window.location.search);

    const sessionId = params.get("session_id");
    if (params.get("payment") === "success" && sessionId) {
      fetch("/api/stripe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      }).then((res) => res.json())
        .then((data) => {
          if (data.isPaid) {
            setActiveTab("Settings");
          }
        })
        .catch(console.error)
        .finally(() => {
          window.history.replaceState({}, "", "/chat");
        });
      return;
    }

    if (!inviteHandled) {
      const inviteToken = params.get("invite");
      if (!inviteToken) return;
      setInviteHandled(true);
      fetch("/api/contacts/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: inviteToken }),
      }).then((res) => {
        if (res.ok) {
          setActiveTab("Contacts");
          window.history.replaceState({}, "", "/chat");
        }
      }).catch(console.error);
    }
  }, [isSignedIn, inviteHandled]);

  const navItems = [
    { name: "Dashboard", icon: "📊" },
    { name: "Transactions", icon: "💳" },
    { name: "Recurring", icon: "🔄" },
    { name: "Chat AI", icon: "🤖" },
    { name: "Budget", icon: "💰" },
    { name: "Reports", icon: "📋" },
    { name: "Contacts", icon: "👥" },
    { name: "Settings", icon: "⚙️" },
  ];

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-full bg-black items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white/60 text-lg font-sans"
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex h-screen w-full bg-black text-white overflow-hidden font-sans selection:bg-white/30">
        <div className="absolute inset-0 -z-20 bg-black">
          <video
            src="https://framerusercontent.com/assets/QvLulg0pZq1vK3tRI9hxALTpuw.mp4"
            autoPlay loop muted playsInline
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 pointer-events-none" />
        </div>
        <div className="flex-1 flex items-center justify-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-3xl shadow-2xl max-w-md"
          >
            <div className="text-5xl mb-6">🐸</div>
            <h2 className="text-3xl font-antonio text-white mb-3 uppercase">Welcome to Trinit</h2>
            <p className="text-white/60 mb-8">Sign in to start managing your finances with AI.</p>
            <SignInButton mode="modal">
              <button className="w-full bg-white text-black px-8 py-4 rounded-full hover:bg-white/90 transition-colors font-medium tracking-wider text-sm">
                Sign In to Continue
              </button>
            </SignInButton>
            <Link href="/" className="block mt-6 text-white/40 hover:text-white/70 text-sm transition-colors">
              ← Back to Home
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden font-sans selection:bg-white/30">
      <div className="absolute inset-0 -z-20 bg-black">
        <video
          src="https://framerusercontent.com/assets/QvLulg0pZq1vK3tRI9hxALTpuw.mp4"
          autoPlay loop muted playsInline
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90 pointer-events-none" />
      </div>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full border-r border-white/10 bg-white/5 backdrop-blur-xl flex flex-col flex-shrink-0 z-20"
          >
            <div className="p-6 flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img src="/trinit_logo.jpg" alt="Trinit" className="w-8 h-8 rounded-full object-cover" />
                <span className="font-semibold tracking-wide text-lg">Trinit</span>
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-1" style={{ scrollbarWidth: 'none' }}>
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-sm ${
                    activeTab === item.name
                      ? 'bg-white/20 text-white font-medium shadow-sm border border-white/10'
                      : 'text-white/60 hover:bg-white/10 hover:text-white border border-transparent'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-3 px-3 py-2 text-white/60 text-sm">
                <UserButton
                  appearance={{
                    elements: { avatarBox: "w-6 h-6" },
                  }}
                />
                <span className="truncate">{user?.primaryEmailAddress?.emailAddress}</span>
              </div>
              <Link href="/" className="flex items-center gap-3 px-3 py-2 text-white/60 hover:text-white text-sm transition-colors rounded-xl hover:bg-white/10">
                <span>🏠</span> Back to Home
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-full relative z-10">
        <div className="w-full p-4 flex items-center justify-between z-20 absolute top-0 left-0 pointer-events-none">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="text-white hover:opacity-70 transition-opacity p-2.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-lg pointer-events-auto"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-hidden pt-16">
          {activeTab === "Chat AI" ? (
            <div className="w-full h-full flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-3xl shadow-2xl max-w-md">
                <div className="text-5xl mb-6">🤖</div>
                <h2 className="text-2xl font-bold text-white mb-3">Coming Soon</h2>
                <p className="text-white/60 text-sm leading-relaxed mb-2">We&apos;re working hard on Trinit AI Chat — your personal finance assistant powered by AI.</p>
                <p className="text-white/40 text-xs mt-4 italic">— Att, Trinit Team</p>
              </motion.div>
            </div>
          ) : activeTab === "Dashboard" ? (
            <DashboardGrid />
          ) : activeTab === "Transactions" ? (
            <TransactionsView />
          ) : activeTab === "Budget" ? (
            <BudgetView />
          ) : activeTab === "Reports" ? (
            <ReportsView />
          ) : activeTab === "Contacts" ? (
            <ContactsView />
          ) : activeTab === "Settings" ? (
            <SettingsView />
          ) : activeTab === "Recurring" ? (
            <div className="w-full h-full flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-3xl shadow-2xl max-w-md">
                <div className="text-5xl mb-6">🔄</div>
                <h2 className="text-2xl font-bold text-white mb-3">Coming Soon</h2>
                <p className="text-white/60 text-sm leading-relaxed mb-2">We&apos;re working hard on Recurring Transactions — automatic tracking for your recurring bills and subscriptions.</p>
                <p className="text-white/40 text-xs mt-4 italic">— Att, Trinit Team</p>
              </motion.div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl">
                <h2 className="text-3xl font-antonio text-white mb-2 uppercase">{activeTab}</h2>
                <p className="text-white/50">Coming soon</p>
                <button
                  onClick={() => setActiveTab("Chat AI")}
                  className="mt-6 bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full border border-white/10 text-sm transition-colors"
                >
                  Ask Trinit about this
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
