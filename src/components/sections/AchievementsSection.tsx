import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import { supabase } from "@/integrations/supabase/client";

interface Achievement {
  id: string;
  title: string;
  description: string;
  date_text: string | null;
}

const AchievementsSection = () => {
  const [items, setItems] = useState<Achievement[]>([]);

  useEffect(() => {
    supabase
      .from("achievements")
      .select("id,title,description,date_text")
      .order("display_order")
      .then(({ data }) => data && setItems(data));
  }, []);

  return (
    <SectionWrapper
      id="achievements"
      eyebrow="Achievements"
      title={<>Wins that <span className="text-foreground">kept me going</span></>}
    >
      <div className="grid sm:grid-cols-2 gap-5">
        {items.map((a, i) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.06 }}
            className="glass rounded-2xl p-6 hover-lift flex gap-4"
          >
            <div className="h-12 w-12 shrink-0 rounded-xl bg-gradient-accent grid place-items-center shadow-elegant">
              <Trophy className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-xs font-mono text-primary mb-1">{a.date_text}</div>
              <h3 className="font-display font-semibold text-base mb-1">{a.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default AchievementsSection;
