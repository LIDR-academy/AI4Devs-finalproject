/**
 * Generate embeddings for FAQs
 */
export const generateEmbeddings = async (faqId?: string) => {
  const url = faqId ? `/api/embeddings/faqs/${faqId}/generate` : '/api/embeddings/faqs/generate-all';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate embeddings');
  }
  
  return response.json();
}; 