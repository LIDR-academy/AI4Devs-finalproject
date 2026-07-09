export interface Template {
  id: string;
  name: string;
  description?: string;
  previewUrl: string;
  category: string;
  isPremium: boolean;
  layoutJson: string;
  createdAt: string;
}
