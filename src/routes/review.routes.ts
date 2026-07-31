import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { reviewSchema } from '../utils/validators';

const router = Router();

router.get('/:craftId', reviewController.list);
router.post('/:craftId', authenticate, validate(reviewSchema), reviewController.create);

export default router;
