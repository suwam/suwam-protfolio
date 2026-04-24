import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Save, Github, RefreshCcw, EyeOff, Eye, ArrowUp, ArrowDown, Star, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatRepoTitle, getGithubRepoApiUrl, normalizeRepoKey, type GithubRepo } from "@/lib/github-projects";

const empty = { title: "", slug: "", description: "", long_description: "", tech: "", image_url: "", github_url: "", live_url: "", achievement: "", featured: false, source: "manual", github_hidden: false, github_sync_enabled: false };

type ProjectItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description?: string | null;
  tech: string[];
  image_url?: string | null;
  github_url?: string | null;
  live_url?: string | null;
  achievement?: string | null;
  featured: boolean;
  source: "manual" | "github";
  display_order?: number;
  github_repo_id?: number | null;
  github_full_name?: string | null;
  github_language?: string | null;
  github_hidden?: boolean;
  github_sync_enabled?: boolean;
};

type PortfolioSettings = {
  id: string;
  github_username: string;
  github_projects_enabled: boolean;
};

type GithubRepoRow = {
  repo: GithubRepo;
  record?: ProjectItem;
};

type ProjectEditor = Omit<ProjectItem, "tech"> & {
  tech: string[] | string;
};

const AdminProjects = () => {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [editing, setEditing] = useState<ProjectEditor | null>(null);
  const [settings, setSettings] = useState<PortfolioSettings | null>(null);
  const [githubRepos, setGithubRepos] = useState<GithubRepo[]>([]);
  const [busyRepoId, setBusyRepoId] = useState<number | null>(null);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const githubRecords = useMemo(() => items.filter((item) => item.source === "github"), [items]);
  const manualItems = useMemo(() => items.filter((item) => item.source !== "github"), [items]);
  const githubRows = useMemo<GithubRepoRow[]>(() => {
    const byRepoId = new Map(githubRecords.map((item) => [item.github_repo_id, item]));
    return githubRepos.map((repo) => ({ repo, record: byRepoId.get(repo.id) }));
  }, [githubRepos, githubRecords]);

  const load = async () => {
    const [{ data: projects }, { data: portfolioSettings }] = await Promise.all([
      supabase.from("projects").select("*").order("display_order"),
      supabase.from("portfolio_settings").select("*").maybeSingle(),
    ]);
    if (projects) setItems(projects as ProjectItem[]);
    if (portfolioSettings) setSettings(portfolioSettings as PortfolioSettings);
  };

  const loadGithubRepos = async (username?: string) => {
    const target = (username ?? settings?.github_username ?? "suwam").trim();
    if (!target) return;
    setLoadingGithub(true);
    try {
      const response = await fetch(getGithubRepoApiUrl(target));
      if (!response.ok) throw new Error("Could not fetch GitHub repositories");
      const data = ((await response.json()) as GithubRepo[])
        .filter((repo) => !repo.fork && !repo.archived)
        .sort((a, b) => a.name.localeCompare(b.name));
      setGithubRepos(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not fetch GitHub repositories");
    } finally {
      setLoadingGithub(false);
    }
  };

  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (settings?.github_username) void loadGithubRepos(settings.github_username);
  }, [settings?.github_username]);

  const save = async () => {
    if (!editing) return;
    const payload = { ...editing, tech: typeof editing.tech === "string" ? editing.tech.split(",").map((t: string) => t.trim()).filter(Boolean) : editing.tech };
    const { id, ...rest } = payload;
    const { error } = id ? await supabase.from("projects").update(rest).eq("id", id) : await supabase.from("projects").insert(rest);
    if (error) toast.error(error.message); else { toast.success("Saved"); setEditing(null); load(); }
  };
  const remove = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("projects").delete().eq("id", id); load(); };

  const toggleFeatured = async (p: ProjectItem) => {
    const { error } = await supabase.from("projects").update({ featured: !p.featured }).eq("id", p.id);
    if (error) return toast.error(error.message);
    setItems((prev) => prev.map((x) => x.id === p.id ? { ...x, featured: !p.featured } : x));
  };

  const move = async (p: ProjectItem, dir: -1 | 1) => {
    const list = [...manualItems].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    const idx = list.findIndex((x) => x.id === p.id);
    const swap = list[idx + dir];
    if (!swap) return;
    const aOrder = p.display_order ?? idx;
    const bOrder = swap.display_order ?? idx + dir;
    await Promise.all([
      supabase.from("projects").update({ display_order: bOrder }).eq("id", p.id),
      supabase.from("projects").update({ display_order: aOrder }).eq("id", swap.id),
    ]);
    load();
  };

  const uploadImage = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("project-images").upload(path, file, { upsert: false, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("project-images").getPublicUrl(path);
      setEditing({ ...editing, image_url: data.publicUrl });
      toast.success("Image uploaded");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const saveSettings = async (next: Partial<PortfolioSettings>) => {
    if (!settings) return;
    const updated = { ...settings, ...next };
    setSettings(updated);
    const { error } = await supabase.from("portfolio_settings").update({
      github_username: updated.github_username,
      github_projects_enabled: updated.github_projects_enabled,
    }).eq("id", updated.id);
    if (error) {
      toast.error(error.message);
      await load();
      return;
    }
    toast.success("GitHub settings updated");
    if (next.github_username) void loadGithubRepos(updated.github_username);
  };

  const toggleGithubRepo = async (repo: GithubRepo, enabled: boolean) => {
    setBusyRepoId(repo.id);
    const existing = githubRecords.find((item) => item.github_repo_id === repo.id);
    const payload = {
      title: formatRepoTitle(repo.name),
      slug: normalizeRepoKey(repo.name),
      description: repo.description || "Public GitHub repository by Suwam.",
      tech: repo.language ? [repo.language] : ["GitHub"],
      github_url: repo.html_url,
      live_url: repo.homepage || null,
      source: "github" as const,
      github_repo_id: repo.id,
      github_full_name: repo.full_name,
      github_language: repo.language,
      github_hidden: !enabled,
      github_sync_enabled: enabled,
      featured: false,
    };

    const { error } = existing
      ? await supabase.from("projects").update(payload).eq("id", existing.id)
      : await supabase.from("projects").insert(payload);

    setBusyRepoId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(enabled ? "GitHub project enabled" : "GitHub project hidden");
    await load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display font-bold text-3xl">Projects</h1>
        <Button onClick={() => setEditing({ ...empty })} className="bg-gradient-accent text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> New</Button>
      </div>
      {settings && (
        <div className="glass rounded-2xl p-6 mb-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="font-display font-semibold text-xl">GitHub project feed</h2>
              <p className="text-sm text-muted-foreground">Choose whether public repositories appear in the portfolio and hide individual repos when needed.</p>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="github-feed-toggle">Show GitHub projects</Label>
              <Switch id="github-feed-toggle" checked={settings.github_projects_enabled} onCheckedChange={(checked) => void saveSettings({ github_projects_enabled: checked })} />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="github-username">GitHub username</Label>
              <Input id="github-username" value={settings.github_username} onChange={(e) => setSettings({ ...settings, github_username: e.target.value })} onBlur={() => void saveSettings({ github_username: settings.github_username.trim() || "suwam" })} />
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={() => void loadGithubRepos(settings.github_username)}>
                <RefreshCcw className={`h-4 w-4 mr-2 ${loadingGithub ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {githubRows.length === 0 ? (
              <div className="text-sm text-muted-foreground">No GitHub repositories found yet.</div>
            ) : githubRows.map(({ repo, record }) => {
              const enabled = record ? !record.github_hidden : false;
              return (
                <div key={repo.id} className="rounded-xl border border-border/60 bg-background/40 px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="font-medium inline-flex items-center gap-2"><Github className="h-4 w-4 text-primary" /> {formatRepoTitle(repo.name)}</div>
                    <div className="text-xs text-muted-foreground">{repo.description || repo.full_name}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{repo.language || "Unknown tech"}</span>
                    <Button size="sm" variant="outline" asChild>
                      <a href={repo.html_url} target="_blank" rel="noreferrer">Open</a>
                    </Button>
                    <Button size="sm" variant={enabled ? "outline" : "default"} className={!enabled ? "bg-gradient-accent text-primary-foreground" : undefined} disabled={busyRepoId === repo.id} onClick={() => void toggleGithubRepo(repo, !enabled)}>
                      {enabled ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {enabled ? "Hide" : "Show"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {editing && (
        <div className="glass rounded-2xl p-6 mb-6 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
          </div>
          <div><Label>Description</Label><Textarea rows={2} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
          <div><Label>Tech (comma separated)</Label><Input value={Array.isArray(editing.tech) ? editing.tech.join(", ") : editing.tech} onChange={(e) => setEditing({ ...editing, tech: e.target.value })} /></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>GitHub URL</Label><Input value={editing.github_url || ""} onChange={(e) => setEditing({ ...editing, github_url: e.target.value })} /></div>
            <div><Label>Live URL</Label><Input value={editing.live_url || ""} onChange={(e) => setEditing({ ...editing, live_url: e.target.value })} /></div>
          </div>
          <div>
            <Label>Project image</Label>
            <div className="flex gap-2 items-center mt-1">
              <Input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="https://… or upload" />
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Upload className="h-4 w-4 mr-2" />{uploading ? "Uploading…" : "Upload"}
              </Button>
            </div>
            {editing.image_url && <img src={editing.image_url} alt="" className="mt-2 h-24 rounded-lg object-cover border border-border/60" />}
          </div>
          <div><Label>Achievement (e.g. "Best Project Award")</Label><Input value={editing.achievement || ""} onChange={(e) => setEditing({ ...editing, achievement: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={!!editing.featured} onCheckedChange={(c) => setEditing({ ...editing, featured: c })} /> Featured project
          </label>
          <div className="flex gap-2"><Button onClick={save} className="bg-gradient-accent text-primary-foreground"><Save className="h-4 w-4 mr-2" />Save</Button><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div>
        </div>
      )}
      <div className="space-y-2">
        {manualItems
          .slice()
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map((p, i, arr) => (
            <div key={p.id} className="glass rounded-xl p-4 flex justify-between items-center gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {p.image_url && <img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />}
                <div className="min-w-0">
                  <div className="font-semibold truncate flex items-center gap-2">{p.title}{p.featured && <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.tech?.join(" · ")}</div>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button size="icon" variant="ghost" disabled={i === 0} onClick={() => move(p, -1)}><ArrowUp className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" disabled={i === arr.length - 1} onClick={() => move(p, 1)}><ArrowDown className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => toggleFeatured(p)} title="Toggle featured">
                  <Star className={`h-4 w-4 ${p.featured ? "fill-secondary text-secondary" : ""}`} />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(p)}>Edit</Button>
                <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default AdminProjects;
