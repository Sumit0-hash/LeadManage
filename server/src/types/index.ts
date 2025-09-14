export interface User {
  id: string;
  email: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
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
  user_id?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LeadFilters {
  email?: string;
  company?: string;
  city?: string;
  status?: string | string[];
  source?: string | string[];
  score?: number;
  score_gt?: number;
  score_lt?: number;
  score_between?: [number, number];
  lead_value?: number;
  lead_value_gt?: number;
  lead_value_lt?: number;
  lead_value_between?: [number, number];
  created_at?: string;
  created_at_before?: string;
  created_at_after?: string;
  created_at_between?: [string, string];
  last_activity_at?: string;
  last_activity_at_before?: string;
  last_activity_at_after?: string;
  last_activity_at_between?: [string, string];
  is_qualified?: boolean;
}

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}