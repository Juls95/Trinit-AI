"use client";
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';

const FloatingChatBubble = () => (
  <motion.div
    initial={{ y: 0, opacity: 0 }}
    animate={{ y: [-12, 12, -12], opacity: [0.3, 0.7, 0.3] }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    className="absolute top-[15%] left-[5%] md:left-[8%] w-72 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl hidden md:block z-0"
  >
    <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-sm">🤖</div>
      <div className="flex flex-col">
        <span className="text-white text-sm font-medium">Trinit AI</span>
        <span className="text-white/50 text-xs">Finance Agent</span>
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <div className="bg-white/5 rounded-lg p-3 text-white/70 text-xs">
        I noticed you spent $340 on dining this week. That&apos;s 15% over your budget. Want me to suggest adjustments?
      </div>
      <div className="bg-white/10 rounded-lg p-3 text-white/90 text-xs self-end max-w-[80%]">
        Yes, show me where I can cut back
      </div>
    </div>
  </motion.div>
);

const FloatingInsight = () => (
  <motion.div
    initial={{ y: 0, opacity: 0 }}
    animate={{ y: [15, -15, 15], opacity: [0.2, 0.6, 0.2] }}
    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    className="absolute bottom-[20%] right-[5%] md:right-[8%] w-64 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl hidden md:block z-0"
  >
    <div className="text-white/50 text-xs uppercase mb-2">AI Insight</div>
    <div className="text-white text-lg font-antonio mb-1">Save $420/mo</div>
    <div className="text-white/60 text-xs">Based on your spending patterns, I found 3 subscriptions you rarely use.</div>
    <div className="mt-3 flex gap-2">
      <div className="bg-red-500/20 border border-red-500/30 px-2 py-1 rounded-full text-red-400 text-[10px]">Netflix</div>
      <div className="bg-red-500/20 border border-red-500/30 px-2 py-1 rounded-full text-red-400 text-[10px]">HBO</div>
      <div className="bg-red-500/20 border border-red-500/30 px-2 py-1 rounded-full text-red-400 text-[10px]">Gym</div>
    </div>
  </motion.div>
);

const FloatingPortfolio = () => (
  <motion.div
    initial={{ y: 0, opacity: 0 }}
    animate={{ y: [-10, 20, -10], opacity: [0.3, 0.8, 0.3] }}
    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
    className="absolute top-[25%] right-[10%] md:right-[5%] w-56 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl hidden lg:block z-0"
  >
    <div className="text-white/50 text-xs uppercase mb-2">Portfolio Analysis</div>
    <div className="flex items-center gap-2 mb-2">
      <div className="text-green-400 text-sm font-mono">+8.3%</div>
      <div className="text-white/40 text-xs">vs market avg</div>
    </div>
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        animate={{ width: ["30%", "75%", "30%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="h-full bg-green-400/80"
      />
    </div>
  </motion.div>
);

export default function ChatPromo() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-black flex items-center justify-center selection:bg-white/30"
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
            src="https://framerusercontent.com/assets/z4Oilzyk8mFMgNgJGrjfmEBBNE.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black/80 pointer-events-none" />
        </motion.div>
      </motion.div>

      <FloatingChatBubble />
      <FloatingInsight />
      <FloatingPortfolio />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-16 md:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="flex flex-col gap-4 md:w-1/2 items-start text-left"
        >
          <h2
            className="font-antonio text-white uppercase"
            style={{
              fontSize: 'clamp(50px, 6vw, 100px)',
              letterSpacing: '-0.04em',
              lineHeight: '1'
            }}
          >
            Meet Trinit
          </h2>
          <h3 className="font-sans text-white/90 text-lg md:text-2xl tracking-wide uppercase font-medium max-w-md">
            Your AI Personal Finance Agent
          </h3>
          <p className="font-sans text-white/70 text-sm md:text-base leading-relaxed mt-2 max-w-md">
            Chat naturally about your finances. Trinit analyzes your spending, tracks expenses, monitors investments, and gives you personalized advice — all through a simple conversation. No spreadsheets, no complexity.
          </p>
          <div className="flex gap-4 mt-6 pointer-events-auto">
            <Link
              href="/chat"
              className="uppercase bg-white text-black px-8 py-4 rounded-full hover:bg-white/80 transition-colors font-medium tracking-wider text-sm"
            >
              Try Trinit Free
            </Link>
            <a
              href="#features"
              className="uppercase bg-white/10 text-white px-8 py-4 rounded-full hover:bg-white/20 transition-colors font-medium tracking-wider text-sm border border-white/20"
            >
              See Features
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 1, delay: 0.3, type: "spring" }}
          className="w-full md:w-1/2 flex justify-center md:justify-end"
        >
          <div className="w-full md:w-[420px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-4xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">🐸</div>
              <div>
                <div className="text-white font-bold text-lg">Trinit</div>
                <div className="text-white/50 text-xs">AI Finance Agent • Online</div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white/5 rounded-2xl rounded-tl-sm p-4 max-w-[85%]"
              >
                <p className="text-white/80 text-sm">Hi! I&apos;m Trinit 👋 I can help you track expenses, analyze spending, and reach your financial goals. What would you like to do?</p>
              </motion.div>

              {[
                "Track my daily expenses",
                "Analyze my portfolio vs competitors",
                "Create a savings goal",
                "Show me spending insights"
              ].map((text, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.4, delay: 0.7 + (i * 0.1) }}
                  className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-3 rounded-2xl flex justify-between items-center transition-all cursor-pointer group"
                >
                  <span className="text-white/90 text-sm">{text}</span>
                  <span className="text-white/40 group-hover:text-white transition-colors">→</span>
                </motion.div>
              ))}
            </div>

            <div className="mt-2 relative">
              <div className="w-full bg-black/40 border-2 border-white/20 rounded-full pl-5 pr-14 py-3 text-white/40 text-sm">
                Ask Trinit anything about your finances...
              </div>
              <div className="absolute right-2 top-1.5 bottom-1.5 aspect-square bg-white text-black rounded-full flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="transform -rotate-45 ml-0.5">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
