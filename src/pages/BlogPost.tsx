import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/chat/Chatbot";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase.from("blog_posts").select("*").eq("slug", slug).maybeSingle()
      .then(({ data }) => { setPost(data); setLoading(false); });
  }, [slug]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <main className="container pt-32 pb-20 max-w-3xl">
        <Button asChild variant="ghost" size="sm" className="mb-6"><Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" />All posts</Link></Button>
        {loading ? <div className="glass rounded-2xl h-96 animate-pulse" /> :
         !post ? <div className="text-center py-20 text-muted-foreground">Post not found.</div> : (
          <article>
            <span className="tech-tag mb-4">{post.category}</span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight text-gradient mb-4">{post.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-10">
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              <span className="divider-dot" />
              <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{post.read_time_minutes} min read</span>
            </div>
            <div className="glass rounded-2xl p-8 prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:text-gradient prose-a:text-primary">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
            </div>
          </article>
        )}
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default BlogPost;
