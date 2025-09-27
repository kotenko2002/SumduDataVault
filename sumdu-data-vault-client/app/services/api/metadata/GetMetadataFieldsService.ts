import apiClient from '../apiClient';

export interface GetMetadataFieldsRequest {
  search?: string;
}

export interface GetMetadataFieldsResponse {
  fields: string[];
}

export class GetMetadataFieldsService {
  static async getMetadataFields(request?: GetMetadataFieldsRequest): Promise<GetMetadataFieldsResponse> {
    const params = new URLSearchParams();
    
    if (request?.search) {
      params.append('search', request.search);
    }

    const response = await apiClient.get<GetMetadataFieldsResponse>(`/metadata/fields?${params.toString()}`);

    return response.data;
  }
}

export default GetMetadataFieldsService;
