import { useEffect, useState } from "react";
import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSiteSettings, type SiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";

const AdminSeo = () => {
  const { settings, loading, save } = useSiteSettings();
  const [form, setForm] = useState<Partial<SiteSettings>>({});

  useEffect(() => { if (settings) setForm(settings); }, [settings]);

  if (loading || !settings) return <div className="text-muted-foreground">Loading…</div>;

  const onSave = async () => {
    const { error } = await save(form);
    if (error) toast.error(error.message); else toast.success("SEO settings saved");
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-gradient-accent grid place-items-center"><Settings className="h-5 w-5 text-primary-foreground" /></div>
        <div>
          <h1 className="font-display font-bold text-3xl">SEO settings</h1>
          <p className="text-sm text-muted-foreground">Meta tags shown in search results and link previews.</p>
        </div>
      </div>
      <div className="glass rounded-2xl p-6 space-y-4">
        <div>
          <Label>Site title</Label>
          <Input value={form.site_title || ""} onChange={(e) => setForm({ ...form, site_title: e.target.value })} />
          <p className="text-xs text-muted-foreground mt-1">Shown in browser tabs and search engines. Keep under ~60 characters.</p>
        </div>
        <div>
          <Label>Meta description</Label>
          <Textarea rows={3} value={form.meta_description || ""} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} />
          <p className="text-xs text-muted-foreground mt-1">{(form.meta_description || "").length} / 160 characters</p>
        </div>
        <div>
          <Label>OG image URL</Label>
          <Input value={form.og_image_url || ""} onChange={(e) => setForm({ ...form, og_image_url: e.target.value })} placeholder="https://…/og.png" />
          {form.og_image_url && <img src={form.og_image_url} alt="" className="mt-2 h-24 rounded-lg object-cover border border-border/60" />}
        </div>
        <Button onClick={onSave} className="bg-gradient-accent text-primary-foreground"><Save className="h-4 w-4 mr-2" />Save SEO</Button>
      </div>
    </div>
  );
};

export default AdminSeo;