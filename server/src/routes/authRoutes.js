import express from 'express';
const router = express.Router();

import { register, login, getMe, updateProfile, changePassword } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { validateRegister, validateLogin } from '../middleware/validation';


router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);


router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

export default router;