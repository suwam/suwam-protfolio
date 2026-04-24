import { motion } from "framer-motion";
import SectionWrapper from "@/components/SectionWrapper";
import { PORTFOLIO } from "@/lib/portfolio-data";

const SkillsSection = () => (
  <SectionWrapper
    id="skills"
    eyebrow="Skills"
    title={<>Tools I use to <span className="text-foreground">ship</span></>}
    description="A practical mix of frontend, mobile, backend and engineering fundamentals."
  >
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
      {PORTFOLIO.skills.map((group, idx) => (
        <motion.div
          key={group.group}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: idx * 0.06 }}
          className="glass rounded-2xl p-6 hover-lift"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="h-1.5 w-8 rounded-full bg-gradient-accent" />
            <h3 className="font-display font-semibold text-lg">{group.group}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <span key={item} className="tech-tag hover:bg-primary/10 hover:border-primary/40 transition-smooth">
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  </SectionWrapper>
);

export default SkillsSection;
