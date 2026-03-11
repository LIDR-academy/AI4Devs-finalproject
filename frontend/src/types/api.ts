export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
  errors?: ApiErrorDetail[];
}

export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  pages: number;
}
