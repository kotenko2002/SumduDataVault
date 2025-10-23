import apiClient from '../../apiClient';
import type {ApprovalRequestDto} from '../types';

export class GetRequestByIdService {
  /**
   * Отримати запит по ID (для користувачів - тільки власні запити)
   */
  static async getRequestById(id: number): Promise<ApprovalRequestDto> {
    const response = await apiClient.get<ApprovalRequestDto>(`/requests/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  /**
   * Отримати запит по ID (для адміністраторів - доступ до всіх запитів)
   */
  static async getRequestByIdAdmin(id: number): Promise<ApprovalRequestDto> {
    const response = await apiClient.get<ApprovalRequestDto>(`/requests/admin/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }
}

export default GetRequestByIdService;
