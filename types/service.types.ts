export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  price?: number;
  active: boolean;
}

export interface ServiceFilters {
  category?: string;
  search?: string;
  active?: boolean;
}
