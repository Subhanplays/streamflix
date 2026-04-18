import { body } from 'express-validator';

export const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 120 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];
