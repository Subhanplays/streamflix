import { Router } from 'express';
import {
  createMovieRules,
  updateMovieRules,
  listMoviesRules,
  idParam,
} from '../validators/movie.js';
import { handleValidation } from '../middleware/validate.js';
import { authRequired, adminOnly } from '../middleware/auth.js';
import * as movie from '../controllers/movieController.js';

const r = Router();

r.get('/', listMoviesRules, handleValidation, movie.listMovies);
r.get('/home', movie.homeFeed);
r.get('/featured', movie.featuredMovies);
r.get('/genres', movie.genres);
r.get('/:id', idParam, handleValidation, movie.getMovie);

r.post('/', authRequired, adminOnly, createMovieRules, handleValidation, movie.createMovie);
r.patch('/:id', authRequired, adminOnly, updateMovieRules, handleValidation, movie.updateMovie);
r.delete('/:id', authRequired, adminOnly, idParam, handleValidation, movie.deleteMovie);

export default r;
