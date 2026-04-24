import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  id: string;
  site_title: string;
  meta_description: string;
  og_image_url: string | null;
  chatbot_enabled: boolean;
  chatbot_system_prompt: string;
  resume_url: string | null;
  social_github: string | null;
  social_linkedin: string | null;
  social_facebook: string | null;
  social_instagram: string | null;
  contact_email: string | null;
  contact_phone: string | null;
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    const { data } = await supabase.from("site_settings").select("*").maybeSingle();
    setSettings((data as SiteSettings | null) ?? null);
    setLoading(false);
  };

  useEffect(() => { void reload(); }, []);

  const save = async (patch: Partial<SiteSettings>) => {
    if (!settings) return { error: new Error("Settings not loaded") };
    const { error } = await supabase.from("site_settings").update(patch).eq("id", settings.id);
    if (!error) setSettings({ ...settings, ...patch });
    return { error };
  };

  return { settings, loading, save, reload };
};