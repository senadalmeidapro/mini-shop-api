import type { Request, Response, NextFunction } from 'express';

export const authenticateMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log('this is the users router middleware for authenticaetion');

  next();
};
