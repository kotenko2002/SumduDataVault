import apiClient from '../apiClient';

export interface CreateDatasetRequest {
  Csv: File;
  Description: string;
  Region?: string;
  CollectedFrom: string;
  CollectedTo: string;
  MetadataJson: string;
  UserJustification: string;
}

export interface CreateDatasetResponse {
  id: number;
  approvalRequestId: number;
}

export class CreateDatasetService {
  static async createDataset(data: CreateDatasetRequest): Promise<CreateDatasetResponse> {
    const formData = new FormData();
    
    formData.append('Csv', data.Csv);
    formData.append('Description', data.Description);
    formData.append('Region', data.Region || '');
    formData.append('CollectedFrom', data.CollectedFrom);
    formData.append('CollectedTo', data.CollectedTo);
    formData.append('MetadataJson', data.MetadataJson);
    formData.append('UserJustification', data.UserJustification);

    const response = await apiClient.post<CreateDatasetResponse>('/datasets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }
}

export default CreateDatasetService;
