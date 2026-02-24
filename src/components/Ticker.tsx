"use client";
import React from 'react';
import { motion } from 'framer-motion';

const logos = [
  "https://framerusercontent.com/images/lBk7MKclfzJRlatPc13MvYtptk.svg",
  "https://framerusercontent.com/images/OHfziRjK2HdoOgrAXlPXc55VYQ.svg",
  "https://framerusercontent.com/images/C8vnHs7e8IbLZooep0gNip6eylU.svg",
  "https://framerusercontent.com/images/KNj9BRJvdrtCaYx5m7um7EmT8.svg",
  "https://framerusercontent.com/images/8wpt2H14XHcb4yoW182iK0MGxs.svg",
  "https://framerusercontent.com/images/jqmWIOA4WlrHoWQKgzTtrOgybg.svg",
  "https://framerusercontent.com/images/qNMZaMQpAKdhOYxA9xp6LSCc54.svg"
];

export default function Ticker() {
  return (
    <div className="relative w-full h-[120px] bg-[#0a0a0a] border-t border-b border-white/10 flex flex-col justify-center overflow-hidden">
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'url(https://framerusercontent.com/images/hKIOuhwo7V5qyLjtnbnhtVjEc4.png)',
          backgroundSize: '1000px 18px',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'top'
        }}
      />
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'url(https://framerusercontent.com/images/hKIOuhwo7V5qyLjtnbnhtVjEc4.png)',
          backgroundSize: '1000px 18px',
          backgroundRepeat: 'repeat-x',
          backgroundPosition: 'bottom'
        }}
      />

      <div className="flex whitespace-nowrap overflow-hidden z-10">
        <motion.div
          className="flex items-center gap-24 px-12"
          animate={{ x: [0, -1035] }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 20
          }}
        >
          {[...logos, ...logos, ...logos].map((src, i) => (
            <img
              key={i}
              src={src}
              alt="Client Logo"
              className="h-[30px] w-auto opacity-70 hover:opacity-100 transition-opacity invert"
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
