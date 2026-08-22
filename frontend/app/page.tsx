import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import TechStack from "@/components/landing/TechStack";
import Demo from "@/components/landing/Demo";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <main>
      {/* Scanline effect */}
      <div className="scanline" />

      {/* Navigation */}
      <Navbar />

      {/* Hero — "Your PC. Your Command." */}
      <Hero />

      {/* All features grid */}
      <Features />

      {/* 4-step workflow */}
      <HowItWorks />

      {/* Tech stack + model switcher */}
      <TechStack />

      {/* Interactive demo + final CTA */}
      <Demo />

      {/* Footer */}
      <Footer />
    </main>
  );
}
