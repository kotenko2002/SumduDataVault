import apiClient from '../../apiClient';
import type {ApprovalRequestDto} from '../types';

export class GetPendingRequestsService {
  static async getPendingRequests(): Promise<ApprovalRequestDto[]> {
    const response = await apiClient.get<ApprovalRequestDto[]>('/requests/admin', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }
}

export default GetPendingRequestsService;
