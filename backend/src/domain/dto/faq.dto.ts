export interface CreateFAQDto {
  question: string;
  answer: string;
}

export interface UpdateFAQDto {
  question?: string;
  answer?: string;
}

export interface FAQFilters {
  search?: string;
  isActive?: boolean;
} 