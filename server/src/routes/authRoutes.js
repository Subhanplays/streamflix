import { Router } from 'express';
import { registerRules, loginRules } from '../validators/auth.js';
import { handleValidation } from '../middleware/validate.js';
import { authRequired } from '../middleware/auth.js';
import * as auth from '../controllers/authController.js';

const r = Router();

r.post('/register', registerRules, handleValidation, auth.register);
r.post('/login', loginRules, handleValidation, auth.login);
r.get('/me', authRequired, auth.me);

export default r;
