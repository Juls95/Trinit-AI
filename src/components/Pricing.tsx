"use client";
import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const plans = [
  {
    name: "Monthly",
    price: "$8",
    period: "/mo",
    description: "Full access, cancel anytime",
    priceId: "monthly",
    popular: false,
  },
  {
    name: "Annual",
    price: "$80",
    period: "/yr",
    description: "Save $16 — best value",
    priceId: "annual",
    popular: true,
  },
  {
    name: "Founding Member",
    price: "$199",
    period: " lifetime",
    description: "One-time payment, forever access",
    priceId: "lifetime",
    popular: false,
  },
];

export default function Pricing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  const handleCheckout = async (priceId: string) => {
    setLoading(priceId);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <section
      id="pricing"
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden bg-black flex items-center justify-center selection:bg-white/30 py-20"
    >
      <motion.div
        initial={{ opacity: 0, scale: 1.1 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 w-full h-full -z-10"
      >
        <motion.div
          style={{ y }}
          className="absolute inset-0 w-full h-[130%] -top-[15%]"
        >
          <video
            src="https://framerusercontent.com/assets/8s2BBmflDJt5OXnAkNfeLkErqw.mp4"
            autoPlay loop muted playsInline
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80 pointer-events-none" />
        </motion.div>
      </motion.div>

      <div className="z-10 flex flex-col items-center gap-10 px-6 w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-white/80 text-xs uppercase tracking-wider mb-6 inline-block">
            Simple pricing
          </div>
          <h2
            className="font-antonio text-white uppercase"
            style={{ fontSize: 'clamp(40px, 8vw, 90px)', letterSpacing: '-0.04em', lineHeight: '1' }}
          >
            Choose your plan
          </h2>
          <p className="text-white/60 mt-4 text-lg max-w-md mx-auto">
            Free tier includes 5 transactions/day. Upgrade for unlimited transactions, AI chat, and reports.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className={`relative bg-white/5 backdrop-blur-xl border rounded-3xl p-8 flex flex-col items-center text-center ${
                plan.popular ? "border-white/30 scale-105 shadow-2xl" : "border-white/10"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 bg-white text-black text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <h3 className="text-white/60 text-sm uppercase tracking-wider mb-4">{plan.name}</h3>
              <div className="mb-4">
                <span className="font-antonio text-white text-5xl">{plan.price}</span>
                <span className="text-white/40 text-lg">{plan.period}</span>
              </div>
              <p className="text-white/50 text-sm mb-8">{plan.description}</p>
              <ul className="text-white/70 text-sm space-y-2 mb-8 w-full text-left">
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Unlimited transactions</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Trinit AI chat</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Financial reports</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Shared transactions</li>
                <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Budget tracking</li>
              </ul>
              <button
                onClick={() => handleCheckout(plan.priceId)}
                disabled={loading === plan.priceId}
                className={`w-full py-3 rounded-full text-sm font-medium transition-colors ${
                  plan.popular
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                } disabled:opacity-50`}
              >
                {loading === plan.priceId ? "Redirecting..." : "Get Started"}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
