import { Router } from 'express';
import agentController from '../controllers/agent.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/agent/config:
 *   get:
 *     summary: Get current agent configuration
 *     tags: [Agent]
 *     responses:
 *       200:
 *         description: Agent configuration retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AgentConfig'
 *       404:
 *         description: No agent configuration found
 *       500:
 *         description: Server error
 */
router.get('/config', agentController.getAgentConfig.bind(agentController));

/**
 * @swagger
 * /api/agent/config/health:
 *   get:
 *     summary: Check if agent configuration exists in database
 *     tags: [Agent]
 *     responses:
 *       200:
 *         description: Agent configuration health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 hasConfig:
 *                   type: boolean
 *                   example: true
 *                 configCount:
 *                   type: number
 *                   example: 1
 *       500:
 *         description: Server error
 */
router.get('/config/health', agentController.getAgentConfigHealth.bind(agentController));

router.put('/config', authenticate, agentController.updateAgentConfig.bind(agentController));

export default router; 