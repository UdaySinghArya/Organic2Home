import { Router } from 'express';
import { openApiSpec } from '../docs/openapi.js';

export const docsRouter = Router();

docsRouter.get('/', (_req, res) => {
  res.json(openApiSpec);
});
