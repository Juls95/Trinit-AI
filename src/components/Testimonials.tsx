"use client";
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Testimonials() {
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
            src="https://framerusercontent.com/assets/HSdtyJ3OPhdFnShRKCkpEs238.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80 pointer-events-none" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="text-center z-10 flex flex-col items-center gap-8 px-6 max-w-4xl"
      >
        <h2 className="font-antonio text-white uppercase text-3xl md:text-5xl lg:text-6xl tracking-wide leading-tight">
          &ldquo;Mint shutting down was a blessing in disguise. Trinit is way better and extremely reliable. I feel more in control of my finances.&rdquo;
        </h2>
        <p className="font-sans text-white/70 text-sm md:text-lg tracking-widest uppercase">
          — App Store Review
        </p>
      </motion.div>
    </section>
  );
}
