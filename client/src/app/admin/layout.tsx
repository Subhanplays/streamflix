"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#141414]">
        <div className="skeleton h-12 w-48 rounded" />
      </div>
    );
  }

  const tabs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/movies", label: "Movies" },
  ];

  return (
    <div className="min-h-screen bg-[#141414] pt-4">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-netflix">Admin</h1>
          <nav className="flex gap-4">
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={`text-sm font-medium ${
                  pathname === t.href ? "text-white" : "text-zinc-500 hover:text-white"
                }`}
              >
                {t.label}
              </Link>
            ))}
            <Link href="/" className="text-sm text-zinc-500 hover:text-white">
              ← Site
            </Link>
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
}
