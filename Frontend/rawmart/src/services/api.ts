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
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

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
    localStorage.setItem('auth_token', response.token);
    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localStorage.setItem('auth_token', response.token);
    return response;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', {
      method: 'POST',
    });
    localStorage.removeItem('auth_token');
  }

  async getMe(): Promise<User> {
    const response = await this.request<{ user: User }>('/auth/me');
    return response.user;
  }

  // Task endpoints
  async getTasks(page: number = 1, limit: number = 10, status?: string): Promise<PaginatedResponse<Task>> {
    let url = `/tasks?page=${page}&limit=${limit}`;
    if (status && status !== 'all') {
      url += `&status=${status}`;
    }
    const response = await this.request<{ tasks: PaginatedResponse<Task> }>(url);
    return response.tasks;
  }

  async getTask(id: number): Promise<Task> {
    const response = await this.request<{ task: Task }>(`/tasks/${id}`);
    return response.task;
  }

  async createTask(data: CreateTaskData): Promise<Task> {
    const response = await this.request<{ task: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.task;
  }

  async updateTask(id: number, data: UpdateTaskData): Promise<Task> {
    const response = await this.request<{ task: Task }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.task;
  }

  async deleteTask(id: number): Promise<void> {
    return this.request(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService(API_BASE_URL);
