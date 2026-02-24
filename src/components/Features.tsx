"use client";
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const featuresData = [
  {
    id: 1,
    title: "Net Worth",
    meta: "All your accounts, in one place",
    description: "Connect all your bank accounts, credit cards, loans, real estate, and investments to see your entire financial picture in one place. When you and your partner both sync your accounts, you'll get a shared view of your finances—making it easier to stay aligned and plan together.",
    videoSrc: "https://framerusercontent.com/assets/dRHWzVptVvpgdXINm46ZLtoiwoY.mp4"
  },
  {
    id: 2,
    title: "Transactions",
    meta: "Every transaction in one list",
    description: "Trinit brings all your transactions into one clean, searchable list—no more jumping between apps or bank websites. You can mark transactions as reviewed to stay on top of your spending and quickly spot anything unexpected.",
    videoSrc: "https://framerusercontent.com/assets/z4Oilzyk8mFMgNgJGrjfmEBBNE.mp4"
  },
  {
    id: 3,
    title: "Recurring",
    meta: "Take control of your subscriptions",
    description: "Trinit automatically detects your recurring subscriptions—like streaming services, gyms, or app memberships—so you never lose track of what you're paying for. It's an easy way to spot forgotten charges and take control of your monthly spending.",
    videoSrc: "https://framerusercontent.com/assets/Qd3Ic7sGavLSLs8uRt69vDA9tTc.mp4"
  },
  {
    id: 4,
    title: "Budget",
    meta: "Budgeting that fits your life",
    description: "Create a budget that flexes to your needs - and not the other way around - so you can stay focused on the things that matter most.",
    videoSrc: "https://framerusercontent.com/assets/rujes19qnH473SeNzCgMuihBfOs.mp4"
  },
  {
    id: 5,
    title: "Reports",
    meta: "Visualize the flow of money",
    description: "Dive deep into your finances with customizable charts that reveal where your money's going. Whether you're tracking spending trends, income, or net worth over time, reports help you turn raw data into insights you can act on.",
    videoSrc: "https://framerusercontent.com/assets/8s2BBmflDJt5OXnAkNfeLkErqw.mp4"
  },
  {
    id: 6,
    title: "Goals",
    meta: "Your goals, on track",
    description: "Create a clear plan to save for what matters—whether it's a home, a vacation, or a rainy day fund. Set targets, track your progress, and stay motivated as you watch your savings grow over time.",
    videoSrc: "https://framerusercontent.com/assets/HSdtyJ3OPhdFnShRKCkpEs238.mp4"
  }
];

const NetWorthGraphic = () => (
  <motion.div
    initial={{ opacity: 0, y: 50, rotateX: 15 }}
    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
    viewport={{ once: false, amount: 0.5 }}
    transition={{ duration: 1.2, delay: 0.2, type: "spring", bounce: 0.4 }}
    style={{ transformPerspective: 1000 }}
    className="w-full md:w-[450px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group"
  >
    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    <div className="flex justify-between items-center mb-6">
      <div className="text-white/60 text-sm font-sans uppercase tracking-wider">Total Net Worth</div>
      <div className="text-green-400 text-sm font-mono bg-green-400/10 px-3 py-1 rounded-full">+12.5%</div>
    </div>
    <div className="text-5xl md:text-6xl font-antonio text-white mb-8 tracking-wide">$1,248,590</div>
    <svg viewBox="0 0 100 40" className="w-full h-24 overflow-visible drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
      <motion.path
        d="M 0 40 C 15 35, 25 10, 45 15 C 65 20, 75 5, 100 0"
        fill="transparent"
        stroke="url(#nw-line-gradient)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 1.8, ease: "easeInOut", delay: 0.4 }}
      />
      <defs>
        <linearGradient id="nw-line-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.8)" />
          <stop offset="100%" stopColor="rgba(255,255,255,1)" />
        </linearGradient>
      </defs>
    </svg>
  </motion.div>
);

const TransactionsGraphic = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: false, amount: 0.5 }}
    transition={{ duration: 1, delay: 0.1, type: "spring" }}
    className="w-full md:w-[450px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col gap-6"
  >
    <div className="text-white/60 text-sm font-sans uppercase tracking-wider mb-2">Recent Transactions</div>
    {[
      { merchant: "Apple Store", date: "Today", amount: "-$1,299.00", icon: "🍏", positive: false },
      { merchant: "Whole Foods", date: "Yesterday", amount: "-$142.50", icon: "🥑", positive: false },
      { merchant: "Salary Deposit", date: "Oct 15", amount: "+$4,250.00", icon: "💼", positive: true },
      { merchant: "Uber", date: "Oct 14", amount: "-$24.90", icon: "🚗", positive: false },
    ].map((tx, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.6, delay: 0.3 + (i * 0.15) }}
        className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">{tx.icon}</div>
          <div className="flex flex-col">
            <span className="text-white/90 text-sm font-medium">{tx.merchant}</span>
            <span className="text-white/50 text-xs">{tx.date}</span>
          </div>
        </div>
        <div className={`font-mono text-sm ${tx.positive ? 'text-green-400' : 'text-white/90'}`}>
          {tx.amount}
        </div>
      </motion.div>
    ))}
  </motion.div>
);

const RecurringGraphic = () => (
  <motion.div
    initial={{ opacity: 0, rotateY: -15 }}
    whileInView={{ opacity: 1, rotateY: 0 }}
    viewport={{ once: false, amount: 0.5 }}
    transition={{ duration: 1.2, delay: 0.2, type: "spring" }}
    style={{ transformPerspective: 1000 }}
    className="w-full md:w-[450px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col gap-6"
  >
    <div className="flex justify-between items-center">
      <div className="text-white/60 text-sm font-sans uppercase tracking-wider">Upcoming Bills</div>
      <div className="text-white/80 text-xs font-mono bg-white/10 px-2 py-1 rounded">3 Due Soon</div>
    </div>
    <div className="flex flex-col gap-4 mt-2">
      {[
        { name: "Netflix", amount: "$15.49", due: "Tomorrow", color: "bg-red-500" },
        { name: "Equinox Gym", amount: "$220.00", due: "In 3 days", color: "bg-white" },
        { name: "Spotify", amount: "$10.99", due: "In 5 days", color: "bg-green-500" }
      ].map((sub, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.5, delay: 0.4 + (i * 0.1) }}
          className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center"
        >
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${sub.color} shadow-[0_0_10px_currentColor] opacity-80`} />
            <div className="flex flex-col">
              <span className="text-white font-medium text-sm">{sub.name}</span>
              <span className="text-white/50 text-xs mt-0.5">Due {sub.due}</span>
            </div>
          </div>
          <span className="text-white/90 font-mono text-sm">{sub.amount}</span>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const BudgetGraphic = () => (
  <motion.div
    initial={{ opacity: 0, x: 50 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: false, amount: 0.5 }}
    transition={{ duration: 1.2, delay: 0.2, type: "spring", bounce: 0.3 }}
    className="w-full md:w-[450px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col gap-8"
  >
    <div className="flex justify-between items-center">
      <div className="text-white/60 text-sm font-sans uppercase tracking-wider">Monthly Budget</div>
      <div className="text-white/80 text-sm font-mono font-medium">$2,070 Spent</div>
    </div>
    <div className="flex flex-col gap-6">
      {[
        { label: "Housing", spent: 1500, total: 1500, color: "bg-white" },
        { label: "Food & Dining", spent: 450, total: 600, color: "bg-white/70" },
        { label: "Entertainment", spent: 120, total: 200, color: "bg-white/40" },
      ].map((item, i) => (
        <div key={item.label} className="flex flex-col gap-3">
          <div className="flex justify-between text-sm font-sans tracking-wide">
            <span className="text-white/90">{item.label}</span>
            <span className="text-white/50 font-mono">${item.spent} <span className="text-white/30">/ ${item.total}</span></span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${item.color} rounded-full`}
              initial={{ width: 0 }}
              whileInView={{ width: `${(item.spent / item.total) * 100}%` }}
              viewport={{ once: false }}
              transition={{ duration: 1.2, delay: 0.5 + (i * 0.2), ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

const ReportsGraphic = () => (
  <motion.div
    initial={{ opacity: 0, y: -40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: false, amount: 0.5 }}
    transition={{ duration: 1, delay: 0.2, type: "spring" }}
    className="w-full md:w-[450px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col gap-6"
  >
    <div className="text-white/60 text-sm font-sans uppercase tracking-wider">Cash Flow</div>
    <div className="h-48 w-full flex items-end justify-between gap-4 mt-4 border-b border-white/10 pb-4">
      {[
        { month: "Jul", height: "40%" },
        { month: "Aug", height: "65%" },
        { month: "Sep", height: "45%" },
        { month: "Oct", height: "90%" },
        { month: "Nov", height: "75%" }
      ].map((bar, i) => (
        <div key={i} className="flex flex-col items-center justify-end gap-3 flex-1 h-full">
          <motion.div
            className="w-full bg-white/80 rounded-t-sm"
            initial={{ height: "0%" }}
            whileInView={{ height: bar.height }}
            viewport={{ once: false }}
            transition={{ duration: 1, delay: 0.4 + (i * 0.1), type: "spring", bounce: 0.2 }}
          />
          <span className="text-white/50 text-xs font-mono">{bar.month}</span>
        </div>
      ))}
    </div>
  </motion.div>
);

const GoalsGraphic = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: false, amount: 0.5 }}
    transition={{ duration: 1, delay: 0.2, type: "spring" }}
    className="w-full md:w-[450px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center gap-2 relative"
  >
    <div className="absolute top-8 left-8 text-white/60 text-sm font-sans uppercase tracking-wider">Savings Goal</div>
    <div className="relative w-48 h-48 mt-8 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
        <circle cx="96" cy="96" r="80" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
        <motion.circle
          cx="96" cy="96" r="80"
          fill="transparent"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray="502"
          initial={{ strokeDashoffset: 502 }}
          whileInView={{ strokeDashoffset: 502 - (502 * 0.75) }}
          viewport={{ once: false }}
          transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className="text-4xl font-antonio text-white">75%</span>
        <span className="text-white/50 text-xs font-mono mt-1">Funded</span>
      </div>
    </div>
    <div className="mt-6 text-center">
      <div className="text-white/90 font-medium text-lg">House Downpayment</div>
      <div className="text-white/50 text-sm font-mono mt-1">$45,000 / $60,000</div>
    </div>
  </motion.div>
);

function FeatureCard({ feature }: { feature: typeof featuresData[0] }) {
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
            src={feature.videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black/80 pointer-events-none" />
        </motion.div>
      </motion.div>

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
            {feature.title}
          </h2>
          <h3 className="font-sans text-white/90 text-lg md:text-2xl tracking-wide uppercase font-medium max-w-md">
            {feature.meta}
          </h3>
          <p className="font-sans text-white/70 text-sm md:text-base leading-relaxed mt-2 max-w-md">
            {feature.description}
          </p>
        </motion.div>

        <div className="w-full md:w-1/2 flex justify-center md:justify-end perspective-[1000px]">
          {feature.title === "Net Worth" && <NetWorthGraphic />}
          {feature.title === "Transactions" && <TransactionsGraphic />}
          {feature.title === "Recurring" && <RecurringGraphic />}
          {feature.title === "Budget" && <BudgetGraphic />}
          {feature.title === "Reports" && <ReportsGraphic />}
          {feature.title === "Goals" && <GoalsGraphic />}
        </div>
      </div>
    </section>
  );
}

export default function Features() {
  return (
    <div id="features" className="w-full flex flex-col">
      {featuresData.map((feature) => (
        <FeatureCard key={feature.id} feature={feature} />
      ))}
    </div>
  );
}
