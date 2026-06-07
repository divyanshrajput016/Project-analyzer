import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, Bot, FileQuestion, FileText, LogOut, Search, Shield, Upload, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/upload", label: "Analyze", icon: Upload },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/chat", label: "Repository Chat", icon: Bot },
  { to: "/interview", label: "Interview Mode", icon: FileQuestion },
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
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-[#050506] dark:text-zinc-50">
      <div className="fixed inset-y-0 left-0 hidden w-72 border-r border-zinc-200/70 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80 lg:block">
        <Link to="/dashboard" className="flex h-16 items-center gap-3 border-b border-zinc-200/70 px-6 dark:border-zinc-800">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-950 text-sm font-black text-white dark:bg-white dark:text-zinc-950">CA</span>
          <div>
            <p className="font-bold leading-none">CodeAtlas</p>
            <p className="mt-1 text-xs text-zinc-500">Repository intelligence</p>
          </div>
        </Link>
        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-zinc-950 text-white shadow-sm dark:bg-white dark:text-zinc-950" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"}`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
          {user?.role === "admin" && (
            <NavLink to="/admin" className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium ${isActive ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"}`}>
              <Shield className="h-4 w-4" />
              Admin
            </NavLink>
          )}
        </nav>
        <div className="absolute bottom-4 left-3 right-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
          <p className="text-sm font-semibold">{user?.name}</p>
          <p className="mt-1 truncate text-xs text-zinc-500">{user?.email}</p>
        </div>
      </div>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200/70 bg-white/80 px-4 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80 lg:px-8">
          <Link to="/dashboard" className="font-bold lg:hidden">CodeAtlas</Link>
          <div className="hidden h-10 w-full max-w-xl items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 lg:flex">
            <Search className="h-4 w-4" />
            Search reports, APIs, models, security issues
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="accent" size="sm">
              <Link to="/upload">New analysis</Link>
            </Button>
            <ThemeToggle />
            <Button onClick={handleLogout} variant="outline" size="icon" title="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mx-auto max-w-7xl px-4 py-6 lg:px-8"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}

