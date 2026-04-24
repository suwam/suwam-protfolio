import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderKanban, FileText, Trophy, BadgeCheck, Mail, LogOut, Home, User as UserIcon, Bot, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/blog", label: "Blog Posts", icon: FileText },
  { to: "/admin/achievements", label: "Achievements", icon: Trophy },
  { to: "/admin/certifications", label: "Certifications", icon: BadgeCheck },
  { to: "/admin/messages", label: "Messages", icon: Mail },
  { to: "/admin/profile", label: "Profile", icon: UserIcon },
  { to: "/admin/chatbot", label: "Chatbot", icon: Bot },
  { to: "/admin/seo", label: "SEO", icon: Settings },
];

const AdminLayout = () => {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [user, loading, navigate]);

  if (loading) return <div className="min-h-screen grid place-items-center text-muted-foreground">Loading…</div>;
  if (!user) return null;
  if (!isAdmin) return (
    <div className="min-h-screen grid place-items-center p-6 bg-gradient-hero">
      <div className="glass-strong rounded-2xl p-8 max-w-md text-center">
        <h2 className="font-display font-bold text-xl mb-2">Not an admin</h2>
        <p className="text-sm text-muted-foreground mb-4">Your account ({user.email}) doesn't have the admin role yet. Add a row to the <code className="font-mono text-xs">user_roles</code> table with your user ID and role <code className="font-mono text-xs">admin</code> via Cloud.</p>
        <Button asChild variant="outline"><Link to="/">Back to site</Link></Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-muted/30">
      <aside className="w-64 shrink-0 border-r border-border/60 bg-card hidden md:flex flex-col p-4">
        <Link to="/" className="flex items-center gap-2 mb-8 px-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-accent grid place-items-center font-display font-bold text-primary-foreground">S</div>
          <div>
            <div className="font-display font-semibold text-sm">Suwam</div>
            <div className="text-xs text-muted-foreground">Admin</div>
          </div>
        </Link>
        <nav className="flex-1 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-smooth ${isActive ? "bg-gradient-accent text-primary-foreground shadow-elegant" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
              <Icon className="h-4 w-4" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-1 pt-4 border-t border-border/60">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-muted text-muted-foreground"><Home className="h-4 w-4" /> Public site</Link>
          <button onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm hover:bg-muted text-muted-foreground"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 sm:p-10 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
