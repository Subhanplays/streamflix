import { Router } from 'express';
import { authRequired, adminOnly } from '../middleware/auth.js';
import * as admin from '../controllers/adminController.js';

const r = Router();

r.use(authRequired, adminOnly);
r.get('/dashboard', admin.dashboard);

export default r;
