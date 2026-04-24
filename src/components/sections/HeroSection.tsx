import { motion } from "framer-motion";
import { ArrowRight, Download, Github, Linkedin, Mail, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PORTFOLIO } from "@/lib/portfolio-data";
import avatar from "@/assets/suwam-avatar.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-gradient-hero">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container relative grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Available for internships & freelance</span>
          </div>

          <h1 className="font-display font-bold tracking-tight text-5xl sm:text-6xl lg:text-7xl leading-[1.04]">
            {PORTFOLIO.name}
            <span className="block text-gradient text-3xl sm:text-4xl lg:text-5xl mt-3">
              {PORTFOLIO.role}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            {PORTFOLIO.intro}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
              className="group bg-gradient-accent text-primary-foreground shadow-elegant hover:shadow-glow transition-smooth rounded-xl"
            >
              View Projects
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            {PORTFOLIO.cvUrl !== "#" ? (
              <Button size="lg" variant="outline" asChild className="rounded-xl border-border hover:bg-muted backdrop-blur">
                <a href={PORTFOLIO.cvUrl} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download CV
                </a>
              </Button>
            ) : (
              <Button
                size="lg"
                variant="outline"
                onClick={() => toast.info("CV will be added soon.")}
                className="rounded-xl border-border hover:bg-muted backdrop-blur"
              >
                <Download className="mr-2 h-4 w-4" />
                Download CV
              </Button>
            )}
            <Button
              size="lg"
              variant="ghost"
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-xl"
            >
              <Mail className="mr-2 h-4 w-4" />
              Contact Me
            </Button>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {PORTFOLIO.stats.map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-3">
                <div className="font-display text-2xl font-semibold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-4 text-muted-foreground">
            <span className="text-xs uppercase tracking-widest">Find me</span>
            <span className="h-px w-10 bg-border" />
            <a href={PORTFOLIO.socials.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="hover:text-foreground transition-smooth">
              <Github className="h-5 w-5" />
            </a>
            <a href={PORTFOLIO.socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:text-foreground transition-smooth">
              <Linkedin className="h-5 w-5" />
            </a>
            <span className="hidden sm:inline-flex items-center gap-1 text-xs">
              <MapPin className="h-3.5 w-3.5" /> Nepal
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="relative mx-auto"
        >
          <div className="relative">
            <div className="relative glass-strong rounded-2xl p-3 shadow-elegant animate-float">
              <img
                src={avatar}
                alt={`${PORTFOLIO.name} portrait`}
                width={1024}
                height={1024}
                className="w-full max-w-md rounded-xl"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -left-4 top-12 glass-strong rounded-xl px-4 py-3 shadow-card hidden sm:block"
            >
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Stack</div>
              <div className="text-sm font-semibold">React / Flutter / Node</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute -right-4 bottom-12 glass-strong rounded-xl px-4 py-3 shadow-card hidden sm:block"
            >
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Currently</div>
              <div className="text-sm font-semibold flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> Building useful things
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
