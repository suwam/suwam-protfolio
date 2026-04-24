import { motion } from "framer-motion";
import { Briefcase, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionWrapper from "@/components/SectionWrapper";
import { PORTFOLIO } from "@/lib/portfolio-data";

const ExperienceSection = () => (
  <SectionWrapper
    id="experience"
    eyebrow="Experience"
    title={<>The <span className="text-foreground">journey so far</span></>}
    description="Roles, internships and freelance engagements that shaped my craft."
  >
    <div className="relative max-w-3xl mx-auto">
      <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-transparent -translate-x-px sm:-translate-x-1/2" />
      <div className="space-y-10">
        {PORTFOLIO.experience.map((exp, i) => (
          <motion.div
            key={exp.role + exp.org}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.06 }}
            className={`relative grid sm:grid-cols-2 gap-4 ${i % 2 === 0 ? "" : "sm:[&>*:first-child]:order-2"}`}
          >
            <div className={`pl-12 sm:pl-0 ${i % 2 === 0 ? "sm:text-right sm:pr-12" : "sm:pl-12"}`}>
              <div className="glass rounded-2xl p-5 hover-lift">
                <div className="text-xs font-mono text-primary mb-1">{exp.period}</div>
                <h3 className="font-display font-semibold text-lg">{exp.role}</h3>
                <div className="text-sm text-muted-foreground mb-2">{exp.org}</div>
                <p className="text-sm text-muted-foreground/90 leading-relaxed">{exp.description}</p>
                {exp.supportImage && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-border/60 bg-background/50">
                    <img src={exp.supportImage} alt={`${exp.org} ${exp.supportLabel ?? "supporting image"}`} loading="lazy" className="w-full h-auto object-cover" />
                  </div>
                )}
                {exp.supportUrl && (
                  <Button asChild variant="outline" size="sm" className="mt-4 rounded-lg">
                    <a href={exp.supportUrl} target="_blank" rel="noreferrer">
                      <FileText className="mr-2 h-4 w-4" /> {exp.supportLabel ?? "Open document"}
                    </a>
                  </Button>
                )}
              </div>
            </div>
            <div className="hidden sm:block" />
            <div className="absolute left-4 sm:left-1/2 top-5 -translate-x-1/2 h-8 w-8 rounded-full bg-gradient-accent grid place-items-center shadow-elegant">
              <Briefcase className="h-4 w-4 text-primary-foreground" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </SectionWrapper>
);

export default ExperienceSection;
