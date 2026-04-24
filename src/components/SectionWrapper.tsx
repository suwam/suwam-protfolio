import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}

const SectionWrapper = ({ id, eyebrow, title, description, children, className }: Props) => (
  <section id={id} className={`relative py-20 sm:py-28 ${className ?? ""}`}>
    <div className="container">
      {(eyebrow || title || description) && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 sm:mb-16 max-w-3xl"
        >
          {eyebrow && <div className="section-eyebrow">{eyebrow}</div>}
          {title && <h2 className="section-heading">{title}</h2>}
          {description && (
            <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">{description}</p>
          )}
        </motion.div>
      )}
      {children}
    </div>
  </section>
);

export default SectionWrapper;
