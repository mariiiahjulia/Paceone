import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const HeroSection = () => {
  const ref = useScrollReveal();

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-hero-gradient overflow-hidden">
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--pace-royal) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--pace-royal) / 0.3) 1px, transparent 1px)`,
        backgroundSize: '80px 80px'
      }} />

      {/* Glow orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px] animate-pulse-glow pointer-events-none" />

      <div ref={ref} className="container relative z-10 text-center px-4 pt-20">
        <p className="section-heading mb-6 animate-reveal">ENDURANCE PERFORMANCE PLATFORM</p>
        
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6 animate-reveal animate-reveal-delay-1 glow-text">
          HIGH INTENSIVE.<br />
          <span className="text-gradient">PURE ENDURANCE.</span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 animate-reveal animate-reveal-delay-2" style={{ textWrap: 'balance' }}>
          Track your performance. Dominate your limits.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-reveal animate-reveal-delay-3">
          <Button variant="hero" size="xl" asChild>
            <Link to="/atletas">VIEW ATHLETES</Link>
          </Button>
          <Button variant="heroOutline" size="xl" asChild>
            <Link to="/competicoes">JOIN A COMPETITION</Link>
          </Button>
        </div>

        {/* Stats bar */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-reveal animate-reveal-delay-4">
          {[
            { value: "2.4K", label: "Atletas" },
            { value: "186", label: "Provas" },
            { value: "47", label: "Cidades" },
          ].map((s) => (
            <div key={s.label}>
              <div className="stat-value text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground tracking-wider uppercase mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
