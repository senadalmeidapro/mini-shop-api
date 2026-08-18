import { Router } from 'express';
import { authenticateMiddleware } from '../middlewares/authanticateMiddleware.ts';
import { AddressController } from '../controllers/address.controller.ts';
import { validateMiddleware } from '../middlewares/validateMiddleware.ts';
import { idSchema, paginationSchema } from '../schema/utils.schema.ts';
import { addressSchema } from '../schema/address.schema.ts';

const router = Router();
const address = new AddressController();

router.use(authenticateMiddleware);

router
  .route('/')
  .get(validateMiddleware({ query: paginationSchema }), address.getMany.bind(address))
  .post(validateMiddleware({ body: addressSchema }), address.create.bind(address));

router
  .route('/:id')
  .get(validateMiddleware({ params: idSchema }), address.get.bind(address))
  .patch(
    validateMiddleware({ params: idSchema, body: addressSchema.partial() }),
    address.update.bind(address),
  )
  .delete(validateMiddleware({ params: idSchema }), address.delete.bind(address));

export default router;
