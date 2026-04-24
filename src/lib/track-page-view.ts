import { supabase } from "@/integrations/supabase/client";

let lastTracked = "";

export const trackPageView = async (path: string) => {
  if (!path || lastTracked === path) return;
  lastTracked = path;
  try {
    await supabase.from("page_views").insert({
      path: path.slice(0, 512),
      referrer: typeof document !== "undefined" ? document.referrer.slice(0, 512) || null : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 512) : null,
    });
  } catch {
    // silent
  }
};