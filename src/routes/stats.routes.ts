import { Router } from 'express';
import * as statsController from '../controllers/stats.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/overview', authenticate, statsController.overview);

export default router;
