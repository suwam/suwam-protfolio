CREATE TYPE public.project_source AS ENUM ('manual', 'github');

ALTER TABLE public.projects
  ADD COLUMN source public.project_source NOT NULL DEFAULT 'manual',
  ADD COLUMN github_repo_id bigint,
  ADD COLUMN github_full_name text,
  ADD COLUMN github_language text,
  ADD COLUMN github_hidden boolean NOT NULL DEFAULT false,
  ADD COLUMN github_sync_enabled boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX projects_github_repo_id_unique_idx
  ON public.projects (github_repo_id)
  WHERE github_repo_id IS NOT NULL;

CREATE INDEX projects_source_idx ON public.projects (source);
CREATE INDEX projects_source_hidden_idx ON public.projects (source, github_hidden);

CREATE TABLE public.portfolio_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  github_username text NOT NULL DEFAULT 'suwam',
  github_projects_enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read portfolio settings"
ON public.portfolio_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage portfolio settings"
ON public.portfolio_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_portfolio_settings_updated_at
BEFORE UPDATE ON public.portfolio_settings
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.portfolio_settings (github_username, github_projects_enabled)
SELECT 'suwam', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.portfolio_settings
);

CREATE TRIGGER set_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();