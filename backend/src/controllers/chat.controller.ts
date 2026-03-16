import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';
import { AgentConfigService } from '../application/services/AgentConfigService';
import {
  FAQResponse,
  ProductResponse,
  ServiceResponse
} from '../domain';
import { availableFunctions } from '../services/availableFunctions';
import logger from '../utils/logger';
import { aiService } from '../utils/openai';

const prisma = new PrismaClient();

interface OrderCompletedResponse {
  success: boolean;
  total?: number;
  order?: {
    orderNumber: string;
    status: string;
    items: Array<{product: string, quantity: number, price: number, subtotal: number}>;
    total: number;
    currency: string;
    estimatedDelivery: string;
    customerInfo: any;
    paymentMethod: string;
    shippingMethod: string;
    notes: string;
    timestamp: string;
  };
  message: string;
  error?: string;
}

interface CompanyInfoResponse {
  companyName?: string;
  description?: string;
  website?: string;
  email?: string;
  openingTime?: string;
  address?: string;
  sector?: string;
  total?: number;
  error?: string;
}

type FunctionResult = ProductResponse | ServiceResponse | FAQResponse | OrderCompletedResponse | CompanyInfoResponse;

// Schema for chat request validation
const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system', 'function', 'tool']),
      content: z.string(),
      name: z.string().optional(),
      imageUrl: z.string().optional(),
      imageCaption: z.string().optional(),
      function_call: z
        .object({
          name: z.string(),
          arguments: z.string(),
        })
        .optional(),
      tool_calls: z.array(
        z.object({
          id: z.string(),
          type: z.literal('function'),
          function: z.object({
            name: z.string(),
            arguments: z.string()
          })
        })
      ).optional(),
      tool_call_id: z.string().optional()
    })
  ),
});

// Function definitions for OpenRouter
const functionDefinitions = [
  {
    name: 'getProducts',
    description: 'Retrieve product information from our Italian specialty foods catalog. Use when customers ask about products, want to browse items, or need specific product details.',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Product category. Examples: "Cheese", "Wine", "Pasta", "Cured Meats", "Oils", "Vinegars"',
        },
        search: {
          type: 'string',
          description: 'Search products by name/description. Examples: "parmigiano", "chianti", "prosciutto"',
        },
        countOnly: {
          type: 'boolean',
          description: 'Return only count of products (for availability checks)',
        },
        isActive: {
          type: 'boolean',
          description: 'Filter by active status (default: true - only active products)',
        }
      },
      required: [],
    },
  },
  {
    name: 'getServices',
    description: 'Retrieve information about our services like cooking classes, catering, consultations. Use when customers ask about services.',
    parameters: {
      type: 'object',
      properties: {
        isActive: {
          type: 'boolean',
          description: 'Return only active services (default: true)',
        },
        search: {
          type: 'string',
          description: 'Search services by name/description. Examples: "cooking", "catering", "consultation"',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by tags: ["italian", "premium", "quick", "cooking", "wine"]',
        }
      },
      required: [],
    },
  },
  {
    name: 'getFAQs',
    description: 'Search FAQs using semantic embedding search. Use for policy questions, shipping, returns, payments, store info.',
    parameters: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: 'Semantic search query. Examples: "shipping time", "return policy", "payment methods"',
        },
        isActive: {
          type: 'boolean',
          description: 'Filter by active status (default: true - only active FAQs)',
        }
      },
      required: [],
    },
  },
  {
    name: 'getDocuments',
    description: 'Search and retrieve document information from our knowledge base. Use when customers ask about documents, policies, regulations, catalogs, or any specific information that might be stored in our documents.',
    parameters: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: 'Search query to find relevant documents. Examples: "privacy policy", "transport regulations", "product catalog", "GDPR", "shipping rules"',
        },
        path: {
          type: 'string',
          description: 'Filter by document path/category. Examples: "legal", "regulations", "catalogs", "policies"',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of documents to return (default: 5)',
        },
        isActive: {
          type: 'boolean',
          description: 'Filter by active status (default: true - only active documents)',
        }
      },
      required: [],
    },
  },
  {
    name: 'OrderCompleted',
    description: 'Complete a customer order and generate order confirmation details. Use when customer confirms they want to finalize their purchase.',
    parameters: {
      type: 'object',
      properties: {
        cartItems: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              product: { type: 'string', description: 'Product name' },
              quantity: { type: 'number', description: 'Quantity ordered' }
            },
            required: ['product', 'quantity']
          },
          description: 'Array of cart items with product names and quantities'
        },
        customerInfo: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Customer name' },
            address: { type: 'string', description: 'Delivery address' },
            email: { type: 'string', description: 'Customer email' },
            phone: { type: 'string', description: 'Customer phone number' }
          },
          description: 'Customer information for order processing'
        }
      },
      required: [],
    },
  },
  {
    name: 'getCompanyInfo',
    description: 'Retrieve company information including company name, phone, email, address, timing, business sector, and description. Use when customers ask about the company details, contact information, location, opening hours, or what the company does.',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  }
];

class ChatController {
  private agentConfigService: AgentConfigService;

  constructor() {
    this.agentConfigService = new AgentConfigService();
    logger.info('🤖 ChatController initialized');
  }

  async processChat(req: Request, res: Response) {
    const startTime = Date.now();
    
    try {
      logger.info('🚀 === CHAT FLOW START ===');
      
      // Step 1: Validate request
      const { messages } = chatRequestSchema.parse(req.body);
      const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
      
      if (!lastUserMessage) {
        logger.error('❌ No user message found');
        return res.status(400).json({ error: 'No user message found' });
      }
      
      logger.info(`👤 USER: "${lastUserMessage.content}"`);
      
      // Step 2: Load configuration from database
      logger.info('📊 SYSTEM: Loading agent configuration from database...');
      const agentConfig = await this.agentConfigService.getLatestConfig();
      
      if (!agentConfig) {
        logger.error('❌ Failed to load agent configuration from database');
        return res.status(500).json({ error: 'Failed to load agent configuration' });
      }
      
      logger.info(`✅ SYSTEM: Config loaded - Model: ${agentConfig.model}, Temp: ${agentConfig.temperature}, TopP: ${agentConfig.topP}`);
      
      // Step 3: Try AI API first for intelligent function calling
      try {
        // Step 3: Prepare messages with system prompt ONLY from database
        const systemPrompt = agentConfig.prompt || 'You are a helpful assistant.';

        if (!messages.some(msg => msg.role === 'system')) {
          messages.unshift({ role: 'system', content: systemPrompt });
        } else {
          const systemIndex = messages.findIndex(msg => msg.role === 'system');
          messages[systemIndex].content = systemPrompt;
        }
        
        // Step 4: Call AI service with function calling
        logger.info('🔄 AI: Sending request with function calling enabled...');
        
        const response = await aiService.generateChatCompletion(
          messages as any,
          agentConfig.model,
          {
            temperature: agentConfig.temperature,
            maxTokens: agentConfig.maxTokens,
            topP: agentConfig.topP,
            tools: functionDefinitions.map(fn => ({
              type: 'function',
              function: fn
            })),
            toolChoice: 'auto'
          }
        );
        
        const responseMessage = response.choices[0].message;
        logger.info(`✅ AI: Response received. Function calls: ${responseMessage.tool_calls?.length || 0}`);
        
        // Handle function calls from AI
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
          const toolCall = responseMessage.tool_calls[0];
          
          if (toolCall.type === 'function') {
            const functionName = toolCall.function.name;
            const functionArgs = JSON.parse(toolCall.function.arguments);
            
            logger.info(`🔧 SYSTEM: AI Function call detected - ${functionName}`);
            logger.info(`📝 SYSTEM: Function args - ${JSON.stringify(functionArgs)}`);
            
            // Execute the function
            if (functionName === 'getProducts' || functionName === 'getServices' || functionName === 'getFAQs' || functionName === 'getDocuments' || functionName === 'OrderCompleted' || functionName === 'getCompanyInfo') {
              logger.info(`⚡ SYSTEM: Executing ${functionName}...`);
              
              const functionToCall = availableFunctions[functionName as keyof typeof availableFunctions] as Function;
              const functionResult = await functionToCall(functionArgs) as FunctionResult;
              
              logger.info(`✅ SYSTEM: ${functionName} completed - Found ${functionResult.total} results`);
              
              // Add function call and result to conversation
              messages.push({
                role: 'assistant',
                content: '',
                tool_calls: [{
                  id: toolCall.id,
                  type: 'function',
                  function: {
                    name: functionName,
                    arguments: JSON.stringify(functionArgs)
                  }
                }]
              });
              
              messages.push({
                role: 'tool',
                content: JSON.stringify(functionResult),
                tool_call_id: toolCall.id
              });
              
              // Step 6: Get formatted response from AI using only database prompt
              logger.info('🎨 AI: Requesting formatted response...');
              
              const formattedResponse = await aiService.generateChatCompletion(
                messages as any,
                agentConfig.model,
                {
                  temperature: agentConfig.temperature,
                  maxTokens: agentConfig.maxTokens,
                  topP: agentConfig.topP,
                }
              );
              
              const finalMessage = formattedResponse.choices[0].message;
              // logger.info('✅ AI: Formatted response ready');
              // logger.info(`🎯 RESPONSE: "${finalMessage.content?.substring(0, 100)}..."`);
              
              const duration = Date.now() - startTime;
              // logger.info(`🏁 === CHAT FLOW COMPLETE (${duration}ms) ===`);
              
              // Prepare debug information
              const debugInfo = {
                functionCalls: [{
                  name: functionName,
                  arguments: functionArgs,
                  result: functionResult,
                  timestamp: new Date().toISOString()
                }],
                processingTime: duration,
                model: agentConfig.model,
                temperature: agentConfig.temperature
              };
              
              return res.json({ 
                message: finalMessage,
                debug: debugInfo
              });
            }
          }
        }
        
        // Step 7: No function call - DIRECT AI RESPONSE (NO CASCADE)
        logger.info('💬 AI: No function call detected - providing direct AI response');
        
        // Direct AI response without any automatic function calling
        const finalMessage = responseMessage;
        
        const duration = Date.now() - startTime;
        logger.info(`🏁 === CHAT FLOW COMPLETE (${duration}ms) ===`);
        
        // Prepare debug information
        const debugInfo = {
          functionCalls: [],
          processingTime: duration,
          model: agentConfig.model,
          temperature: agentConfig.temperature,
          note: 'Direct AI response - no function calls'
        };
        
        return res.json({ 
          message: finalMessage,
          debug: debugInfo
        });
        
      } catch (aiError) {
        logger.error('🚨 AI service failed:', aiError);
        
        // Get dynamic error response from agent configuration
        const agentConfig = await this.agentConfigService.getLatestConfig();
        const errorResponse = {
          role: 'assistant',
          content: agentConfig?.prompt ? 
            'I apologize, I am experiencing technical difficulties. Please try again in a moment.' :
            'I apologize, but I\'m having trouble processing your request right now. Please try again.'
        };
        
        const duration = Date.now() - startTime;
        
        return res.json({ 
          message: errorResponse,
          debug: {
            functionCalls: [],
            processingTime: duration,
            error: 'AI service failed',
            note: 'Error response - no automatic fallback'
          }
        });
      }

    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      logger.error(`💥 === CHAT FLOW ERROR (${duration}ms) ===`);
      logger.error('Error details:', error);
      
      if (error instanceof z.ZodError) {
        logger.error('❌ Validation error:', error.errors);
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }
      
      // Get dynamic error response from profile/agent config
      try {
        const agentConfig = await this.agentConfigService.getLatestConfig();
        const profileService = (await import('../services/profile.service')).default;
        const profile = await profileService.getProfile();
        
        const errorMessage = {
          role: 'assistant', 
          content: `Hello! I'm Sofia from ${profile?.companyName || 'ShopMefy'}! 🇮🇹

I'm here to help you discover our authentic Italian products and services.

In the meantime, I can help you with information about products and services.

How can I assist you today?`
        };
        
        return res.json({ message: errorMessage });
      } catch (configError) {
        // Fallback to minimal error response
        return res.status(500).json({ 
          error: 'Error processing chat message',
          message: 'Please try again later'
        });
      }
    }
  }

  // Test endpoint for debugging
  async testAI(req: Request, res: Response) {
    try {
      logger.info('🧪 Testing AI service directly...');
      
      const response = await aiService.generateChatCompletion(
        [{ role: 'user', content: 'Hello, this is a test' }],
        'gpt-3.5-turbo',
        { temperature: 0.7, maxTokens: 50 }
      );
      
      return res.json({
        success: true,
        response: response.choices[0].message.content
      });
      
    } catch (error) {
      logger.error('🚨 AI test failed:', error);
      return res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Debug endpoint for testing availableFunctions
  async testFunctions(req: Request, res: Response) {
    try {
      // Get dynamic test data from database instead of hardcoded values
      const allProducts = await availableFunctions.getProducts({});
      const allServices = await availableFunctions.getServices({});
      const allFAQs = await availableFunctions.getFAQs({});
      
      // Use first available product/service for testing if any exist
      const firstProduct = allProducts.products?.[0];
      const firstService = allServices.services?.[0];
      const firstFAQ = allFAQs.faqs?.[0];
      
      // Dynamic search tests based on actual data
      const productSearchResults = firstProduct ? 
        await availableFunctions.getProducts({ search: firstProduct.name.split(' ')[0] }) : 
        { products: [], total: 0 };
        
      const serviceSearchResults = firstService ?
        await availableFunctions.getServices({ search: firstService.name.split(' ')[0] }) :
        { services: [], total: 0 };
        
      const faqSearchResults = firstFAQ ?
        await availableFunctions.getFAQs({ search: firstFAQ.question.split(' ')[0] }) :
        { faqs: [], total: 0 };
      
      return res.json({
        success: true,
        tests: {
          allProducts: allProducts,
          allServices: allServices,
          allFAQs: allFAQs,
          productSearch: productSearchResults,
          serviceSearch: serviceSearchResults,
          faqSearch: faqSearchResults
        }
      });
      
    } catch (error) {
      return res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  /**
   * Enhanced query analysis for intelligent fallback
   * Analyzes user queries to determine intent and extract parameters
   */
  private analyzeUserQuery(query: string): {
    intent: 'greeting' | 'thanks' | 'general' | 'products' | 'services' | 'faq' | 'company' | 'documents';
    confidence: number;
    params?: any;
  } {
    const lowerQuery = query.toLowerCase();
    
    // Check for greetings
    if (lowerQuery.match(/\b(hello|hi|good morning|hey|buongiorno)\b/)) {
      return { intent: 'greeting', confidence: 0.9 };
    }
    
    // Check for thanks
    if (lowerQuery.match(/\b(thank|thanks|thank you)\b/)) {
      return { intent: 'thanks', confidence: 0.9 };
    }
    
    // Check for products
    if (lowerQuery.match(/\b(product|pasta|cheese|wine|oil|vinegar|food|buy|purchase|price)\b/)) {
      return { intent: 'products', confidence: 0.8, params: { search: query } };
    }
    
    // Check for services
    if (lowerQuery.match(/\b(service|class|cooking|catering|consultation|lesson|workshop)\b/)) {
      return { intent: 'services', confidence: 0.8, params: { search: query } };
    }
    
    // Check for company info
    if (lowerQuery.match(/\b(company|contact|address|phone|email|hours|location|about)\b/)) {
      return { intent: 'company', confidence: 0.8 };
    }
    
    // For any other query, we'll use the cascade logic: Services → FAQs → Documents → Generic
    return { intent: 'general', confidence: 0.5, params: { search: query } };
  }

  /**
   * Test OrderCompleted function directly
   */
  async testOrderCompleted(req: Request, res: Response) {
    try {
      logger.info('🧪 Testing OrderCompleted function directly...');
      
      // Get dynamic test data from database instead of hardcoded values
      const products = await availableFunctions.getProducts({});
      const firstProduct = products.products?.[0];
      const secondProduct = products.products?.[1];
      
      if (!firstProduct) {
        return res.status(400).json({
          success: false,
          error: 'No products available in database for testing'
        });
      }
      
      // Create dynamic test order data based on actual products
      const testOrderData = {
        cartItems: [
          { 
            product: firstProduct.name, 
            quantity: 2 
          },
          ...(secondProduct ? [{ 
            product: secondProduct.name, 
            quantity: 1 
          }] : [])
        ],
        customerInfo: {
          name: 'Test Customer',
          address: 'Test Address',
          email: 'test@example.com'
        }
      };
      
      const result = await availableFunctions.OrderCompleted(testOrderData);
      
      logger.info('✅ OrderCompleted test result:', result);
      
      return res.json({
        success: true,
        testData: testOrderData,
        result: result
      });
      
    } catch (error) {
      logger.error('🚨 OrderCompleted test failed:', error);
      return res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
}

export default new ChatController(); 