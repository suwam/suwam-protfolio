import { useEffect, useMemo, useState } from "react";
import { Trash2, Mail, Check, MessageSquare, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Msg = { id: string; name: string; email: string; message: string; read: boolean; replied_at: string | null; created_at: string };
type Note = { id: string; submission_id: string; body: string; kind: string; created_at: string };

type Filter = "all" | "unread" | "read" | "replied";

const AdminMessages = () => {
  const [items, setItems] = useState<Msg[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const [active, setActive] = useState<Msg | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteDraft, setNoteDraft] = useState("");

  const load = async () => {
    const { data } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
    if (data) setItems(data as Msg[]);
  };
  useEffect(() => { void load(); }, []);

  useEffect(() => {
    if (!active) { setNotes([]); return; }
    supabase.from("message_notes").select("*").eq("submission_id", active.id).order("created_at").then(({ data }) => setNotes((data as Note[]) || []));
  }, [active]);

  const filtered = useMemo(() => items.filter((m) => {
    if (filter === "unread" && m.read) return false;
    if (filter === "read" && !m.read) return false;
    if (filter === "replied" && !m.replied_at) return false;
    if (q && !`${m.name} ${m.email} ${m.message}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [items, filter, q]);

  const markRead = async (m: Msg, read: boolean) => {
    const { error } = await supabase.from("contact_submissions").update({ read }).eq("id", m.id);
    if (error) return toast.error(error.message);
    setItems((p) => p.map((x) => x.id === m.id ? { ...x, read } : x));
    if (active?.id === m.id) setActive({ ...active, read });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await supabase.from("contact_submissions").delete().eq("id", id);
    toast.success("Deleted");
    if (active?.id === id) setActive(null);
    load();
  };

  const reply = (m: Msg) => {
    const subject = encodeURIComponent("Re: your message");
    const body = encodeURIComponent(`Hi ${m.name},\n\nThanks for reaching out!\n\n— Suwam\n\n---\n> ${m.message.split("\n").join("\n> ")}`);
    window.location.href = `mailto:${m.email}?subject=${subject}&body=${body}`;
    supabase.from("contact_submissions").update({ replied_at: new Date().toISOString(), read: true }).eq("id", m.id).then(() => load());
  };

  const addNote = async () => {
    if (!active || !noteDraft.trim()) return;
    const { data, error } = await supabase.from("message_notes").insert({ submission_id: active.id, body: noteDraft.trim(), kind: "note" }).select().single();
    if (error) return toast.error(error.message);
    setNotes((p) => [...p, data as Note]);
    setNoteDraft("");
  };

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: items.length },
    { key: "unread", label: "Unread", count: items.filter((m) => !m.read).length },
    { key: "read", label: "Read", count: items.filter((m) => m.read).length },
    { key: "replied", label: "Replied", count: items.filter((m) => m.replied_at).length },
  ];

  return (
    <div>
      <h1 className="font-display font-bold text-3xl mb-6">Messages</h1>
      <div className="grid lg:grid-cols-[1fr,1.2fr] gap-4">
        <div className="space-y-3">
          <div className="glass rounded-2xl p-3 flex flex-col gap-3">
            <Input placeholder="Search messages…" value={q} onChange={(e) => setQ(e.target.value)} className="rounded-xl" />
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-smooth ${filter === f.key ? "bg-gradient-accent text-primary-foreground border-transparent shadow-elegant" : "border-border/60 hover:bg-muted text-muted-foreground"}`}>
                  {f.label} <span className="opacity-60 ml-1">{f.count}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {filtered.length === 0 && <div className="text-muted-foreground text-sm p-6 text-center glass rounded-2xl">No messages match.</div>}
            {filtered.map((m) => (
              <button key={m.id} onClick={() => setActive(m)}
                className={`w-full text-left glass rounded-xl p-4 hover-lift transition-smooth ${active?.id === m.id ? "ring-2 ring-primary/60" : ""}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-semibold text-sm truncate">{m.name}</div>
                  <div className="flex gap-1 shrink-0">
                    {!m.read && <span className="h-2 w-2 rounded-full bg-secondary" />}
                    {m.replied_at && <Badge variant="secondary" className="text-[10px] py-0 h-4">Replied</Badge>}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground truncate">{m.email}</div>
                <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{m.message}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{new Date(m.created_at).toLocaleString()}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 min-h-[60vh]">
          {!active ? (
            <div className="h-full grid place-items-center text-muted-foreground text-sm">Select a message to view details</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display font-semibold text-xl">{active.name}</div>
                  <a href={`mailto:${active.email}`} className="text-sm text-primary hover:underline">{active.email}</a>
                  <div className="text-xs text-muted-foreground">{new Date(active.created_at).toLocaleString()}</div>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => markRead(active, !active.read)}>
                    <Check className="h-4 w-4 mr-1.5" /> {active.read ? "Mark unread" : "Mark read"}
                  </Button>
                  <Button size="sm" className="bg-gradient-accent text-primary-foreground" onClick={() => reply(active)}>
                    <Reply className="h-4 w-4 mr-1.5" /> Reply
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(active.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="rounded-xl bg-muted/40 p-4">
                <div className="text-xs text-muted-foreground inline-flex items-center gap-1 mb-2"><Mail className="h-3 w-3" /> Original message</div>
                <p className="text-sm whitespace-pre-wrap">{active.message}</p>
              </div>
              <div>
                <div className="text-xs text-muted-foreground inline-flex items-center gap-1 mb-2"><MessageSquare className="h-3 w-3" /> Internal notes</div>
                <div className="space-y-2 mb-3">
                  {notes.length === 0 && <div className="text-xs text-muted-foreground italic">No notes yet.</div>}
                  {notes.map((n) => (
                    <div key={n.id} className="rounded-lg border border-border/60 px-3 py-2 text-sm">
                      <div className="text-[10px] text-muted-foreground mb-0.5">{new Date(n.created_at).toLocaleString()}</div>
                      {n.body}
                    </div>
                  ))}
                </div>
                <Textarea rows={2} value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} placeholder="Add a private note…" className="rounded-xl mb-2" />
                <Button size="sm" onClick={addNote} disabled={!noteDraft.trim()} className="bg-gradient-accent text-primary-foreground">Add note</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;