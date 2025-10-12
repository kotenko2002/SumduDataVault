import apiClient from '../apiClient';

export interface RequestDatasetDownloadAccessRequest {
  datasetId: number;
  userJustification: string;
}

export interface RequestDatasetDownloadAccessResponse {
  requestId: number;
  message: string;
}

export class RequestDatasetDownloadAccessService {
  static async createAccessRequest(
    payload: RequestDatasetDownloadAccessRequest
  ): Promise<RequestDatasetDownloadAccessResponse> {
    const response = await apiClient.post<RequestDatasetDownloadAccessResponse>(
      '/requests/access',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }
}

export default RequestDatasetDownloadAccessService;


