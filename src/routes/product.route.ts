import { Router } from 'express';
import { authenticateMiddleware } from '../middlewares/authanticateMiddleware.ts';
import { ProductController } from '../controllers/product.controller.ts';
import { validateMiddleware } from '../middlewares/validateMiddleware.ts';
import { idSchema, paginationSchema } from '../schema/utils.schema.ts';
import { productSchema } from '../schema/product.schema.ts';

const router = Router();
const product = new ProductController();

router.use(authenticateMiddleware);

router
  .route('/')
  .get(validateMiddleware({ query: paginationSchema }), product.getMany.bind(product))
  .post(validateMiddleware({ body: productSchema }), product.create.bind(product));

router
  .route('/:id')
  .get(validateMiddleware({ params: idSchema }), product.get.bind(product))
  .patch(
    validateMiddleware({ params: idSchema, body: productSchema.partial() }),
    product.update.bind(product),
  )
  .delete(validateMiddleware({ params: idSchema }), product.delete.bind(product));

export default router;
