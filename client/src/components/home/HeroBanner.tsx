"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Info, Play } from "lucide-react";
import type { Movie } from "@/types";

type Props = {
  movie: Movie | null;
  loading?: boolean;
};

export function HeroBanner({ movie, loading }: Props) {
  const [hover, setHover] = useState(false);

  if (loading || !movie) {
    return (
      <section className="relative h-[72vh] min-h-[440px] w-full overflow-hidden">
        <div className="skeleton absolute inset-0 rounded-none" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="skeleton mb-4 h-12 w-2/3 max-w-xl rounded-lg" />
          <div className="skeleton mb-2 h-4 w-full max-w-2xl rounded-md" />
          <div className="skeleton h-4 w-5/6 max-w-2xl rounded-md" />
        </div>
      </section>
    );
  }

  const bg = movie.thumbnailUrl || "/placeholder.svg";
  const trailer = movie.trailerUrl;

  return (
    <section
      className="relative h-[72vh] min-h-[440px] w-full overflow-hidden"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="absolute inset-0">
        {hover && trailer ? (
          <video className="h-full w-full object-cover" src={trailer} autoPlay muted loop playsInline />
        ) : (
          <Image
            src={bg}
            alt={movie.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
            unoptimized={bg.startsWith("http")}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-black/50" />
      </div>
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-14 pt-28 md:px-8 md:pb-20">
        <h1 className="mb-3 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight drop-shadow-2xl md:text-6xl md:leading-[1.02]">
          {movie.title}
        </h1>
        <p className="mb-8 max-w-xl text-sm leading-relaxed text-zinc-300 line-clamp-3 md:text-base md:leading-relaxed">
          {movie.description}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/watch/${movie._id}`}
            className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-bold text-black shadow-xl shadow-black/40 transition hover:scale-[1.02] hover:bg-zinc-100 active:scale-[0.98]"
          >
            <Play className="h-5 w-5 fill-black" />
            Watch Now
          </Link>
          <Link
            href={`/movie/${movie._id}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <Info className="h-5 w-5" />
            More info
          </Link>
        </div>
      </div>
    </section>
  );
}
