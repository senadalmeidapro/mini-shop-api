import express, { type Express } from 'express';
import { errorMiddleware, loggerMiddleware, notFoundMiddleware } from './middlewares/index.ts';
import userRouter from './routes/user.route.ts';
import addressRouter from './routes/address.route.ts';
import productRouter from './routes/product.route.ts';
import orderRouter from './routes/order.route.ts';
import orderItemRouter from './routes/order.item.route.ts';
import paymentRouter from './routes/payment.route.ts';

const app: Express = express();

app.use(express.json());

app.use(loggerMiddleware);

app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);
app.use('/api/product', productRouter);
app.use('/api/payments', paymentRouter);
app.use('/api/addressess', addressRouter);
app.use('/api/order-items', orderItemRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
