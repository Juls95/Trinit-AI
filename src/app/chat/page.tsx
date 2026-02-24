"use client";
import dynamic from "next/dynamic";

const ChatPageClient = dynamic(() => import("@/components/ChatPageClient"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full bg-black items-center justify-center">
      <div className="text-white/60 text-lg font-sans animate-pulse">Loading...</div>
    </div>
  ),
});

export default function ChatPage() {
  return <ChatPageClient />;
}
