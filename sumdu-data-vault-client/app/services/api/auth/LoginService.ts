import apiClient from '../apiClient';

export interface LoginRequest {
  email: string;
  password: string;
}

export class LoginService {
  static async login(request: LoginRequest): Promise<string> {
    const response = await apiClient.post<string>('/auth/login', request, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  }
}

export default LoginService;


