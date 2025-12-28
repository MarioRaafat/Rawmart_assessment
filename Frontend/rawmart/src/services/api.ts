import { 
  AuthResponse, 
  Task, 
  CreateTaskData, 
  UpdateTaskData, 
  LoginData, 
  RegisterData,
  User,
  PaginatedResponse
} from '@/types';

// Configure your API base URL here
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw error;
    }

    // Handle empty responses (like 204 No Content)
    const text = await response.text();
    return (text ? JSON.parse(text) : null) as T;
  }

  // Auth endpoints
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localStorage.setItem('auth_token', response.access_token);
    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localStorage.setItem('auth_token', response.access_token);
    return response;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', {
      method: 'POST',
    });
    localStorage.removeItem('auth_token');
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Task endpoints
  async getTasks(page: number = 1): Promise<PaginatedResponse<Task>> {
    return this.request<PaginatedResponse<Task>>(`/tasks?page=${page}`);
  }

  async getTask(id: number): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`);
  }

  async createTask(data: CreateTaskData): Promise<Task> {
    return this.request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: number, data: UpdateTaskData): Promise<Task> {
    return this.request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTask(id: number): Promise<void> {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService(API_BASE_URL);
