import express from 'express';
const router = express.Router();
import { getStats, healthCheck } from '../controllers/adminController';

router.get('/stats', getStats);
router.get('/health', healthCheck);

export default router;