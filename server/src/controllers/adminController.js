import { countMovies, countUsers, listMoviesSorted } from '../db/store.js';

export async function dashboard(req, res) {
  const topMovies = listMoviesSorted()
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);
  res.json({
    totalUsers: countUsers(),
    totalMovies: countMovies(),
    popular: topMovies.map((m) => ({
      id: m._id,
      title: m.title,
      views: m.views || 0,
      thumbnailUrl: m.thumbnailUrl,
    })),
  });
}
