import apiClient from '../../apiClient';

export class CancelRequestService {
  static async cancelRequest(id: number): Promise<void> {
    await apiClient.post(`/requests/${id}/cancel`, {}, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export default CancelRequestService;
