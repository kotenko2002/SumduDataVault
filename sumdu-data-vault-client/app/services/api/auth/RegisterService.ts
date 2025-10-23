import apiClient from '../apiClient';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName: string;
}

export class RegisterService {
  static async register(request: RegisterRequest): Promise<void> {
    await apiClient.post('/auth/register', request, {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export default RegisterService;


