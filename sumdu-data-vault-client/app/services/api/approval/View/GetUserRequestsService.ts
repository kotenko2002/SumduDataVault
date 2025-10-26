import apiClient from '../../apiClient';
import type {UserRequestFiltersDto, GetRequestsListResponse} from '../types';

export class GetUserRequestsService {
  static async getUserRequests(filters?: UserRequestFiltersDto): Promise<GetRequestsListResponse> {
    const response = await apiClient.post<GetRequestsListResponse>('/requests/user', filters || {}, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }
}

export default GetUserRequestsService;
