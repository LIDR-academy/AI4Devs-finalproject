export const mockDocument = {
  id: 'test-doc-id',
  title: 'Test Document',
  originalName: 'test.pdf',
  filename: 'test.pdf',
  status: 'COMPLETED' as const,
  createdAt: new Date(),
  updatedAt: new Date()
};

export const mockDocumentChunk = {
  id: 'test-doc-chunk-id',
  content: 'Test document chunk content',
  documentId: 'test-doc-id',
  chunkIndex: 0,
  pageNumber: 1,
  embedding: JSON.stringify([0.1, 0.2, 0.3]),
  createdAt: new Date(),
  updatedAt: new Date(),
  document: mockDocument
};

export const mockDocumentUpdate = {
  title: 'Updated Test Document',
  status: 'PROCESSING' as const
};

export const mockDocumentCreate = {
  title: 'New Test Document',
  originalName: 'new-test.pdf',
  filename: 'new-test.pdf',
  status: 'PENDING' as const
}; 