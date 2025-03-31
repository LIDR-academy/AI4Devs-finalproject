export interface Report {
  id: string;
  petName: string;
  description: string;
  location: string;
  imageUrl: string;
  userEmail: string;
  createdAt: number;
  status: 'active' | 'found' | 'closed';
} 