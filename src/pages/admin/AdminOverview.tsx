import { useEffect, useMemo, useState } from "react";
import { FolderKanban, FileText, Trophy, BadgeCheck, Mail, Eye, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";

type Counts = { projects: number; blogs: number; achievements: number; certs: number; msgs: number; views: number; unread: number };

const formatDay = (d: Date) => d.toISOString().slice(0, 10);

const AdminOverview = () => {
  const [counts, setCounts] = useState<Counts>({ projects: 0, blogs: 0, achievements: 0, certs: 0, msgs: 0, views: 0, unread: 0 });
  const [viewSeries, setViewSeries] = useState<{ day: string; views: number; messages: number }[]>([]);
  const [topPaths, setTopPaths] = useState<{ path: string; count: number }[]>([]);

  useEffect(() => {
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 29);
      const sinceIso = since.toISOString();

      const [p, b, a, c, m, v, unread, viewsRows, msgRows] = await Promise.all([
        supabase.from("projects").select("*", { count: "exact", head: true }),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }),
        supabase.from("achievements").select("*", { count: "exact", head: true }),
        supabase.from("certifications").select("*", { count: "exact", head: true }),
        supabase.from("contact_submissions").select("*", { count: "exact", head: true }),
        supabase.from("page_views").select("*", { count: "exact", head: true }),
        supabase.from("contact_submissions").select("*", { count: "exact", head: true }).eq("read", false),
        supabase.from("page_views").select("path,created_at").gte("created_at", sinceIso).limit(5000),
        supabase.from("contact_submissions").select("created_at").gte("created_at", sinceIso).limit(2000),
      ]);

      setCounts({
        projects: p.count ?? 0,
        blogs: b.count ?? 0,
        achievements: a.count ?? 0,
        certs: c.count ?? 0,
        msgs: m.count ?? 0,
        views: v.count ?? 0,
        unread: unread.count ?? 0,
      });

      // Build 30-day series
      const days: Record<string, { views: number; messages: number }> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days[formatDay(d)] = { views: 0, messages: 0 };
      }
      (viewsRows.data || []).forEach((r: { created_at: string; path: string }) => {
        const k = formatDay(new Date(r.created_at));
        if (days[k]) days[k].views += 1;
      });
      (msgRows.data || []).forEach((r: { created_at: string }) => {
        const k = formatDay(new Date(r.created_at));
        if (days[k]) days[k].messages += 1;
      });
      setViewSeries(Object.entries(days).map(([day, v]) => ({ day: day.slice(5), views: v.views, messages: v.messages })));

      // Top paths
      const pathCounts: Record<string, number> = {};
      (viewsRows.data || []).forEach((r: { path: string }) => {
        pathCounts[r.path] = (pathCounts[r.path] || 0) + 1;
      });
      const top = Object.entries(pathCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([path, count]) => ({ path: path.length > 24 ? path.slice(0, 24) + "…" : path, count }));
      setTopPaths(top);
    })();
  }, []);

  const cards = useMemo(() => [
    { label: "Page views (all time)", value: counts.views, Icon: Eye, accent: "from-primary to-primary-glow" },
    { label: "Unread messages", value: counts.unread, Icon: Mail, accent: "from-secondary to-secondary-glow" },
    { label: "Total messages", value: counts.msgs, Icon: TrendingUp, accent: "from-primary to-secondary" },
    { label: "Projects", value: counts.projects, Icon: FolderKanban, accent: "from-primary to-primary-glow" },
    { label: "Blog posts", value: counts.blogs, Icon: FileText, accent: "from-primary to-primary-glow" },
    { label: "Achievements", value: counts.achievements, Icon: Trophy, accent: "from-primary to-primary-glow" },
    { label: "Certifications", value: counts.certs, Icon: BadgeCheck, accent: "from-primary to-primary-glow" },
  ], [counts]);

  return (
    <div>
      <h1 className="font-display font-bold text-3xl mb-1">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Live insights into your portfolio's performance.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, Icon, accent }) => (
          <div key={label} className="glass rounded-2xl p-5 hover-lift">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${accent} grid place-items-center mb-3 shadow-elegant`}>
              <Icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="text-3xl font-display font-bold">{value.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-lg">Last 30 days</h2>
              <p className="text-xs text-muted-foreground">Page views and incoming messages</p>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewSeries}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#g1)" strokeWidth={2} />
                <Area type="monotone" dataKey="messages" stroke="hsl(var(--secondary))" fill="url(#g2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-display font-semibold text-lg mb-1">Top pages</h2>
          <p className="text-xs text-muted-foreground mb-4">By views in last 30 days</p>
          <div className="h-72">
            {topPaths.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-muted-foreground">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPaths} layout="vertical" margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                  <YAxis dataKey="path" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={110} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;