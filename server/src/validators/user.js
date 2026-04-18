import { body, param } from 'express-validator';

export const progressRules = [
  body('movieId').isUUID(4),
  body('progress').isFloat({ min: 0 }),
  body('duration').optional().isFloat({ min: 0 }),
  body('episodeIndex').optional().isInt({ min: 0 }),
];

export const movieIdParam = [param('movieId').isUUID(4)];
