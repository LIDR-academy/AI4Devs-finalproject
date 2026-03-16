import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Import embedding service for generating embeddings
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Simple mock embedding for seeding - in production this would call OpenAI
    // For now, we'll create a simple hash-based embedding
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(1536).fill(0); // OpenAI embedding size
    
    // Simple hash-based embedding generation
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      for (let j = 0; j < word.length; j++) {
        const charCode = word.charCodeAt(j);
        const index = (charCode + i + j) % 1536;
        embedding[index] += 0.1;
      }
    }
    
    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
  } catch (error) {
    console.error('Error generating embedding:', error);
    return new Array(1536).fill(0);
  }
}

// Function to split text into chunks
function splitIntoChunks(text: string, maxChunkSize: number = 1000): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (currentChunk.length + trimmedSentence.length + 1 <= maxChunkSize) {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk + '.');
      }
      currentChunk = trimmedSentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk + '.');
  }

  return chunks.length > 0 ? chunks : [text];
}

async function main() {
  // Clear existing data
  await prisma.documentChunk.deleteMany();
  await prisma.document.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.agentConfig.deleteMany();
  await prisma.user.deleteMany();
  await prisma.service.deleteMany();
  await prisma.fAQ.deleteMany();
  await prisma.product.deleteMany();

  // Seed products
  const products = [
    {
      name: 'Barolo DOCG 2018',
      description: 'Premium red wine from Piedmont region, aged in oak barrels for 24 months.',
      price: 45.99,
      category: 'Wine',
      isActive: true,
      tagsJson: JSON.stringify(['wine', 'red', 'premium', 'piedmont', 'docg', 'barolo'])
    },
    {
      name: 'Chianti Classico DOCG 2020',
      description: 'Traditional Tuscan red wine with notes of cherry and herbs.',
      price: 28.50,
      category: 'Wine',
      isActive: true,
      tagsJson: JSON.stringify(['wine', 'red', 'chianti', 'tuscany', 'docg', 'classic'])
    },
    {
      name: 'Prosecco di Valdobbiadene DOCG',
      description: 'Sparkling wine from Veneto with fresh and fruity notes.',
      price: 18.75,
      category: 'Wine',
      isActive: true,
      tagsJson: JSON.stringify(['wine', 'sparkling', 'prosecco', 'veneto', 'docg', 'fresh'])
    },
    {
      name: 'Amarone della Valpolicella DOCG 2017',
      description: 'Full-bodied red wine made from dried grapes, complex and intense.',
      price: 65.00,
      category: 'Wine',
      isActive: true,
      tagsJson: JSON.stringify(['wine', 'red', 'amarone', 'valpolicella', 'docg', 'premium'])
    },
    {
      name: 'Pinot Grigio delle Venezie DOC 2022',
      description: 'Light and crisp white wine, perfect as an aperitif.',
      price: 12.90,
      category: 'Wine',
      isActive: true,
      tagsJson: JSON.stringify(['wine', 'white', 'pinot grigio', 'venezie', 'doc', 'light'])
    },
    {
      name: 'Brunello di Montalcino DOCG 2018',
      description: 'Prestigious Tuscan red wine, aged for at least 5 years.',
      price: 85.00,
      category: 'Wine',
      isActive: true,
      tagsJson: JSON.stringify(['wine', 'red', 'brunello', 'montalcino', 'docg', 'prestigious'])
    },
    {
      name: 'Parmigiano Reggiano DOP 24 months',
      description: 'Authentic Parmigiano Reggiano cheese aged for 24 months.',
      price: 32.50,
      category: 'Cheese',
      isActive: true,
      tagsJson: JSON.stringify(['cheese', 'parmigiano', 'reggiano', 'dop', 'aged', 'authentic'])
    },
    {
      name: 'Gorgonzola DOP Dolce',
      description: 'Creamy blue cheese from Lombardy, sweet and delicate.',
      price: 18.90,
      category: 'Cheese',
      isActive: true,
      tagsJson: JSON.stringify(['cheese', 'gorgonzola', 'blue', 'dop', 'creamy', 'lombardy'])
    },
    {
      name: 'Prosciutto di Parma DOP',
      description: 'Traditional cured ham from Parma, aged for 18 months.',
      price: 45.00,
      category: 'Cured Meat',
      isActive: true,
      tagsJson: JSON.stringify(['meat', 'prosciutto', 'parma', 'dop', 'cured', 'traditional'])
    },
    {
      name: 'Extra Virgin Olive Oil Toscano IGP',
      description: 'Premium extra virgin olive oil from Tuscany.',
      price: 24.50,
      category: 'Oil',
      isActive: true,
      tagsJson: JSON.stringify(['oil', 'olive', 'extra virgin', 'toscano', 'igp', 'premium'])
    },
    {
      name: 'Pasta di Gragnano IGP - Spaghetti',
      description: 'Traditional pasta from Gragnano, bronze-drawn and slow-dried.',
      price: 8.50,
      category: 'Pasta',
      isActive: true,
      tagsJson: JSON.stringify(['pasta', 'gragnano', 'igp', 'spaghetti', 'bronze', 'traditional'])
    },
    {
      name: 'Gnocchi di Patate',
      description: 'Fresh potato gnocchi, ready to cook.',
      price: 6.90,
      category: 'Pasta',
      isActive: true,
      tagsJson: JSON.stringify(['pasta', 'gnocchi', 'potato', 'fresh', 'ready'])
    },
    {
      name: 'Risotto Rice Carnaroli',
      description: 'Premium Carnaroli rice, perfect for risotto.',
      price: 12.00,
      category: 'Rice',
      isActive: true,
      tagsJson: JSON.stringify(['rice', 'carnaroli', 'risotto', 'premium', 'italian'])
    },
    {
      name: 'Balsamic Vinegar of Modena IGP',
      description: 'Traditional balsamic vinegar aged in wooden barrels.',
      price: 16.75,
      category: 'Vinegar',
      isActive: true,
      tagsJson: JSON.stringify(['vinegar', 'balsamic', 'modena', 'igp', 'aged', 'traditional'])
    },
    {
      name: 'Limoncello di Sorrento',
      description: 'Traditional lemon liqueur from the Amalfi Coast.',
      price: 22.00,
      category: 'Liqueur',
      isActive: true,
      tagsJson: JSON.stringify(['liqueur', 'limoncello', 'sorrento', 'lemon', 'traditional', 'amalfi'])
    }
  ];

  await prisma.product.createMany({ data: products });

  // Seed FAQs
  const faqs = [
    {
      question: 'What are your shipping options?',
      answer: 'We offer standard shipping (3-5 business days) for €5.99, express shipping (1-2 business days) for €12.99, and free shipping on orders over €75.',
      isActive: true
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Yes, we ship to most European countries. International shipping costs vary by destination and are calculated at checkout.',
      isActive: true
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers.',
      isActive: true
    },
    {
      question: 'How do I store wine properly?',
      answer: 'Store wine in a cool, dark place at 12-15°C with consistent temperature. Keep bottles horizontal to keep the cork moist.',
      isActive: true
    },
    {
      question: 'What is the difference between DOCG and DOC wines?',
      answer: 'DOCG (Denominazione di Origine Controllata e Garantita) is the highest Italian wine classification, with stricter regulations than DOC (Denominazione di Origine Controllata).',
      isActive: true
    },
    {
      question: 'Can I return products if I\'m not satisfied?',
      answer: 'Yes, we offer a 30-day return policy for unopened products. Wine returns are accepted only if the product is defective.',
      isActive: true
    },
    {
      question: 'Do you offer wine tastings?',
      answer: 'Yes, we offer guided wine tasting experiences with our sommelier. Check our services section for available dates and booking.',
      isActive: true
    },
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 3-5 business days, express shipping takes 1-2 business days. International orders may take 5-10 business days.',
      isActive: true
    },
    {
      question: 'Are your products authentic Italian?',
      answer: 'Yes, all our products are sourced directly from certified Italian producers and come with authenticity guarantees.',
      isActive: true
    },
    {
      question: 'Do you have a minimum order amount?',
      answer: 'No minimum order amount required. However, orders over €75 qualify for free shipping.',
      isActive: true
    },
    {
      question: 'Can I track my order?',
      answer: 'Yes, once your order ships, you will receive a tracking number via email. You can track your package in real-time through our website or the carrier\'s tracking system.',
      isActive: true
    },
    {
      question: 'Do you have a customer loyalty program?',
      answer: 'Yes! Our "Gusto Club" loyalty program offers points for every purchase, exclusive discounts, early access to new products, and special member-only events.',
      isActive: true
    },
    {
      question: 'What temperature should wine be stored at?',
      answer: 'Red wines should be stored at 12-18°C, white wines at 8-12°C, and sparkling wines at 6-10°C. Keep bottles horizontal in a dark, humid environment away from vibrations.',
      isActive: true
    }
  ];

  await prisma.fAQ.createMany({ data: faqs });

  // Seed services
  const services = [
    {
      name: 'Wine Tasting Experience',
      description: 'Professional wine tasting session with our sommelier, including 6 premium Italian wines with detailed explanations of origin, production methods, and tasting notes.',
      price: 75.00,
      isActive: true
    },
    {
      name: 'Italian Cooking Class',
      description: 'Learn to cook authentic Italian dishes with our chef. Includes hands-on preparation of pasta, risotto, and traditional sauces using our premium ingredients.',
      price: 95.00,
      isActive: true
    },
    {
      name: 'Cheese & Wine Pairing',
      description: 'Discover the perfect combinations of Italian cheeses and wines. Guided tasting of 5 cheese varieties paired with complementary wines.',
      price: 65.00,
      isActive: true
    },
    {
      name: 'Premium Gift Wrapping',
      description: 'Elegant gift wrapping service with premium Italian paper, ribbons, and personalized cards. Perfect for special occasions.',
      price: 12.50,
      isActive: true
    },
    {
      name: 'Personal Shopping Consultation',
      description: 'One-on-one consultation with our Italian food expert to create a personalized selection based on your preferences and dietary requirements.',
      price: 45.00,
      isActive: true
    },
    {
      name: 'Corporate Catering',
      description: 'Professional catering service for corporate events featuring authentic Italian cuisine and premium wine selection.',
      price: 150.00,
      isActive: true
    }
  ];

  await prisma.service.createMany({ data: services });

  // Seed admin user
  await prisma.user.create({
    data: {
      email: 'admin@shopmefy.com',
              password: 'ShopMefy2024', 
      firstName: 'Admin',
      lastName: 'User',
      isActive: true
    }
  });

  // Seed agent configuration
  await prisma.agentConfig.create({
    data: {
      prompt: `You are SofIA, the passionate virtual assistant for Gusto Italiano, an authentic Italian specialty foods store.

Your role:
- Help customers discover authentic Italian products (wines, cheeses, cured meats, pasta, oils, etc.)
- Provide detailed product information and recommendations
- Assist with orders and answer questions about shipping, returns, and policies
- Share knowledge about Italian food culture and traditions
- Maintain a warm, professional, and passionate tone about Italian cuisine

Key guidelines:
- Always be helpful, friendly, and knowledgeable
- Use product search functions to provide accurate, real-time information
- Suggest complementary products when appropriate
- If you don't know something, admit it and offer to help find the information
- Keep responses concise but informative
- Use emojis sparingly and appropriately

Welcome to the Gusto Italiano family! 🇮🇹`,
      model: 'openai/gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 500,
      topP: 0.9
    }
  });

  // Seed profile
  await prisma.profile.create({
    data: {
      username: 'shopmefy',
      companyName: 'ShopMefy - Authentic Italian Foods',
      description: 'Premium Italian food and wine e-commerce platform offering authentic products directly from certified Italian producers.',
      address: 'Via Roma 123, 20121 Milano, Italy',
      phoneNumber: '+39 02 1234 5678',
      email: 'info@shopmefy.com',
      website: 'https://www.shopmefy.com',
      openingTime: 'Monday-Friday: 9:00-18:00, Saturday: 9:00-13:00',
      sector: 'Premium Italian Food E-commerce'
    }
  });

  // Seed test user profile for e2e tests
  await prisma.profile.create({
    data: {
      username: 'gusto_italiano',
      companyName: 'Gusto Italiano',
      description: 'Authentic Italian food e-commerce platform offering premium products directly from certified Italian producers with a focus on traditional recipes and quality ingredients.',
      address: 'Via Roma 123, 00186 Roma, Italy',
      phoneNumber: '+39 06 1234 5678',
      email: 'info@gusto-italiano.com',
      website: 'https://www.gusto-italiano.com',
      openingTime: 'Monday-Saturday: 9:00-18:00, Sunday: 10:00-16:00',
      sector: 'Italian Food E-commerce'
    }
  });

  // Seed documents
  try {
    // Always create the international-transportation-law.pdf document record
    const legacyFilename = 'international-transportation-law.pdf';
    
    // Create comprehensive document content about International Transportation Law
    const documentContent = `International Transportation Law - Legal Framework and Regulations

The International Maritime Organization (IMO) is a specialized agency of the United Nations responsible for regulating shipping. The IMO develops and maintains a comprehensive regulatory framework for shipping, including safety, environmental concerns, legal matters, technical co-operation, maritime security and the efficiency of shipping.

Key IMO Conventions and Regulations:
- SOLAS (Safety of Life at Sea) Convention: The most important treaty addressing maritime safety
- MARPOL (Marine Pollution) Convention: Prevents pollution from ships
- STCW (Standards of Training, Certification and Watchkeeping) Convention: Sets qualification standards for masters, officers and watch personnel
- MLC (Maritime Labour Convention): Ensures decent working and living conditions for seafarers

International Transportation Law encompasses various legal frameworks governing the movement of goods and passengers across international borders. This includes maritime law, aviation law, and land transportation regulations.

Maritime Transportation:
The Hague Rules, Hague-Visby Rules, and Hamburg Rules govern the carriage of goods by sea. These international conventions establish the rights and responsibilities of carriers and shippers in maritime transportation.

Bills of Lading serve as crucial documents in international maritime trade, functioning as:
- Receipt for goods shipped
- Contract of carriage between shipper and carrier
- Document of title to the goods

Liability and Insurance:
International transportation involves complex liability frameworks. Carriers may limit their liability under various international conventions, but must maintain adequate insurance coverage.

The Warsaw Convention and Montreal Convention govern international air transportation, establishing carrier liability for passenger injury, death, and cargo damage.

Customs and Trade Regulations:
International transportation must comply with customs regulations of both origin and destination countries. This includes proper documentation, duty payments, and compliance with import/export restrictions.

The World Trade Organization (WTO) provides the legal and institutional foundation for the multilateral trading system, including transportation services.

Dispute Resolution:
International transportation disputes may be resolved through:
- Arbitration under various international rules
- Court proceedings in appropriate jurisdictions
- Mediation and other alternative dispute resolution methods

Environmental Regulations:
Modern international transportation law increasingly addresses environmental concerns, including emissions standards, ballast water management, and sustainable transportation practices.

The Paris Agreement and other international environmental treaties impact transportation regulations, requiring reduced emissions and improved environmental performance.

Documentation Requirements:
International transportation requires extensive documentation including:
- Commercial invoices
- Packing lists
- Certificates of origin
- Insurance certificates
- Transportation contracts
- Customs declarations

Technology and Digital Transformation:
Electronic documentation and digital platforms are increasingly important in international transportation, with initiatives like electronic bills of lading and digital customs procedures streamlining operations while maintaining legal validity.`;

    // Create appropriate path based on environment
    let uploadResult: { path: string; filename: string; size: number };
    
    if (process.env.NODE_ENV === 'production') {
      // In production, assume PDF will be uploaded to S3 by a separate process
      console.log('📄 Production environment: using S3 path for PDF');
      uploadResult = { 
        path: `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/documents/${legacyFilename}`,
        filename: legacyFilename,
        size: 137879 // Actual PDF size
      };
    } else {
      // In development, use local path
      console.log('📄 Development environment: using local path for PDF');
      uploadResult = { 
        path: `uploads/documents/${legacyFilename}`,
        filename: legacyFilename,
        size: 137879
      };
    }
    
    // Create the document record
    const document = await prisma.document.create({
      data: {
        filename: uploadResult.filename,
        originalName: 'international-transportation-law.pdf',
        title: 'International Transportation Law',
        mimeType: 'application/pdf',
        size: uploadResult.size,
        uploadPath: uploadResult.path,
        status: 'COMPLETED',
        metadata: JSON.stringify({
          pages: 1,
          language: 'en',
          keywords: ['transportation', 'international', 'law', 'delivery', 'regulations', 'IMO', 'maritime', 'shipping', 'customs', 'trade'],
          description: 'Comprehensive legal framework for international transportation and delivery regulations including IMO conventions, maritime law, and trade regulations'
        })
      }
    });

    // Generate chunks from the document content
    const chunks = splitIntoChunks(documentContent, 800);

    // Generate embeddings for each chunk and save to database
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await generateEmbedding(chunk);
      
      await prisma.documentChunk.create({
        data: {
          content: chunk,
          chunkIndex: i,
          pageNumber: 1,
          documentId: document.id,
          embedding: JSON.stringify(embedding)
        }
      });
    }

    console.log('📄 Created document record for international-transportation-law.pdf');

  } catch (e) {
    console.error('Error seeding documents:', e);
    // Don't throw error to allow other seeding to continue
  }

  // Generate embeddings for FAQs and Services after seeding
  console.log('🔄 Generating embeddings for FAQs...');
  try {
    const faqs = await prisma.fAQ.findMany({ where: { isActive: true } });
    
    for (const faq of faqs) {
      // Generate embedding for combined question and answer
      const combinedText = `${faq.question}\n${faq.answer}`;
      const chunks = splitIntoChunks(combinedText);

      // Delete existing chunks for this FAQ
      await prisma.fAQChunk.deleteMany({ where: { faqId: faq.id } });

      // Generate embeddings for each chunk and save
      for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk);
        
        await prisma.fAQChunk.create({
          data: {
            content: chunk,
            embedding: JSON.stringify(embedding),
            faqId: faq.id,
          },
        });
      }
    }
    console.log(`✅ Generated embeddings for ${faqs.length} FAQs`);
  } catch (error) {
    console.error('❌ Error generating FAQ embeddings:', error);
  }

  console.log('🔄 Generating embeddings for Services...');
  try {
    const services = await prisma.service.findMany({ where: { isActive: true } });
    
    for (const service of services) {
      // Generate embedding for combined name, description and price
      const combinedText = `${service.name}\n${service.description}\nPrice: €${service.price}`;
      const chunks = splitIntoChunks(combinedText);

      // Delete existing chunks for this service
      await (prisma as any).serviceChunk.deleteMany({ where: { serviceId: service.id } });

      // Generate embeddings for each chunk and save
      for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk);
        
        await (prisma as any).serviceChunk.create({
          data: {
            content: chunk,
            embedding: JSON.stringify(embedding),
            serviceId: service.id,
          },
        });
      }
    }
    console.log(`✅ Generated embeddings for ${services.length} Services`);
  } catch (error) {
    console.error('❌ Error generating Service embeddings:', error);
  }

  console.log('🔄 Regenerating embeddings for Documents...');
  try {
    const documents = await prisma.document.findMany({ where: { status: 'COMPLETED' } });
    
    for (const document of documents) {
      // Delete existing chunks for this document
      await prisma.documentChunk.deleteMany({ where: { documentId: document.id } });

      // Get document content from metadata or create default content
      const metadata = document.metadata ? JSON.parse(document.metadata as string) : {};
      const documentContent = metadata.description || `${document.title} - ${document.originalName}`;
      
      // Generate chunks from the document content
      const chunks = splitIntoChunks(documentContent, 800);

      // Generate embeddings for each chunk and save to database
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const embedding = await generateEmbedding(chunk);
        
        await prisma.documentChunk.create({
          data: {
            content: chunk,
            chunkIndex: i,
            pageNumber: 1,
            documentId: document.id,
            embedding: JSON.stringify(embedding)
          }
        });
      }
    }
    console.log(`✅ Regenerated embeddings for ${documents.length} Documents`);
  } catch (error) {
    console.error('❌ Error regenerating Document embeddings:', error);
  }

  console.log('🎉 Seed completed with embeddings!');

  // Note: PDF file should already exist in prisma/temp/ directory
  // The reset script will copy it to uploads/documents/
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
