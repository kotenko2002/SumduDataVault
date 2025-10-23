import apiClient from '../../apiClient';
import type {ApprovalRequestDto, UserRequestFiltersDto} from '../types';

export class GetUserRequestsService {
  static async getUserRequests(filters?: UserRequestFiltersDto): Promise<ApprovalRequestDto[]> {
    const response = await apiClient.post<ApprovalRequestDto[]>('/requests/user', filters || {}, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }
}

export default GetUserRequestsService;
