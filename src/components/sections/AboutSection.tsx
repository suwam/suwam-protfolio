import { motion } from "framer-motion";
import { Code2, Smartphone, Palette, Brain } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import { PORTFOLIO } from "@/lib/portfolio-data";

const ICONS = [Code2, Smartphone, Palette, Brain];

const AboutSection = () => (
  <SectionWrapper
    id="about"
    eyebrow="About me"
    title={<>The story <span className="text-foreground">behind the code</span></>}
    description={PORTFOLIO.about}
  >
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {PORTFOLIO.highlights.map((h, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <motion.div
            key={h.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="glass rounded-2xl p-6 hover-lift glow-ring relative"
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-accent grid place-items-center shadow-elegant mb-4">
              <Icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-1.5">{h.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{h.description}</p>
          </motion.div>
        );
      })}
    </div>
  </SectionWrapper>
);

export default AboutSection;
