export interface Coachee {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  classTypePreference: string | null;
  status: string;
  level: { id: string } | null;
  additionalInfo: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CoacheeFormData {
  name: string;
  email: string;
  phone: string;
  classTypePreference: string;
  levelId: string;
}

export interface CoacheeFilters {
  status?: string;
  levelId?: string;
  page: number;
  limit: number;
}

export interface Level {
  id: string;
  name: string;
  color: string;
  sort_order: number;
}
