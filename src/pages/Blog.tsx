import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/chat/Chatbot";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { PORTFOLIO } from "@/lib/portfolio-data";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  cover_image: string | null;
  read_time_minutes: number;
  published_at: string;
}

const CATEGORIES = ["All", "Development", "UI/UX", "College Projects", "Tutorials", "Personal Learnings"];

const Blog = () => {
  const [posts, setPosts] = useState<Post[]>(PORTFOLIO.posts);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) setPosts(data as Post[]);
        setLoading(false);
      })
      .catch(() => {
        setPosts(PORTFOLIO.posts);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => posts.filter((p) => {
    const matchesCat = cat === "All" || p.category === cat;
    const search = q.toLowerCase();
    const matchesQ = !q || p.title.toLowerCase().includes(search) || p.excerpt.toLowerCase().includes(search);
    return matchesCat && matchesQ;
  }), [posts, q, cat]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <main className="container pt-32 pb-20">
        <div className="max-w-3xl mb-12">
          <div className="section-eyebrow">Blog</div>
          <h1 className="section-heading mb-4">Notes, ideas & tutorials</h1>
          <p className="text-muted-foreground text-lg">Writing about engineering, design and what I'm learning.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts..." className="pl-10 rounded-xl" />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCat(c)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-smooth ${cat === c ? "bg-gradient-accent text-primary-foreground border-transparent shadow-elegant" : "border-border/60 hover:bg-muted"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass rounded-2xl h-64 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No posts match your filters.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => (
              <motion.article key={p.id}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 3) * 0.06 }}
                className="glass rounded-2xl p-6 hover-lift flex flex-col group">
                <span className="tech-tag w-fit mb-3">{p.category}</span>
                <h2 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-smooth leading-snug">
                  <Link to={`/blog/${p.slug}`}>{p.title}</Link>
                </h2>
                <div className="text-xs text-muted-foreground mb-3 inline-flex items-center gap-1.5"><Calendar className="h-3 w-3" />{new Date(p.published_at).toLocaleDateString()}</div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{p.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3" />{p.read_time_minutes} min</span>
                  <Link to={`/blog/${p.slug}`} className="inline-flex items-center gap-1 font-medium text-primary">Read <ArrowRight className="h-3 w-3" /></Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Blog;
