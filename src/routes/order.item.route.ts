import { Router } from 'express';
import { authenticateMiddleware } from '../middlewares/authanticateMiddleware.ts';
import { OrderItemController } from '../controllers/order.item.controller.ts';
import { validateMiddleware } from '../middlewares/validateMiddleware.ts';
import { idSchema, paginationSchema } from '../schema/utils.schema.ts';
import { userSchema } from '../schema/user.schema.ts';

const router = Router();
const user = new OrderItemController();

router.use(authenticateMiddleware);

router
  .route('/')
  .get(validateMiddleware({ query: paginationSchema }), user.getMany.bind(user))
  .post(validateMiddleware({ body: userSchema }), user.create.bind(user));

router
  .route('/:id')
  .get(validateMiddleware({ params: idSchema }), user.get.bind(user))
  .patch(
    validateMiddleware({ params: idSchema, body: userSchema.partial() }),
    user.update.bind(user),
  )
  .delete(validateMiddleware({ params: idSchema }), user.delete.bind(user));

export default router;
