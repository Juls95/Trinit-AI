"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ContactUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface Contact {
  id: string;
  nickname: string | null;
  user: ContactUser;
}

interface ReceivedInvitation {
  id: string;
  token: string;
  sender: ContactUser;
  createdAt: string;
}

interface PendingInvitation {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

export default function ContactsView() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [receivedInvitations, setReceivedInvitations] = useState<ReceivedInvitation[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch("/api/contacts");
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts || []);
        setPendingInvitations(data.pendingInvitations || []);
        setReceivedInvitations(data.receivedInvitations || []);
      }
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleInvite = async () => {
    if (!email.trim()) return;
    setSending(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send invitation");
      } else {
        setSuccess(data.message || "Done!");
        setEmail("");
        fetchContacts();
      }
    } catch {
      setError("Network error");
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async (token: string) => {
    try {
      const res = await fetch("/api/contacts/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        fetchContacts();
      }
    } catch (err) {
      console.error("Failed to accept invitation:", err);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-white/60 text-lg">
          Loading contacts...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-6 md:p-10 relative" style={{ scrollbarWidth: "none" }}>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-white tracking-wide mb-1">Contacts</h1>
          <p className="text-white/50 text-sm mb-8">Invite people to share transactions with</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8"
        >
          <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Invite by email</p>
          <div className="flex gap-3">
            <input
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); setSuccess(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              placeholder="friend@email.com"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 text-sm"
            />
            <button
              onClick={handleInvite}
              disabled={sending || !email.trim()}
              className="bg-white text-black px-6 py-3 rounded-xl text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? "..." : "Invite"}
            </button>
          </div>
          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-400 text-xs mt-2">{error}</motion.p>
            )}
            {success && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-green-400 text-xs mt-2">{success}</motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {receivedInvitations.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Pending invitations for you</p>
            <div className="flex flex-col gap-2">
              {receivedInvitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    {inv.sender.avatarUrl ? (
                      <img src={inv.sender.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-sm text-purple-300">
                        {inv.sender.name?.[0] || "?"}
                      </span>
                    )}
                    <div>
                      <p className="text-white text-sm font-medium">{inv.sender.name}</p>
                      <p className="text-white/40 text-xs">{inv.sender.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAccept(inv.token)}
                    className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-medium hover:bg-white/90 transition-colors"
                  >
                    Accept
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Your contacts ({contacts.length})</p>
          {contacts.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
              <p className="text-white/30 text-sm">No contacts yet. Invite someone above!</p>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
              {contacts.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-5 py-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors"
                >
                  {c.user.avatarUrl ? (
                    <img src={c.user.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 font-medium">
                      {c.user.name?.[0] || "?"}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{c.user.name}</p>
                    <p className="text-white/40 text-xs truncate">{c.user.email}</p>
                  </div>
                  <span className="text-green-400/60 text-xs bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Connected</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {pendingInvitations.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-8">
            <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Sent invitations (pending)</p>
            <div className="flex flex-col gap-2">
              {pendingInvitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <span className="text-white/60 text-sm">{inv.email}</span>
                  <span className="text-yellow-400/60 text-xs bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">Pending</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
