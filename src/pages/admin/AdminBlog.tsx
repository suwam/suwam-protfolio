import { useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CATEGORIES = ["Development", "UI/UX", "College Projects", "Tutorials", "Personal Learnings"];

const empty = { title: "", slug: "", excerpt: "", content: "", category: "Development", tags: "", featured: false, published: true, read_time_minutes: 5 };
type BlogEditor = typeof empty & {
  id?: string;
  tags: string | string[];
  published_at?: string;
};

const AdminBlog = () => {
  const [items, setItems] = useState<BlogEditor[]>([]);
  const [editing, setEditing] = useState<BlogEditor | null>(null);
  const load = () => supabase.from("blog_posts").select("*").order("published_at", { ascending: false }).then(({ data }) => data && setItems(data));
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const payload = { ...editing, tags: typeof editing.tags === "string" ? editing.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : editing.tags };
    const { id, ...rest } = payload;
    const { error } = id ? await supabase.from("blog_posts").update(rest).eq("id", id) : await supabase.from("blog_posts").insert(rest);
    if (error) toast.error(error.message); else { toast.success("Saved"); setEditing(null); load(); }
  };
  const remove = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("blog_posts").delete().eq("id", id); load(); };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display font-bold text-3xl">Blog Posts</h1>
        <Button onClick={() => setEditing({ ...empty })} className="bg-gradient-accent text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> New</Button>
      </div>
      {editing && (
        <div className="glass rounded-2xl p-6 mb-6 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label>Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Read time (minutes)</Label><Input type="number" value={editing.read_time_minutes} onChange={(e) => setEditing({ ...editing, read_time_minutes: parseInt(e.target.value) || 5 })} /></div>
          </div>
          <div><Label>Excerpt</Label><Textarea rows={2} value={editing.excerpt} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} /></div>
          <div><Label>Content (Markdown)</Label><Textarea rows={12} className="font-mono text-sm" value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></div>
          <div><Label>Tags (comma separated)</Label><Input value={Array.isArray(editing.tags) ? editing.tags.join(", ") : editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} /> Published</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> Featured</label>
          <div className="flex gap-2"><Button onClick={save} className="bg-gradient-accent text-primary-foreground"><Save className="h-4 w-4 mr-2" />Save</Button><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div>
        </div>
      )}
      <div className="space-y-2">
        {items.map((p) => (
          <div key={p.id} className="glass rounded-xl p-4 flex justify-between items-center">
            <div><div className="font-semibold">{p.title} {!p.published && <span className="text-xs text-muted-foreground">(draft)</span>}</div><div className="text-xs text-muted-foreground">{p.category}</div></div>
            <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setEditing(p)}>Edit</Button><Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBlog;
