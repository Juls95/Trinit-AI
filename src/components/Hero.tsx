"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSafeUser as useUser, SafeSignInButton as SignInButton, SafeUserButton as UserButton } from '@/lib/use-safe-clerk';

const FloatingNetWorth = () => (
  <motion.div
    initial={{ y: 0, opacity: 0 }}
    animate={{ y: [-15, 15, -15], opacity: [0.3, 0.7, 0.3] }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    className="absolute top-[15%] left-[5%] md:left-[10%] w-64 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl hidden md:block z-0"
  >
    <div className="text-white/50 text-xs uppercase mb-1">Net Worth</div>
    <div className="text-white text-2xl font-antonio">$1,248,590</div>
    <div className="mt-3 w-full h-1 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        animate={{ width: ["10%", "100%", "10%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="h-full bg-green-400"
      />
    </div>
  </motion.div>
);

const FloatingTransactions = () => (
  <motion.div
    initial={{ y: 0, opacity: 0 }}
    animate={{ y: [15, -15, 15], opacity: [0.2, 0.6, 0.2] }}
    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    className="absolute bottom-[20%] right-[5%] md:right-[15%] w-72 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl hidden md:block z-0"
  >
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">🍏</div>
        <div className="text-white/80 text-sm">Apple Store</div>
      </div>
      <div className="text-white font-mono text-sm">-$1,299</div>
    </div>
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">💼</div>
        <div className="text-white/80 text-sm">Salary</div>
      </div>
      <div className="text-green-400 font-mono text-sm">+$4,250</div>
    </div>
  </motion.div>
);

const FloatingBudget = () => (
  <motion.div
    initial={{ y: 0, opacity: 0 }}
    animate={{ y: [-10, 20, -10], opacity: [0.3, 0.8, 0.3] }}
    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
    className="absolute top-[25%] right-[10%] md:right-[5%] w-56 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl hidden lg:block z-0"
  >
    <div className="text-white/50 text-xs uppercase mb-2">Food & Dining</div>
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        animate={{ width: ["20%", "80%", "20%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="h-full bg-white/80"
      />
    </div>
    <div className="flex justify-between mt-2 text-xs font-mono">
      <span className="text-white/80">$450</span>
      <span className="text-white/40">$600</span>
    </div>
  </motion.div>
);

const FloatingGoal = () => (
  <motion.div
    initial={{ y: 0, opacity: 0 }}
    animate={{ y: [20, -10, 20], opacity: [0.2, 0.6, 0.2] }}
    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}
    className="absolute bottom-[25%] left-[10%] md:left-[5%] w-48 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl flex flex-col items-center hidden lg:flex z-0"
  >
    <div className="relative w-16 h-16 mb-2">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
        <motion.circle
          cx="32" cy="32" r="28"
          fill="transparent"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="4"
          strokeDasharray="176"
          animate={{ strokeDashoffset: [176, 44, 176] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
    <div className="text-white/80 text-xs uppercase text-center">House Fund</div>
  </motion.div>
);

export default function Hero() {
  const { isSignedIn, isLoaded } = useUser();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col justify-between p-6 md:p-8 selection:bg-white/30">
      <div className="absolute inset-0 -z-20 bg-black">
        <video
          src="https://framerusercontent.com/assets/QvLulg0pZq1vK3tRI9hxALTpuw.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80 pointer-events-none" />
      </div>

      <FloatingNetWorth />
      <FloatingTransactions />
      <FloatingBudget />
      <FloatingGoal />

      <nav className="flex justify-between items-center text-[12px] md:text-sm tracking-wide z-10 relative">
        <Link href="/" className="uppercase hover:opacity-70 transition-opacity font-medium text-white flex items-center gap-2">
          <img src="/trinit_logo.jpg" alt="Trinit" className="w-6 h-6 rounded-full object-cover" />
          Trinit
        </Link>

        <div className="hidden md:flex items-center gap-12 uppercase text-white/90">
          <a href="#features" className="hover:opacity-70 transition-opacity">Features</a>
          <a href="#pricing" className="hover:opacity-70 transition-opacity">Pricing</a>
          <Link href="/chat" className="hover:opacity-70 transition-opacity">Chat</Link>
          {isSignedIn && <Link href="/chat" className="hover:opacity-70 transition-opacity">Dashboard</Link>}
        </div>

        <div className="flex items-center gap-6">
          {!mounted || !isLoaded ? (
            <div className="w-16 h-8 bg-white/10 rounded-full animate-pulse" />
          ) : isSignedIn ? (
            <>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
              />
              <Link href="/chat" className="uppercase bg-white text-black px-4 py-2 rounded-full hover:bg-white/80 transition-colors font-medium">
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="uppercase text-white hover:opacity-70 transition-opacity font-medium hidden md:block">
                  Log In
                </button>
              </SignInButton>
              <Link href="/chat" className="uppercase bg-white text-black px-4 py-2 rounded-full hover:bg-white/80 transition-colors font-medium">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center z-10 gap-6 pointer-events-none relative">
        <h1
          className="font-antonio font-medium text-white uppercase text-center drop-shadow-2xl"
          style={{
            fontSize: 'clamp(50px, 10vw, 150px)',
            letterSpacing: '-0.04em',
            lineHeight: '1'
          }}
        >
          Trinit
        </h1>
        <p className="text-white/80 text-lg md:text-xl font-sans max-w-lg text-center tracking-wide drop-shadow-lg">
          The modern way to track your net worth, manage budgets, and achieve financial peace.
        </p>
      </main>

      <footer className="flex flex-col md:flex-row justify-between items-center text-[12px] md:text-sm text-white/90 z-10 gap-4 md:gap-0 relative">
        <div className="uppercase tracking-wide">
          Personal Finance Platform
        </div>
        <div className="hidden md:block uppercase tracking-wide">
          Secure & Private
        </div>
        <div className="flex items-center gap-6 uppercase tracking-wide">
          <span>{new Date().toLocaleTimeString()}</span>
          <span>© Trinit {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
