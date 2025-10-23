import apiClient from '../apiClient';

export enum AccessStatus {
  NotAvailable = 0,
  NotRequested = 1,
  Requested = 2,
  Approved = 3
}

export interface DatasetMetadataDto {
  id: number;
  field: string;
  value: string;
}

export interface GetDatasetByIdResponse {
  id: number;
  fileName: string;
  checksumSha256: string;
  rowCount: number;
  fileSizeBytes: number;
  description: string;
  region?: string;
  collectedFrom: string; // ISO date string
  collectedTo: string; // ISO date string
  previewLines: string[];
  metadataItems: DatasetMetadataDto[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  accessStatus: AccessStatus;
}

export class GetDatasetByIdService {
  static async getDatasetById(id: number): Promise<GetDatasetByIdResponse> {
    const response = await apiClient.get<GetDatasetByIdResponse>(`/datasets/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }
}

export default GetDatasetByIdService;
