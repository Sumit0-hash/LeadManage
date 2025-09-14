const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Handle 204 No Content responses
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Lead endpoints
  async getLeads(params: Record<string, any> = {}) {
    const queryString = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => queryString.append(key, item.toString()));
        } else {
          queryString.append(key, value.toString());
        }
      }
    });

    const endpoint = `/leads${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getLeadById(id: string) {
    return this.request(`/leads/${id}`);
  }

  async createLead(leadData: any) {
    return this.request('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    });
  }

  async updateLead(id: string, leadData: any) {
    return this.request(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    });
  }

  async deleteLead(id: string) {
    return this.request(`/leads/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();