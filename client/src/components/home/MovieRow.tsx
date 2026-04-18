"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { Movie } from "@/types";

type Props = {
  title: string;
  movies: Movie[];
  loading?: boolean;
};

export function MovieRow({ title, movies, loading }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -720 : 720, behavior: "smooth" });
  };

  if (loading) {
    return (
      <section className="mb-12 px-4 md:px-8">
        <div className="skeleton mb-5 h-7 w-48 rounded-lg" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-40 w-56 shrink-0 rounded-xl md:h-44 md:w-64" />
          ))}
        </div>
      </section>
    );
  }

  if (!movies.length) return null;

  return (
    <section className="group/row relative mb-12 px-4 md:px-8">
      <h2 className="mb-4 text-lg font-bold tracking-tight text-white md:text-xl">{title}</h2>
      <button
        type="button"
        aria-label="Scroll left"
        onClick={() => scroll("left")}
        className="absolute left-1 top-[52%] z-10 hidden h-[72%] w-11 -translate-y-1/2 items-center justify-center rounded-r-xl bg-gradient-to-r from-black/90 to-transparent opacity-0 transition group-hover/row:opacity-100 hover:from-black md:flex"
      >
        <ChevronLeft className="h-9 w-9 text-white drop-shadow-lg" />
      </button>
      <button
        type="button"
        aria-label="Scroll right"
        onClick={() => scroll("right")}
        className="absolute right-1 top-[52%] z-10 hidden h-[72%] w-11 -translate-y-1/2 items-center justify-center rounded-l-xl bg-gradient-to-l from-black/90 to-transparent opacity-0 transition group-hover/row:opacity-100 hover:from-black md:flex"
      >
        <ChevronRight className="h-9 w-9 text-white drop-shadow-lg" />
      </button>
      <div ref={ref} className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
        {movies.map((m) => (
          <Link
            key={m._id}
            href={`/movie/${m._id}`}
            className="row-hover card-tile relative h-40 w-56 shrink-0 md:h-44 md:w-64"
          >
            <Image
              src={m.thumbnailUrl || "/placeholder.svg"}
              alt={m.title}
              fill
              className="object-cover"
              sizes="256px"
              unoptimized={!m.thumbnailUrl || m.thumbnailUrl.startsWith("http")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80" />
            <span className="absolute bottom-3 left-3 right-3 text-xs font-semibold leading-snug text-white drop-shadow-md md:text-sm line-clamp-2">
              {m.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
