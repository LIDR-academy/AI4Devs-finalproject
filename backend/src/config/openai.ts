import OpenAI from "openai";

const openAIClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION,
  project: process.env.OPENAI_PROJECT,
});

openAIClient.timeout = 300000;

export default openAIClient;