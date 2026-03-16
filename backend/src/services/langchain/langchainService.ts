import { AIMessage, BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import logger from '../../utils/logger';
import { createDocumentsTool } from './tools/documentsTool';
import { createFAQsTool } from './tools/faqsTool';
import { createProductsTool } from './tools/productsTool';
import { createProfileTool } from './tools/profileTool';
import { createServicesTool } from './tools/servicesTool';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface LangChainConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  prompt: string;
}

export class LangChainService {
  private llm: ChatOpenAI;
  private agent!: AgentExecutor;
  private tools: any[];
  private config: LangChainConfig;
  private initPromise: Promise<void>;

  constructor(config: LangChainConfig) {
    this.config = config;
    
    // Initialize OpenAI with OpenRouter
    this.llm = new ChatOpenAI({
      modelName: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      topP: config.topP,
      openAIApiKey: process.env.OPENROUTER_API_KEY,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://gusto-italiano.com',
          'X-Title': 'Gusto Italiano Assistant'
        }
      }
    });

    // Create tools
    this.tools = [
      createProductsTool(),
      createServicesTool(),
      createFAQsTool(),
      createProfileTool(),
      createDocumentsTool()
    ];

    // Initialize agent asynchronously
    this.initPromise = this.initializeAgent();
  }

  private async initializeAgent() {
    try {
      // Use the prompt from database configuration instead of hardcoded
      const prompt = ChatPromptTemplate.fromMessages([
        ['system', this.config.prompt],
        new MessagesPlaceholder('chat_history'),
        ['human', '{input}'],
        new MessagesPlaceholder('agent_scratchpad')
      ]);

      // Create the agent
      const agent = await createOpenAIFunctionsAgent({
        llm: this.llm,
        tools: this.tools,
        prompt
      });

      // Create the agent executor
      this.agent = new AgentExecutor({
        agent,
        tools: this.tools,
        verbose: true,
        maxIterations: 3,
        returnIntermediateSteps: false
      });

      logger.info('LangChain agent initialized successfully with dynamic prompt');
    } catch (error) {
      logger.error('Failed to initialize LangChain agent:', error);
      throw error;
    }
  }

  private convertMessagesToLangChain(messages: ChatMessage[]): BaseMessage[] {
    return messages.map(msg => {
      switch (msg.role) {
        case 'user':
          return new HumanMessage(msg.content);
        case 'assistant':
          return new AIMessage(msg.content);
        case 'system':
          return new SystemMessage(msg.content);
        default:
          return new HumanMessage(msg.content);
      }
    });
  }

  async processChat(messages: ChatMessage[]): Promise<string> {
    try {
      // Wait for agent initialization to complete
      await this.initPromise;

      // Get the last user message
      const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
      if (!lastUserMessage) {
        throw new Error('No user message found');
      }

      // Convert messages to LangChain format (excluding system messages as they're in the prompt)
      const chatHistory = this.convertMessagesToLangChain(
        messages.filter(msg => msg.role !== 'system')
      );

      logger.info('Processing chat with LangChain agent', {
        messageCount: messages.length,
        lastMessage: lastUserMessage.content.substring(0, 50)
      });

      // Execute the agent
      const result = await this.agent.invoke({
        input: lastUserMessage.content,
        chat_history: chatHistory.slice(0, -1) // Exclude the current message
      });

      logger.info('LangChain agent response generated', {
        outputLength: result.output?.length || 0
      });

      return result.output;

    } catch (error) {
      logger.error('Error processing chat with LangChain:', error);
      
      // Fallback response
      return "I apologize, but I'm experiencing technical difficulties. Please try again or contact our support team. How can I help you?";
    }
  }
} 