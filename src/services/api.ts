const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Request failed',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication
  async login(credentials: { email: string; password: string; role: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: { name: string; email: string; password: string; role: string; [key: string]: any }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Farmer operations
  async addProduct(productData: any) {
    return this.request('/farmer/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async getFarmerProducts(farmerId: string) {
    return this.request(`/farmer/${farmerId}/products`);
  }

  // Supply chain operations
  async updateSupplyChain(updateData: any) {
    return this.request('/supply-chain/update', {
      method: 'POST',
      body: JSON.stringify(updateData),
    });
  }

  async getSupplyChainHistory(productId: string) {
    return this.request(`/supply-chain/${productId}/history`);
  }

  // Consumer operations
  async verifyProduct(qrCode: string) {
    return this.request(`/verify/${qrCode}`);
  }

  // Government operations
  async getAnalytics() {
    return this.request('/government/analytics');
  }

  async getAllProducts() {
    return this.request('/government/products');
  }
}

export const apiService = new ApiService(API_BASE_URL);
export default apiService;
