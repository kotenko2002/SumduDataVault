import apiClient from '../apiClient';

export interface GetMetadataValuesRequest {
  field: string;
  value: string | null;
}

export interface GetMetadataValuesResponse {
  values: string[];
}

export class GetMetadataValuesService {
  static async getMetadataValues(request: GetMetadataValuesRequest): Promise<GetMetadataValuesResponse> {
    const params = new URLSearchParams();
    
    params.append('field', request.field);
    
    if (request.value) {
      params.append('value', request.value);
    }

    const response = await apiClient.get<GetMetadataValuesResponse>(`/metadata/values?${params.toString()}`);

    return response.data;
  }
}

export default GetMetadataValuesService;
