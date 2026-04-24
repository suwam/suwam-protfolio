import { useEffect, useState } from "react";
import { Save, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSiteSettings, type SiteSettings } from "@/hooks/useSiteSettings";
import { toast } from "sonner";

const AdminProfile = () => {
  const { settings, loading, save } = useSiteSettings();
  const [form, setForm] = useState<Partial<SiteSettings>>({});

  useEffect(() => { if (settings) setForm(settings); }, [settings]);

  if (loading || !settings) return <div className="text-muted-foreground">Loading…</div>;

  const onSave = async () => {
    const { error } = await save(form);
    if (error) toast.error(error.message); else toast.success("Profile saved");
  };

  const F = (key: keyof SiteSettings, label: string, placeholder?: string) => (
    <div>
      <Label>{label}</Label>
      <Input value={(form[key] as string) || ""} placeholder={placeholder} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-gradient-accent grid place-items-center"><UserIcon className="h-5 w-5 text-primary-foreground" /></div>
        <div>
          <h1 className="font-display font-bold text-3xl">Profile & contact</h1>
          <p className="text-sm text-muted-foreground">Public contact info and social links.</p>
        </div>
      </div>
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          {F("contact_email", "Contact email", "you@example.com")}
          {F("contact_phone", "Contact phone", "+977…")}
        </div>
        {F("resume_url", "Resume / CV URL", "https://…/resume.pdf")}
        <div className="grid sm:grid-cols-2 gap-3">
          {F("social_github", "GitHub URL")}
          {F("social_linkedin", "LinkedIn URL")}
          {F("social_facebook", "Facebook URL")}
          {F("social_instagram", "Instagram URL")}
        </div>
        <Button onClick={onSave} className="bg-gradient-accent text-primary-foreground"><Save className="h-4 w-4 mr-2" />Save changes</Button>
      </div>
    </div>
  );
};

export default AdminProfile;