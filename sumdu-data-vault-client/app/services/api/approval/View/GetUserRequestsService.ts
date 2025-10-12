import apiClient from '../../apiClient';
import type {ApprovalRequestDto} from '../types';

export class GetUserRequestsService {
  static async getUserRequests(): Promise<ApprovalRequestDto[]> {
    const response = await apiClient.get<ApprovalRequestDto[]>('/requests', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }
}

export default GetUserRequestsService;
