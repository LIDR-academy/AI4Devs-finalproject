export const mockFAQ = {
  id: 'test-faq-id',
  question: 'Test question?',
  answer: 'Test answer',
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockFAQChunk = {
  id: 'test-faq-chunk-id',
  content: 'Test FAQ chunk content',
  faqId: 'test-faq-id',
  embedding: JSON.stringify([0.1, 0.2, 0.3]),
  createdAt: new Date(),
  updatedAt: new Date(),
  faq: mockFAQ
};

export const mockFAQUpdate = {
  question: 'Updated test question?',
  answer: 'Updated test answer'
};

export const mockFAQCreate = {
  question: 'New test question?',
  answer: 'New test answer'
}; 