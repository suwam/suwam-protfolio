import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import { supabase } from "@/integrations/supabase/client";

interface Cert {
  id: string;
  title: string;
  issuer: string | null;
  date_text: string | null;
  credential_url: string | null;
}

const CertificationsSection = () => {
  const [items, setItems] = useState<Cert[]>([]);

  useEffect(() => {
    supabase.from("certifications").select("*").order("display_order").then(({ data }) => data && setItems(data as Cert[]));
  }, []);

  return (
    <SectionWrapper
      id="certifications"
      eyebrow="Certifications"
      title={<>Always <span className="text-foreground">learning</span></>}
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((c, i) => (
          <motion.a
            key={c.id}
            href={c.credential_url ?? "#"}
            target={c.credential_url ? "_blank" : undefined}
            rel="noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="glass rounded-2xl p-5 hover-lift block group"
          >
            <BadgeCheck className="h-7 w-7 text-primary mb-3 group-hover:text-secondary transition-smooth" />
            <h3 className="font-semibold text-sm mb-1 leading-snug">{c.title}</h3>
            <div className="text-xs text-muted-foreground">{c.issuer}{c.date_text ? ` · ${c.date_text}` : ""}</div>
          </motion.a>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default CertificationsSection;
