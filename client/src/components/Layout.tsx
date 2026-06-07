import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, Bot, FileText, LogOut, Shield, Upload, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/upload", label: "Upload", icon: Upload },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/chat", label: "Chat", icon: Bot },
  { to: "/profile", label: "Profile", icon: UserRound }
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-zinc-200 bg-white lg:block">
        <Link to="/dashboard" className="flex h-16 items-center border-b border-zinc-200 px-6 text-xl font-bold">
          CodeAtlas
        </Link>
        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"}`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
          {user?.role === "admin" && (
            <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100"}`}>
              <Shield className="h-4 w-4" />
              Admin
            </NavLink>
          )}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-4 backdrop-blur lg:px-8">
          <Link to="/dashboard" className="font-bold lg:hidden">CodeAtlas</Link>
          <div className="hidden text-sm text-zinc-500 lg:block">Repository intelligence workspace</div>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-100">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

