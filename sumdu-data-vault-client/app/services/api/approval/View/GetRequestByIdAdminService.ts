import apiClient from '../../apiClient';
import type {ApprovalRequestDto} from '../types';

export class GetRequestByIdAdminService {
  static async getRequestById(id: number): Promise<ApprovalRequestDto> {
    const response = await apiClient.get<ApprovalRequestDto>(`/requests/admin/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }
}

export default GetRequestByIdAdminService;
