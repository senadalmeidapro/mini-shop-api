import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';

interface ValidationSchemas<
  TBody extends ZodType | undefined = undefined,
  TParams extends ZodType | undefined = undefined,
  TQuery extends ZodType | undefined = undefined,
> {
  body?: TBody;
  params?: TParams;
  query?: TQuery;
}

export const validateMiddleware = <
  TBody extends ZodType | undefined,
  TParams extends ZodType | undefined,
  TQuery extends ZodType | undefined,
>(
  schemas: ValidationSchemas<TBody, TParams, TQuery>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.validated = {
        body: schemas.body ? schemas.body.parse(req.body) : undefined,

        params: schemas.params ? schemas.params.parse(req.params) : undefined,

        query: schemas.query ? schemas.query.parse(req.query) : undefined,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};
