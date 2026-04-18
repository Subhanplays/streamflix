import { Router } from 'express';
import { handleValidation } from '../middleware/validate.js';
import { authRequired } from '../middleware/auth.js';
import { progressRules, movieIdParam } from '../validators/user.js';
import * as user from '../controllers/userController.js';

const r = Router();

r.use(authRequired);

r.post('/progress', progressRules, handleValidation, user.updateProgress);
r.get('/watch-history', user.getWatchHistory);
r.post('/favorites/:movieId', movieIdParam, handleValidation, user.toggleFavorite);
r.get('/favorites', user.getFavorites);

export default r;
