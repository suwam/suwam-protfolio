import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { Github, ExternalLink, Award, Folder } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { PORTFOLIO } from "@/lib/portfolio-data";
import itineraryVoyagerImage from "@/assets/itinerary-voyager.png";
import mazeGeneratorImage from "@/assets/maze-generator.png";
import fileCompressionImage from "@/assets/file-compression.png";
import { formatRepoTitle, getGithubRepoApiUrl, isExcludedGithubRepo, normalizeRepoKey, type GithubRepo } from "@/lib/github-projects";

interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  tech: string[];
  image_url: string | null;
  github_url: string | null;
  live_url: string | null;
  achievement: string | null;
  featured: boolean;
  source: "manual" | "github";
  github_repo_id?: number | null;
  github_full_name?: string | null;
  github_language?: string | null;
  github_hidden?: boolean;
  github_sync_enabled?: boolean;
}

interface DisplayProject extends Project {
  isGithubProject: boolean;
}

interface PortfolioSettings {
  github_username: string;
  github_projects_enabled: boolean;
}

const CURATED_PROJECTS = ["itinerary-voyager", "maze-generator", "file-compressor"] as const;
const CURATED_PROJECT_SET = new Set<string>(CURATED_PROJECTS);

const PROJECT_IMAGE_MAP: Record<string, string> = {
  "itinerary-voyager": itineraryVoyagerImage,
  "maze-generator": mazeGeneratorImage,
  "file-compressor": fileCompressionImage,
};

const ProjectsSection = () => {
  const [projects, setProjects] = useState<DisplayProject[]>(PORTFOLIO.projects.map((project) => ({ ...project, isGithubProject: false })));
  const [loading, setLoading] = useState(false);

  const curatedOrder = useMemo<Map<string, number>>(
    () => new Map<string, number>(CURATED_PROJECTS.map((slug, index) => [slug, index])),
    [],
  );

  useEffect(() => {
    const loadProjects = async () => {
      if (!isSupabaseConfigured) return;
      setLoading(true);
      try {
        const [{ data: projectRows, error: projectError }, { data: settingsRow, error: settingsError }] = await Promise.all([
          supabase
            .from("projects")
            .select("id,title,slug,description,tech,image_url,github_url,live_url,achievement,featured,source,github_repo_id,github_full_name,github_language,github_hidden,github_sync_enabled,display_order")
            .order("display_order", { ascending: true }),
          supabase
            .from("portfolio_settings")
            .select("github_username,github_projects_enabled")
            .maybeSingle(),
        ]);

        if (projectError) throw projectError;
        if (settingsError) throw settingsError;

        const storedProjects = (projectRows ?? []) as Project[];
        const settings = (settingsRow ?? {
          github_username: "suwam",
          github_projects_enabled: true,
        }) as PortfolioSettings;

        const manualProjectsFromDb = storedProjects
          .filter((project) => project.source === "manual" && CURATED_PROJECT_SET.has(project.slug))
          .sort((a, b) => (curatedOrder.get(a.slug) ?? 999) - (curatedOrder.get(b.slug) ?? 999))
          .map((project) => ({ ...project, isGithubProject: false }));
        const manualProjects = manualProjectsFromDb.length > 0
          ? manualProjectsFromDb
          : PORTFOLIO.projects.map((project) => ({ ...project, isGithubProject: false }));

        const hiddenGithubRepoIds = new Set(
          storedProjects
            .filter((project) => project.source === "github" && project.github_hidden && project.github_repo_id)
            .map((project) => project.github_repo_id as number),
        );

        const manualRepoKeys = new Set(
          manualProjects.flatMap((project) => [
            normalizeRepoKey(project.slug),
            normalizeRepoKey(project.title),
            normalizeRepoKey(project.github_url ?? ""),
          ]),
        );

        let githubProjects: DisplayProject[] = [];

        if (settings.github_projects_enabled) {
          const response = await fetch(getGithubRepoApiUrl(settings.github_username));
          if (!response.ok) throw new Error("Failed to fetch GitHub projects");

          const repos = (await response.json()) as GithubRepo[];
          githubProjects = repos
            .filter((repo) => !repo.fork && !repo.archived)
            .filter((repo) => !isExcludedGithubRepo(repo))
            .filter((repo) => !hiddenGithubRepoIds.has(repo.id))
            .filter((repo) => {
              const keys = [
                normalizeRepoKey(repo.name),
                normalizeRepoKey(repo.full_name),
                normalizeRepoKey(repo.html_url),
              ];
              return !keys.some((key) => manualRepoKeys.has(key));
            })
            .map((repo): DisplayProject => ({
              id: `github-${repo.id}`,
              title: formatRepoTitle(repo.name),
              slug: normalizeRepoKey(repo.name),
              description: repo.description || "Public GitHub repository by Suwam.",
              tech: repo.language ? [repo.language] : ["GitHub"],
              image_url: null,
              github_url: repo.html_url,
              live_url: repo.homepage || null,
              achievement: null,
              featured: false,
              source: "github" as const,
              github_repo_id: repo.id,
              github_full_name: repo.full_name,
              github_language: repo.language,
              github_hidden: false,
              github_sync_enabled: true,
              isGithubProject: true,
            }))
            .sort((a, b) => a.title.localeCompare(b.title));
        }

        setProjects([...manualProjects, ...githubProjects]);
      } catch {
        setProjects(PORTFOLIO.projects.map((project) => ({ ...project, isGithubProject: false })));
      } finally {
        setLoading(false);
      }
    };

    void loadProjects();
  }, [curatedOrder]);

  return (
    <SectionWrapper
      id="projects"
      eyebrow="Selected work"
      title={<>Projects I've <span className="text-foreground">built</span></>}
      description="Selected projects that show product thinking, practical engineering and clean implementation."
    >
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, idx) => (
            <motion.article
              key={p.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (idx % 3) * 0.08 }}
              className="group glass rounded-2xl overflow-hidden hover-lift glow-ring flex flex-col"
            >
              <div className="relative aspect-video bg-gradient-accent overflow-hidden">
                {(p.image_url || PROJECT_IMAGE_MAP[p.slug]) ? (
                  <img src={p.image_url || PROJECT_IMAGE_MAP[p.slug]} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-smooth group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="absolute inset-0 bg-gradient-accent opacity-90" />
                    <Folder className="relative h-14 w-14 text-primary-foreground/80" />
                    <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  {p.achievement && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-background/85 backdrop-blur px-2.5 py-1 text-[11px] font-semibold border border-border/60">
                      <Award className="h-3 w-3 text-secondary" /> {p.achievement}
                    </span>
                  )}
                  {p.isGithubProject && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-background/85 backdrop-blur px-2.5 py-1 text-[11px] font-semibold border border-border/60">
                      <Github className="h-3 w-3 text-primary" /> GitHub
                    </span>
                  )}
                  {!p.isGithubProject && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-background/85 backdrop-blur px-2.5 py-1 text-[11px] font-semibold border border-border/60">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-display font-semibold text-xl mb-2 group-hover:text-primary transition-smooth">
                  {p.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{p.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {p.tech.slice(0, 5).map((t) => (
                    <span key={t} className="tech-tag">{t}</span>
                  ))}
                </div>

                <div className="flex gap-2 mt-auto">
                  {p.github_url && (
                    <Button asChild size="sm" variant="outline" className="rounded-lg flex-1">
                      <a href={p.github_url} target="_blank" rel="noreferrer">
                        <Github className="mr-1.5 h-3.5 w-3.5" /> Source
                      </a>
                    </Button>
                  )}
                  {p.live_url && (
                    <Button asChild size="sm" className="rounded-lg flex-1 bg-gradient-accent text-primary-foreground">
                      <a href={p.live_url} target="_blank" rel="noreferrer">
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Live
                      </a>
                    </Button>
                  )}
                  {!p.github_url && !p.live_url && (
                    <Button size="sm" variant="outline" disabled className="rounded-lg flex-1">Coming soon</Button>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
};

export default ProjectsSection;