import { Router } from 'express';
import { authenticateMiddleware } from '../middlewares/authanticateMiddleware.ts';
import { PaymentController } from '../controllers/payment.controller.ts';
import { validateMiddleware } from '../middlewares/validateMiddleware.ts';
import { idSchema, paginationSchema } from '../schema/utils.schema.ts';
import { paymentSchema } from '../schema/payment.schema.ts';

const router = Router();
const payment = new PaymentController();

router.use(authenticateMiddleware);

router
  .route('/')
  .get(validateMiddleware({ query: paginationSchema }), payment.getMany.bind(payment))
  .post(validateMiddleware({ body: paymentSchema }), payment.create.bind(payment));

router
  .route('/:id')
  .get(validateMiddleware({ params: idSchema }), payment.get.bind(payment))
  .patch(
    validateMiddleware({ params: idSchema, body: paymentSchema.partial() }),
    payment.update.bind(payment),
  )
  .delete(validateMiddleware({ params: idSchema }), payment.delete.bind(payment));

export default router;
