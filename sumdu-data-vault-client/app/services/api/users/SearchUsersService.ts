import apiClient from '../apiClient';

export interface SearchUsersRequest {
  search: string;
}

export interface SearchUsersResponse {
  fullNames: string[];
}

export class SearchUsersService {
  static async searchUsers(request: SearchUsersRequest): Promise<SearchUsersResponse> {
    const params = new URLSearchParams();
    
    params.append('search', request.search);

    const response = await apiClient.get<SearchUsersResponse>(`/users/search?${params.toString()}`);

    return response.data;
  }
}

export default SearchUsersService;
