"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";

export default function AdminDashboardPage() {
  const [data, setData] = useState<{
    totalUsers: number;
    totalMovies: number;
    popular: { id: string; title: string; views: number; thumbnailUrl: string }[];
  } | null>(null);

  useEffect(() => {
    api.admin
      .dashboard()
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-zinc-900 p-6 ring-1 ring-zinc-800">
          <p className="text-sm text-zinc-400">Total users</p>
          <p className="text-4xl font-bold">{data.totalUsers}</p>
        </div>
        <div className="rounded-lg bg-zinc-900 p-6 ring-1 ring-zinc-800">
          <p className="text-sm text-zinc-400">Total movies</p>
          <p className="text-4xl font-bold">{data.totalMovies}</p>
        </div>
        <div className="rounded-lg bg-zinc-900 p-6 ring-1 ring-zinc-800">
          <p className="text-sm text-zinc-400">Popular (by views)</p>
          <p className="text-lg font-semibold text-zinc-200">Top 5 below</p>
        </div>
      </div>
      <h2 className="mb-4 text-xl font-semibold">Most popular content</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {data.popular.map((m) => (
          <Link
            key={m.id}
            href={`/admin/movies/${m.id}/edit`}
            className="overflow-hidden rounded-lg bg-zinc-900 ring-1 ring-zinc-800"
          >
            <div className="relative aspect-video">
              <Image
                src={m.thumbnailUrl || "/placeholder.svg"}
                alt={m.title}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="p-3">
              <p className="truncate font-medium">{m.title}</p>
              <p className="text-sm text-zinc-500">{m.views} views</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
