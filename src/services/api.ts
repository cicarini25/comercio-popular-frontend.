import { User } from '../types';
/**
 * API Service for Comércio Popular
 * Connects frontend to backend API (Railway / Render / Localhost)
 */

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://comercio-popular-backend-production.up.railway.app/api').replace(/\/+$/, '').replace(/\/api$/, '');

export const getAuthToken = (): string | null => {
  return localStorage.getItem('cp_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('cp_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('cp_token');
  localStorage.removeItem('auth_token');
};

export interface SignupData {
  name: string;
  email: string;
  password?: string;
  cpf: string;
  phone: string;
}

export interface LoginData {
  email: string;
  password?: string;
}

export interface OrderItemPayload {
  productId: string;
  title: string;
  unitPrice: number;
  quantity: number;
  sellerId: string;
}

export interface CreateOrderPayload {
  items: OrderItemPayload[];
  shippingFee: number;
}

export interface CreateOrderResponse {
  orderId: string;
  checkoutUrl?: string;
}

/**
 * Helper to make API requests with Authorization header and friendly error messages
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(20000)
    });
  } catch (err: any) {
    // Network or connection refused error
    console.error('Falha de conexão com a API:', err);
    throw new Error(
      `Não foi possível conectar ao servidor (${API_BASE_URL}). Verifique sua conexão ou se o back-end está ativo.`
    );
  }

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Erro ${response.status}: falha na requisição ao servidor.`;
    throw new Error(errorMsg);
  }

  if (!data || typeof data !== 'object') throw new Error('O servidor retornou uma resposta inválida. Tente novamente.');
  return data as T;
}

export const api = {
  /**
   * POST /api/auth/signup
   */
  async signup(payload: SignupData): Promise<{ user: any; token: string }> {
    const res = await request<{ user: any; token: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    mapApiUser(res.user);
    if (!res.token || typeof res.token !== 'string') throw new Error('O servidor não confirmou a sessão.');
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  /**
   * POST /api/auth/login
   */
  async login(payload: LoginData): Promise<{ user: any; token: string }> {
    const res = await request<{ user: any; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    mapApiUser(res.user);
    if (!res.token || typeof res.token !== 'string') throw new Error('O servidor não confirmou a sessão.');
    if (res.token) {
      setAuthToken(res.token);
    }
    return res;
  },

  /**
   * GET /api/auth/me
   */
  async getMe(): Promise<{ user: any }> {
    return request<{ user: any }>('/api/auth/me', {
      method: 'GET'
    });
  },

  /**
   * POST /api/orders
   */
  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
    throw new Error('Pagamentos temporariamente indisponíveis. Nenhuma cobrança foi realizada.');
  },

  /**
   * GET /api/orders
   */
  async getOrders(): Promise<{ orders: any[] }> {
    return request<{ orders: any[] }>('/api/orders', {
      method: 'GET'
    });
  }
};

export function mapApiUser(user: any): User {
  if (!user || typeof user.id !== 'string' || typeof user.email !== 'string' || typeof user.name !== 'string') {
    throw new Error('O servidor não confirmou os dados da conta.');
  }
  return { id: user.id, name: user.name, email: user.email, cpf: user.cpf || '', phone: user.phone || '',
    isVerifiedFace: user.is_verified_face === true, isVerifiedSMS: user.is_verified_sms === true,
    isSeller: user.is_seller === true, avatar: user.avatar || '' };
}
