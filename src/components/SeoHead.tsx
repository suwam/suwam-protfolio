import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { trackPageView } from "@/lib/track-page-view";

const setMeta = (selector: string, attr: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    const [, key, name] = selector.match(/\[(name|property)="([^"]+)"\]/) || [];
    if (key && name) el.setAttribute(key, name);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

const SeoHead = () => {
  const location = useLocation();

  // Track page views (skip admin)
  useEffect(() => {
    if (!location.pathname.startsWith("/admin") && !location.pathname.startsWith("/auth")) {
      void trackPageView(location.pathname);
    }
  }, [location.pathname]);

  // Apply SEO settings from DB
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from("site_settings")
      .select("site_title,meta_description,og_image_url")
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        if (data.site_title) document.title = data.site_title;
        if (data.meta_description) {
          setMeta('meta[name="description"]', "content", data.meta_description);
          setMeta('meta[property="og:description"]', "content", data.meta_description);
        }
        if (data.site_title) setMeta('meta[property="og:title"]', "content", data.site_title);
        if (data.og_image_url) setMeta('meta[property="og:image"]', "content", data.og_image_url);
      })
      .catch(() => undefined);
  }, []);

  return null;
};

export default SeoHead;
