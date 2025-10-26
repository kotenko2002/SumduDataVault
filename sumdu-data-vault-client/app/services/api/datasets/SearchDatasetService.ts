import apiClient from '../apiClient';

export interface RowCountRange {
  min?: number;
  max?: number;
}

export interface FileSizeRange {
  min?: number;
  max?: number;
}

export interface SearchDatasetRequest {
  description?: string;
  region?: string;
  collectedFrom?: string; // ISO date string
  collectedTo?: string; // ISO date string
  rowCount?: RowCountRange;
  fileSizeBytes?: FileSizeRange;
  metadata?: Record<string, string>;
  skip?: number;
  take?: number;
}

export interface SearchDatasetItem {
  id: number;
  description: string;
  region?: string;
  collectedFrom: string; // ISO date string
  collectedTo: string; // ISO date string
  rowCount: number;
  fileSizeBytes: number;
  createdAt: string; // ISO date string
  metadata?: string; // JSON string
}

export interface SearchDatasetResponse {
  datasets: SearchDatasetItem[];
  totalCount: number;
}

export class SearchDatasetService {
  static async searchDatasets(request: SearchDatasetRequest): Promise<SearchDatasetResponse> {
    const response = await apiClient.post<SearchDatasetResponse>('/datasets/search', request, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }
}

export default SearchDatasetService;
