// Enums
export enum RequestStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Canceled = 3
}

export enum RequestType {
  FullDataAccess = 0,
  NewDatasetUpload = 1
}

// Shared interfaces
export interface ApprovalRequestDto {
  id: number;
  requestType: RequestType;
  status: string;
  userJustification: string;
  adminComments?: string;
  requestedAt: string; // ISO date string
  processedAt?: string; // ISO date string
  requestingUserName: string;
  datasetId?: number;
  datasetName?: string;
  adminName?: string;
}

export interface ApprovalRequestFiltersDto {
  requestType?: RequestType;
  status?: RequestStatus;
  createdFrom?: string; // ISO date string
  createdTo?: string; // ISO date string
  userFullName?: string;
  skip?: number;
  take?: number;
}