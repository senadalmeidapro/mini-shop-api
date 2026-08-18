import { Router } from 'express';
import { authenticateMiddleware } from '../middlewares/authanticateMiddleware.ts';
import { OrderController } from '../controllers/order.controller.ts';
import { validateMiddleware } from '../middlewares/validateMiddleware.ts';
import { idSchema, paginationSchema } from '../schema/utils.schema.ts';
import { orderSchema } from '../schema/order.schema.ts';

const router = Router();
const order = new OrderController();

router.use(authenticateMiddleware);

router
  .route('/')
  .get(validateMiddleware({ query: paginationSchema }), order.getMany.bind(order))
  .post(validateMiddleware({ body: orderSchema }), order.create.bind(order));

router
  .route('/:id')
  .get(validateMiddleware({ params: idSchema }), order.get.bind(order))
  .patch(
    validateMiddleware({ params: idSchema, body: orderSchema.partial() }),
    order.update.bind(order),
  )
  .delete(validateMiddleware({ params: idSchema }), order.delete.bind(order));

export default router;
