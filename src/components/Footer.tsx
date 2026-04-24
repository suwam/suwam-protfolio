import { Link } from "react-router-dom";
import { ArrowUp, Github, Linkedin, Facebook, Instagram } from "lucide-react";
import { PORTFOLIO } from "@/lib/portfolio-data";

const Footer = () => (
  <footer className="border-t border-border/50 mt-10">
    <div className="container py-10 flex flex-col sm:flex-row gap-6 items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-gradient-accent grid place-items-center font-display font-bold text-primary-foreground">S</div>
        <div className="text-sm">
          <div className="font-display font-semibold">Suwam Subedi</div>
          <div className="text-muted-foreground text-xs">© 2026 — All rights reserved</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {[
          { Icon: Github, url: PORTFOLIO.socials.github, label: "GitHub" },
          { Icon: Linkedin, url: PORTFOLIO.socials.linkedin, label: "LinkedIn" },
          { Icon: Facebook, url: PORTFOLIO.socials.facebook, label: "Facebook" },
          { Icon: Instagram, url: PORTFOLIO.socials.instagram, label: "Instagram" },
        ].map(({ Icon, url, label }) => (
          <a key={label} aria-label={label} href={url} target="_blank" rel="noreferrer"
            className="h-9 w-9 grid place-items-center rounded-lg hover:bg-muted transition-smooth">
            <Icon className="h-4 w-4" />
          </a>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <Link to="/blog" className="hover:text-foreground">Blog</Link>
        <Link to="/admin" className="hover:text-foreground">Admin</Link>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="inline-flex items-center gap-1.5 rounded-lg glass px-3 py-1.5 hover:bg-gradient-accent hover:text-primary-foreground transition-smooth">
          <ArrowUp className="h-3 w-3" /> Top
        </button>
      </div>
    </div>
  </footer>
);

export default Footer;
