export interface Client {
  id: string;
  fullName: string;
  nationalId: string;
  phone: string | null;
  email: string | null;
  createdAt?: string;
}

export interface ClientSearchResponse {
  items: Client[];
  total: number;
}

export interface CreateClientRequest {
  fullName: string;
  nationalId: string;
  phone?: string;
  email?: string;
}

export interface UpdateClientRequest {
  fullName: string;
  phone?: string;
  email?: string;
}
