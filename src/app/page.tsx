import Hero from "@/components/Hero";
import ChatPromo from "@/components/ChatPromo";
import Ticker from "@/components/Ticker";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-black min-h-screen">
      <Hero />
      <ChatPromo />
      <Ticker />
      <Features />
      <Testimonials />
      <Pricing />
      <Footer />
    </main>
  );
}
