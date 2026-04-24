
-- 1. page_views
CREATE TABLE IF NOT EXISTS public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_insert_page_views" ON public.page_views
  FOR INSERT WITH CHECK (
    char_length(path) BETWEEN 1 AND 512
  );

CREATE POLICY "admin_read_page_views" ON public.page_views
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON public.page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_path_idx ON public.page_views (path);

-- 2. site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title text NOT NULL DEFAULT 'Suwam Subedi — Portfolio',
  meta_description text NOT NULL DEFAULT 'Portfolio of Suwam Subedi — Computer Engineering student building modern web and mobile apps.',
  og_image_url text,
  chatbot_enabled boolean NOT NULL DEFAULT true,
  chatbot_system_prompt text NOT NULL DEFAULT 'You are Suwam''s helpful AI assistant. Answer questions about his projects, experience, skills and how to contact him. Be concise and friendly.',
  resume_url text,
  social_github text,
  social_linkedin text,
  social_facebook text,
  social_instagram text,
  contact_email text,
  contact_phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_site_settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "admin_write_site_settings" ON public.site_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_settings (site_title)
SELECT 'Suwam Subedi — Portfolio'
WHERE NOT EXISTS (SELECT 1 FROM public.site_settings);

-- 3. message_notes (internal notes / reply log)
CREATE TABLE IF NOT EXISTS public.message_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.contact_submissions(id) ON DELETE CASCADE,
  author_id uuid,
  body text NOT NULL,
  kind text NOT NULL DEFAULT 'note', -- 'note' | 'reply'
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.message_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_message_notes" ON public.message_notes
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS message_notes_submission_idx ON public.message_notes (submission_id, created_at);

-- 4. contact_submissions: add replied_at
ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS replied_at timestamptz;

-- 5. Storage bucket for project images
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_project_images" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-images');

CREATE POLICY "admin_upload_project_images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'project-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin_update_project_images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'project-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admin_delete_project_images" ON storage.objects
  FOR DELETE USING (bucket_id = 'project-images' AND has_role(auth.uid(), 'admin'::app_role));
