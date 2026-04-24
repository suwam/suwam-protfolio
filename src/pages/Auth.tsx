import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const [email, setEmail] = useState("suwamsubedi30@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If the user lands here via a recovery link, send them to the reset page.
    if (window.location.hash.includes("type=recovery")) {
      navigate("/reset-password" + window.location.hash, { replace: true });
      return;
    }
    if (user) navigate("/admin");
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message); else { toast.success("Signed in"); navigate("/admin"); }
    setLoading(false);
  };

  const sendReset = async () => {
    if (!email) {
      toast.error("Enter your email first");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success(`Reset link sent to ${email}. Check your inbox (and spam).`);
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-hero p-4">
      <div className="w-full max-w-md glass-strong rounded-2xl p-8 shadow-elegant">
        <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to site</Link>
        <div className="flex items-center gap-3 mt-4 mb-6">
          <div className="h-11 w-11 rounded-xl bg-gradient-accent grid place-items-center shadow-elegant">
            <Lock className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl">Admin access</h1>
            <p className="text-xs text-muted-foreground">Sign in to manage your portfolio</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="space-y-2"><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} /></div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-accent text-primary-foreground rounded-xl shadow-elegant">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </Button>
        </form>
        <button
          type="button"
          onClick={sendReset}
          disabled={loading}
          className="text-xs text-primary hover:underline mt-4 w-full text-center disabled:opacity-50"
        >
          Forgot password?
        </button>
        <div className="mt-6 rounded-xl border border-border/60 bg-muted/40 p-3 text-left text-[11px] text-muted-foreground">
          <div className="mb-1 flex items-center gap-2 font-medium text-foreground">
            <ShieldAlert className="h-3.5 w-3.5" /> Admin setup
          </div>
          <p>Default admin email is prefilled as <code className="font-mono">suwamsubedi30@gmail.com</code>. For security, the password is never hardcoded and must be entered by the owner.</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
