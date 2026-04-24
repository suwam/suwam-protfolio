import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import SectionWrapper from "@/components/SectionWrapper";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { PORTFOLIO } from "@/lib/portfolio-data";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  cover_image: string | null;
  read_time_minutes: number;
  published_at: string;
}

const FeaturedBlogSection = () => {
  const [posts, setPosts] = useState<Post[]>(PORTFOLIO.posts);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase
      .from("blog_posts")
      .select("id,title,slug,excerpt,category,cover_image,read_time_minutes,published_at")
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(3)
      .then(({ data }) => data && data.length > 0 && setPosts(data as Post[]))
      .catch(() => setPosts(PORTFOLIO.posts));
  }, []);

  if (posts.length === 0) return null;

  return (
    <SectionWrapper
      id="blog"
      eyebrow="From the blog"
      title={<>Writing & <span className="text-foreground">notes</span></>}
      description="Thoughts on engineering, design and the things I'm learning."
    >
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((p, i) => (
          <motion.article
            key={p.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="glass rounded-2xl p-6 hover-lift flex flex-col group"
          >
            <span className="tech-tag w-fit mb-3">{p.category}</span>
            <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-smooth leading-snug">
              <Link to={`/blog/${p.slug}`}>{p.title}</Link>
            </h3>
            <div className="text-xs text-muted-foreground mb-3 inline-flex items-center gap-1.5"><Calendar className="h-3 w-3" />{new Date(p.published_at).toLocaleDateString()}</div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{p.excerpt}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Clock className="h-3 w-3" /> {p.read_time_minutes} min</span>
              <Link to={`/blog/${p.slug}`} className="inline-flex items-center gap-1 font-medium text-primary hover:gap-2 transition-all">
                Read <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
      <div className="text-center mt-10">
        <Button asChild variant="outline" size="lg" className="rounded-xl">
          <Link to="/blog">View all posts <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </div>
    </SectionWrapper>
  );
};

export default FeaturedBlogSection;
