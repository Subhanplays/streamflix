"use client";

import { useRouter } from "next/navigation";
import { MovieForm, toPayload } from "@/components/admin/MovieForm";
import { api } from "@/lib/api";

export default function NewMoviePage() {
  const router = useRouter();

  return (
    <div>
      <h2 className="mb-8 text-xl font-semibold">Add movie</h2>
      <MovieForm
        submitLabel="Create movie"
        onSubmit={async (values) => {
          const res = await api.movies.create(toPayload(values));
          const m = res.movie as { _id: string };
          if (!m?._id) throw new Error("Invalid response");
          router.push(`/admin/movies/${m._id}/edit`);
        }}
      />
    </div>
  );
}
