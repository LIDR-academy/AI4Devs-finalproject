import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { buildOpenApiDocument } from '../docs/openapi';

const docsRouter = Router();
const document = buildOpenApiDocument();

docsRouter.get('/docs.json', (_req, res) => {
  res.json(document);
});

docsRouter.use('/docs', swaggerUi.serve, swaggerUi.setup(document));

export { docsRouter };
