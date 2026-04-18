"use client";

import { useState } from "react";
import type { Episode } from "@/types";

export type MovieFormValues = {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  trailerUrl: string;
  genre: string;
  releaseYear: string;
  isFeatured: boolean;
  isSeries: boolean;
  episodes: Episode[];
};

const empty: MovieFormValues = {
  title: "",
  description: "",
  videoUrl: "",
  thumbnailUrl: "",
  trailerUrl: "",
  genre: "",
  releaseYear: "",
  isFeatured: false,
  isSeries: false,
  episodes: [],
};

export function MovieForm({
  initial,
  onSubmit,
  submitLabel,
}: {
  initial?: Partial<MovieFormValues>;
  onSubmit: (values: MovieFormValues) => Promise<void>;
  submitLabel: string;
}) {
  const [values, setValues] = useState<MovieFormValues>({ ...empty, ...initial });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof MovieFormValues, v: string | boolean | Episode[]) =>
    setValues((s) => ({ ...s, [k]: v }));

  const addEpisode = () => {
    const n = values.episodes.length + 1;
    set("episodes", [
      ...values.episodes,
      { title: `Episode ${n}`, videoUrl: "", episodeNumber: n },
    ]);
  };

  const updateEp = (i: number, patch: Partial<Episode>) => {
    const next = values.episodes.map((e, j) => (j === i ? { ...e, ...patch } : e));
    set("episodes", next);
  };

  const removeEp = (i: number) => {
    set(
      "episodes",
      values.episodes.filter((_, j) => j !== i)
    );
  };

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await onSubmit(values);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handle} className="max-w-2xl space-y-5">
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Title *</label>
        <input
          required
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          className="w-full rounded bg-zinc-900 px-3 py-2 ring-1 ring-zinc-700"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Description</label>
        <textarea
          rows={4}
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          className="w-full rounded bg-zinc-900 px-3 py-2 ring-1 ring-zinc-700"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Video URL * (MP4 or HLS)</label>
        <input
          required
          value={values.videoUrl}
          onChange={(e) => set("videoUrl", e.target.value)}
          placeholder="https://..."
          className="w-full rounded bg-zinc-900 px-3 py-2 ring-1 ring-zinc-700"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Thumbnail URL</label>
        <input
          value={values.thumbnailUrl}
          onChange={(e) => set("thumbnailUrl", e.target.value)}
          className="w-full rounded bg-zinc-900 px-3 py-2 ring-1 ring-zinc-700"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Trailer URL (hover on hero)</label>
        <input
          value={values.trailerUrl}
          onChange={(e) => set("trailerUrl", e.target.value)}
          className="w-full rounded bg-zinc-900 px-3 py-2 ring-1 ring-zinc-700"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Genres (comma separated)</label>
        <input
          value={values.genre}
          onChange={(e) => set("genre", e.target.value)}
          placeholder="Action, Sci-Fi"
          className="w-full rounded bg-zinc-900 px-3 py-2 ring-1 ring-zinc-700"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm text-zinc-400">Release year</label>
        <input
          type="number"
          value={values.releaseYear}
          onChange={(e) => set("releaseYear", e.target.value)}
          className="w-full rounded bg-zinc-900 px-3 py-2 ring-1 ring-zinc-700"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.isFeatured}
          onChange={(e) => set("isFeatured", e.target.checked)}
        />
        Featured on home
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.isSeries}
          onChange={(e) => set("isSeries", e.target.checked)}
        />
        Series (multiple episodes)
      </label>
      {values.isSeries ? (
        <div className="rounded-lg bg-zinc-900/50 p-4 ring-1 ring-zinc-800">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-medium">Episodes</span>
            <button
              type="button"
              onClick={addEpisode}
              className="text-sm text-netflix hover:underline"
            >
              + Add episode
            </button>
          </div>
          <div className="space-y-3">
            {values.episodes.map((ep, i) => (
              <div key={i} className="grid gap-2 rounded border border-zinc-800 p-3 md:grid-cols-[1fr_2fr_auto] md:items-end">
                <div>
                  <label className="text-xs text-zinc-500">Ep #</label>
                  <input
                    type="number"
                    min={1}
                    value={ep.episodeNumber}
                    onChange={(e) => updateEp(i, { episodeNumber: Number(e.target.value) })}
                    className="w-full rounded bg-zinc-900 px-2 py-1 text-sm ring-1 ring-zinc-700"
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="text-xs text-zinc-500">Title</label>
                  <input
                    value={ep.title}
                    onChange={(e) => updateEp(i, { title: e.target.value })}
                    className="w-full rounded bg-zinc-900 px-2 py-1 text-sm ring-1 ring-zinc-700"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-zinc-500">Video URL</label>
                  <input
                    value={ep.videoUrl}
                    onChange={(e) => updateEp(i, { videoUrl: e.target.value })}
                    className="w-full rounded bg-zinc-900 px-2 py-1 text-sm ring-1 ring-zinc-700"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeEp(i)}
                  className="text-xs text-red-400 hover:underline md:col-span-3"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {err ? <p className="text-sm text-red-400">{err}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-netflix px-6 py-2.5 font-semibold text-white hover:bg-netflix-dark disabled:opacity-50"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}

export function toPayload(values: MovieFormValues) {
  const genre = values.genre
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
  const releaseYear = values.releaseYear ? Number(values.releaseYear) : undefined;
  const episodes =
    values.isSeries && values.episodes.length
      ? values.episodes.map((e) => ({
          title: e.title,
          videoUrl: e.videoUrl,
          episodeNumber: e.episodeNumber,
        }))
      : [];
  return {
    title: values.title,
    description: values.description,
    videoUrl: values.videoUrl,
    thumbnailUrl: values.thumbnailUrl || undefined,
    trailerUrl: values.trailerUrl || undefined,
    genre,
    releaseYear,
    isFeatured: values.isFeatured,
    isSeries: values.isSeries,
    episodes: values.isSeries ? episodes : [],
  };
}
