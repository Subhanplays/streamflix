"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Movie } from "@/types";

export default function AdminMoviesPage() {
  const [items, setItems] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () =>
    api.movies
      .list({ limit: 100, page: 1 })
      .then((r) => setItems(r.items as Movie[]))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this movie?")) return;
    await api.movies.delete(id);
    setItems((prev) => prev.filter((m) => m._id !== id));
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold">All movies</h2>
        <Link
          href="/admin/movies/new"
          className="inline-flex items-center gap-2 rounded bg-netflix px-4 py-2 text-sm font-semibold text-white hover:bg-netflix-dark"
        >
          <Plus className="h-4 w-4" />
          Add movie
        </Link>
      </div>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg ring-1 ring-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="p-3">Thumb</th>
                <th className="p-3">Title</th>
                <th className="p-3">Year</th>
                <th className="p-3">Featured</th>
                <th className="p-3 w-28" />
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m._id} className="border-t border-zinc-800">
                  <td className="p-3">
                    <div className="relative h-12 w-20 overflow-hidden rounded bg-zinc-800">
                      <Image
                        src={m.thumbnailUrl || "/placeholder.svg"}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </td>
                  <td className="p-3 font-medium">{m.title}</td>
                  <td className="p-3 text-zinc-400">{m.releaseYear ?? "—"}</td>
                  <td className="p-3">{m.isFeatured ? "Yes" : "—"}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/movies/${m._id}/edit`}
                        className="rounded p-2 hover:bg-zinc-800"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(m._id)}
                        className="rounded p-2 text-red-400 hover:bg-zinc-800"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
