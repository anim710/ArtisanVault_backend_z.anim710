import { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';

export function validate(schema: ZodTypeAny, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.parse(req[source]);
    // Express query is read-only typed; assign for downstream handlers
    (req as Request & Record<string, unknown>)[source] = parsed;
    next();
  };
}
