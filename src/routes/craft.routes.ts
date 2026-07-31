import { Router } from 'express';
import * as craftController from '../controllers/craft.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  craftCreateSchema,
  craftQuerySchema,
  craftUpdateSchema,
} from '../utils/validators';

const router = Router();

router.get('/', validate(craftQuerySchema, 'query'), craftController.list);
router.get('/manage/mine', authenticate, craftController.manageMine);
router.get('/:id', craftController.getById);
router.post('/', authenticate, validate(craftCreateSchema), craftController.create);
router.patch('/:id', authenticate, validate(craftUpdateSchema), craftController.update);
router.delete('/:id', authenticate, craftController.remove);

export default router;
