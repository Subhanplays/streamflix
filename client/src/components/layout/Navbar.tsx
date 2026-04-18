"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

const links = [
  { href: "/", label: "Home" },
  { href: "/browse", label: "Browse" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  return (
    <header className="glass-nav fixed top-0 z-50 w-full">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3.5 md:gap-8 md:px-8">
        <Link
          href="/"
          className="text-xl font-black tracking-tighter text-netflix drop-shadow-[0_0_20px_rgba(229,9,20,0.35)] md:text-2xl"
        >
          Streamflix
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-white/10 text-white shadow-inner"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          {user?.role === "admin" ? (
            <Link
              href="/admin"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                pathname?.startsWith("/admin")
                  ? "bg-netflix/20 text-white ring-1 ring-netflix/40"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              Admin
            </Link>
          ) : null}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <Link
            href="/browse"
            className="rounded-full p-2.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>
          {!loading && user ? (
            <>
              <Link
                href="/profile"
                className="flex max-w-[140px] items-center gap-2 truncate rounded-full px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/10"
              >
                <User className="h-4 w-4 shrink-0" />
                <span className="hidden truncate sm:inline">{user.name}</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-netflix px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-netflix/20 transition hover:bg-netflix-dark hover:shadow-netflix/30"
              >
                Sign out
              </button>
            </>
          ) : !loading ? (
            <>
              <Link href="/login" className="rounded-full px-3 py-2 text-sm text-zinc-300 hover:text-white">
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Join
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
