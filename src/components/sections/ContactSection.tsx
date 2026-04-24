import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Send, Github, Linkedin, Facebook, Instagram, Loader2 } from "lucide-react";
import { z } from "zod";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PORTFOLIO } from "@/lib/portfolio-data";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  message: z.string().trim().min(5, "Message too short").max(5000),
});

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    if (!isSupabaseConfigured) {
      const subject = encodeURIComponent(`Portfolio message from ${parsed.data.name}`);
      const body = encodeURIComponent(`${parsed.data.message}\n\nReply to: ${parsed.data.email}`);
      window.location.href = `mailto:${PORTFOLIO.email}?subject=${subject}&body=${body}`;
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_submissions").insert(parsed.data);
    setLoading(false);
    if (error) {
      toast.error("Could not send. Try again?");
      return;
    }
    toast.success("Message sent - I'll get back to you soon!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <SectionWrapper
      id="contact"
      eyebrow="Get in touch"
      title={<>Let's <span className="text-foreground">build something</span></>}
      description="Have a project, internship or just want to say hi? Drop a message - I read every one."
    >
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-7 space-y-6"
        >
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Email</div>
            <a href={`mailto:${PORTFOLIO.email}`} className="inline-flex items-center gap-2 font-medium hover:text-primary transition-smooth">
              <Mail className="h-4 w-4" /> {PORTFOLIO.email}
            </a>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Phone</div>
            {PORTFOLIO.phones.map((p) => (
              <a key={p} href={`tel:${p}`} className="block font-medium hover:text-primary transition-smooth">
                <Phone className="inline h-4 w-4 mr-2" />{p}
              </a>
            ))}
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Socials</div>
            <div className="flex gap-2">
              {[
                { Icon: Github, url: PORTFOLIO.socials.github, label: "GitHub" },
                { Icon: Linkedin, url: PORTFOLIO.socials.linkedin, label: "LinkedIn" },
                { Icon: Facebook, url: PORTFOLIO.socials.facebook, label: "Facebook" },
                { Icon: Instagram, url: PORTFOLIO.socials.instagram, label: "Instagram" },
              ].map(({ Icon, url, label }) => (
                <a key={label} href={url} target="_blank" rel="noreferrer" aria-label={label}
                  className="h-10 w-10 grid place-items-center rounded-xl glass hover:bg-gradient-accent hover:text-primary-foreground transition-smooth">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-2xl p-7 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Your email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" maxLength={255} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell me what you're building..." maxLength={5000} />
          </div>
          <Button type="submit" disabled={loading} size="lg" className="w-full bg-gradient-accent text-primary-foreground rounded-xl shadow-elegant hover:shadow-glow">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Send className="mr-2 h-4 w-4" /> Send message</>)}
          </Button>
        </motion.form>
      </div>
    </SectionWrapper>
  );
};

export default ContactSection;
