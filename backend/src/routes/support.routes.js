import express from 'express';
import { createBugReport } from '../controllers/bug.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyToken);
router.post('/report', createBugReport);

export default router;

