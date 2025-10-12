import apiClient from '../../apiClient';

export interface ApproveRequestRequest {
  adminComments: string;
}

export class ApproveRequestService {
  static async approveRequest(id: number, request: ApproveRequestRequest): Promise<void> {
    await apiClient.post(`/requests/${id}/approve`, request, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export default ApproveRequestService;
