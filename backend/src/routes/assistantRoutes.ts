import express from 'express';
import { AssistantController } from '../controllers/AssistantController';

const router = express.Router();
const assistantController = new AssistantController();

router.post('/', (req, res, next) => assistantController.getResponse(req, res, next));

export default router;