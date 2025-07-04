import express from 'express';
import { getUserInfo, updateUserProfile } from '../controllers/habit.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyToken);
router.get('/me', getUserInfo);
router.patch('/me', updateUserProfile);

export default router; 