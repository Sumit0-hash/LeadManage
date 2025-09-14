export interface User {
  id: string;
  email: string;
}

export interface Lead {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  city?: string;
  state?: string;
  source: 'website' | 'facebook_ads' | 'google_ads' | 'referral' | 'events' | 'other';
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'won';
  score: number;
  lead_value: number;
  last_activity_at?: string;
  is_qualified: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export interface LeadFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  state: string;
  source: Lead['source'];
  status: Lead['status'];
  score: number;
  lead_value: number;
  last_activity_at?: string;
  is_qualified: boolean;
}