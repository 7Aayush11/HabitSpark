import express from 'express';
import {
  createHabit,
  getHabits,
  updateHabit,
  deleteHabit,
  checkinHabitController,
  getAnalytics,
} from '../controllers/habit.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyToken); // All routes are protected

router.post('/', createHabit);
router.get('/', getHabits);
router.put('/:id', updateHabit);
router.delete('/:id', deleteHabit);
router.post('/:id/checkin', checkinHabitController);
router.get('/analytics', getAnalytics);

export default router;
