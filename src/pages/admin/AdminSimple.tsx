import { useEffect, useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  table: "achievements" | "certifications";
  title: string;
  fields: { key: string; label: string; type?: "text" | "textarea" }[];
}

const AdminSimple = ({ table, title, fields }: Props) => {
  type SimpleItem = { id?: string; title?: string; description?: string | null; issuer?: string | null; [key: string]: string | null | undefined };
  const [items, setItems] = useState<SimpleItem[]>([]);
  const [editing, setEditing] = useState<SimpleItem | null>(null);
  const load = () => supabase.from(table).select("*").order("display_order").then(({ data }) => data && setItems(data));
  useEffect(() => { load(); }, [table]);

  const save = async () => {
    if (!editing) return;
    const { id, ...rest } = editing;
    const { error } = id ? await supabase.from(table).update(rest).eq("id", id) : await supabase.from(table).insert(rest);
    if (error) toast.error(error.message); else { toast.success("Saved"); setEditing(null); load(); }
  };
  const remove = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from(table).delete().eq("id", id); load(); };
  const blank = Object.fromEntries(fields.map((f) => [f.key, ""]));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display font-bold text-3xl">{title}</h1>
        <Button onClick={() => setEditing({ ...blank })} className="bg-gradient-accent text-primary-foreground"><Plus className="h-4 w-4 mr-2" /> New</Button>
      </div>
      {editing && (
        <div className="glass rounded-2xl p-6 mb-6 space-y-3">
          {fields.map((f) => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              {f.type === "textarea"
                ? <Textarea rows={3} value={editing[f.key] || ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} />
                : <Input value={editing[f.key] || ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} />}
            </div>
          ))}
          <div className="flex gap-2"><Button onClick={save} className="bg-gradient-accent text-primary-foreground"><Save className="h-4 w-4 mr-2" />Save</Button><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div>
        </div>
      )}
      <div className="space-y-2">
        {items.map((p) => (
          <div key={p.id} className="glass rounded-xl p-4 flex justify-between items-center">
            <div><div className="font-semibold">{p.title}</div><div className="text-xs text-muted-foreground">{p.description || p.issuer}</div></div>
            <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setEditing(p)}>Edit</Button><Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSimple;
