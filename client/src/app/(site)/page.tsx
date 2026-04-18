"use client";

import { useEffect, useState } from "react";
import { HeroBanner } from "@/components/home/HeroBanner";
import { MovieRow } from "@/components/home/MovieRow";
import { api } from "@/lib/api";
import type { Movie } from "@/types";

export default function HomePage() {
  const [featured, setFeatured] = useState<Movie[]>([]);
  const [rows, setRows] = useState<{ title: string; items: Movie[] }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const home = await api.movies.home();
        if (cancelled) return;
        const feat = (home.featured as Movie[]) || [];
        const trending = (home.trending as Movie[]) || [];
        const byGenre = (home.rows || []) as { title: string; items: Movie[] }[];
        setFeatured(feat.length ? feat : trending.slice(0, 6));
        setRows([
          { title: "Trending now", items: trending.slice(0, 12) },
          ...byGenre.filter((x) => x.items.length),
        ]);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const heroMovie = featured[0] ?? null;

  return (
    <div>
      <HeroBanner movie={heroMovie} loading={loading} />
      <div className="-mt-20 relative z-20 space-y-1 pb-20">
        <MovieRow title="Featured" movies={featured} loading={loading} />
        {rows.map((row) => (
          <MovieRow key={row.title} title={row.title} movies={row.items} loading={loading} />
        ))}
      </div>
    </div>
  );
}
