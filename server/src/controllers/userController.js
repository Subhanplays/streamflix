import {
  findMovieById,
  findUserById,
  updateUserById,
} from '../db/store.js';

function upsertWatchEntry(history, { movieId, progress, duration, episodeIndex }) {
  const id = movieId.toString();
  const list = history || [];
  const idx = list.findIndex((h) => h.movieId === id);
  const entry = {
    movieId: id,
    progress: Math.max(0, progress || 0),
    duration: Math.max(0, duration || 0),
    episodeIndex: episodeIndex == null ? null : Number(episodeIndex),
    updatedAt: new Date().toISOString(),
  };
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...entry };
  } else {
    list.push(entry);
  }
  return list;
}

export async function updateProgress(req, res) {
  const { movieId, progress, duration, episodeIndex } = req.body;
  const movie = findMovieById(movieId);
  if (!movie) {
    return res.status(404).json({ message: 'Movie not found' });
  }
  const user = findUserById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const watchHistory = upsertWatchEntry(user.watchHistory, {
    movieId,
    progress,
    duration,
    episodeIndex,
  });
  updateUserById(req.userId, { watchHistory });
  res.json({ watchHistory });
}

export async function getWatchHistory(req, res) {
  const user = findUserById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const raw = user.watchHistory || [];
  const entries = raw
    .map((h) => ({
      ...h,
      movie: findMovieById(h.movieId),
    }))
    .filter((h) => h.movie && h.movie.title)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json({ entries });
}

export async function toggleFavorite(req, res) {
  const { movieId } = req.params;
  const movie = findMovieById(movieId);
  if (!movie) {
    return res.status(404).json({ message: 'Movie not found' });
  }
  const user = findUserById(req.userId);
  const favs = [...(user.favorites || [])].map(String);
  const i = favs.indexOf(movieId);
  if (i >= 0) {
    favs.splice(i, 1);
  } else {
    favs.push(movieId);
  }
  updateUserById(req.userId, { favorites: favs });
  res.json({ favorites: favs });
}

export async function getFavorites(req, res) {
  const user = findUserById(req.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const items = (user.favorites || [])
    .map((id) => findMovieById(id))
    .filter(Boolean);
  res.json({ items });
}
