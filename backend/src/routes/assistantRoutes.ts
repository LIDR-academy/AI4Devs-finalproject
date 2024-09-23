import express from 'express';
import { getOpenAIResponse } from '../services/OpenAIService';

const router = express.Router();

router.post('/ikigoo-assistant', async (req, res) => {
  const { threadId, prompt } = req.body;
  try {
    const response = await getOpenAIResponse(threadId, prompt);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching response from OpenAI' });
  }
});

export default router;