import apiClient from '../../apiClient';

export interface RejectRequestRequest {
  adminComments: string;
}

export class RejectRequestService {
  static async rejectRequest(id: number, request: RejectRequestRequest): Promise<void> {
    await apiClient.post(`/requests/${id}/reject`, request, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export default RejectRequestService;
