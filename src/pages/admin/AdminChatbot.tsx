import { useEffect, useState } from "react";
import { Bot, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";

const AdminChatbot = () => {
  const { settings, loading, save } = useSiteSettings();
  const [prompt, setPrompt] = useState("");

  useEffect(() => { if (settings) setPrompt(settings.chatbot_system_prompt); }, [settings]);

  if (loading || !settings) return <div className="text-muted-foreground">Loading…</div>;

  const toggle = async (on: boolean) => {
    const { error } = await save({ chatbot_enabled: on });
    if (error) toast.error(error.message); else toast.success(on ? "Chatbot enabled" : "Chatbot disabled");
  };
  const savePrompt = async () => {
    const { error } = await save({ chatbot_system_prompt: prompt });
    if (error) toast.error(error.message); else toast.success("Prompt updated");
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-gradient-accent grid place-items-center"><Bot className="h-5 w-5 text-primary-foreground" /></div>
        <div>
          <h1 className="font-display font-bold text-3xl">Chatbot</h1>
          <p className="text-sm text-muted-foreground">Control the AI assistant on your site.</p>
        </div>
      </div>
      <div className="glass rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold">Show chatbot on site</div>
            <div className="text-xs text-muted-foreground">When off, the floating chat button is hidden for visitors.</div>
          </div>
          <Switch checked={settings.chatbot_enabled} onCheckedChange={toggle} />
        </div>
        <div>
          <Label>System prompt / responses guide</Label>
          <Textarea rows={10} value={prompt} onChange={(e) => setPrompt(e.target.value)} className="font-mono text-sm" />
          <p className="text-xs text-muted-foreground mt-1">This is the personality and knowledge given to the AI before every conversation.</p>
        </div>
        <Button onClick={savePrompt} className="bg-gradient-accent text-primary-foreground"><Save className="h-4 w-4 mr-2" />Save prompt</Button>
      </div>
    </div>
  );
};

export default AdminChatbot;