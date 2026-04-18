import { body, param, query } from 'express-validator';

export const createMovieRules = [
  body('title').trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().isString().isLength({ max: 10000 }),
  body('videoUrl').trim().notEmpty().isLength({ max: 2048 }).withMessage('Video URL required'),
  body('thumbnailUrl').optional().isString(),
  body('trailerUrl').optional().isString(),
  body('genre').optional().isArray(),
  body('genre.*').optional().trim().isLength({ max: 64 }),
  body('releaseYear').optional().isInt({ min: 1900, max: 2100 }),
  body('isFeatured').optional().isBoolean(),
  body('isSeries').optional().isBoolean(),
  body('episodes').optional().isArray(),
];

export const updateMovieRules = [
  param('id').isUUID(4),
  body('title').optional().trim().notEmpty(),
  body('videoUrl').optional().trim().notEmpty().isLength({ max: 2048 }),
  body('thumbnailUrl').optional().isString(),
  body('trailerUrl').optional().isString(),
  body('description').optional().isString(),
  body('genre').optional().isArray(),
  body('releaseYear').optional().isInt({ min: 1900, max: 2100 }),
  body('isFeatured').optional().isBoolean(),
  body('isSeries').optional().isBoolean(),
  body('episodes').optional().isArray(),
];

export const listMoviesRules = [
  query('q').optional().trim().isLength({ max: 200 }),
  query('genre').optional().trim(),
  query('year').optional().isInt({ min: 1900, max: 2100 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
];

export const idParam = [param('id').isUUID(4)];
