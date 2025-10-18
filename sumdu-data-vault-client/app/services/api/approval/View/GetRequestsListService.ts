import apiClient from '../../apiClient';
import type {ApprovalRequestDto, ApprovalRequestFiltersDto} from '../types';

export class GetRequestsListService {
  static async getRequestsList(filters?: ApprovalRequestFiltersDto): Promise<ApprovalRequestDto[]> {
    // Підготовка фільтрів з значеннями за замовчуванням для пагінації
    const requestFilters: ApprovalRequestFiltersDto = {
      ...filters,
      // Якщо skip не вказано, залишаємо undefined (сервер встановить 0)
      // Якщо take не вказано, залишаємо undefined (сервер встановить 10)
      // userFullName - фільтр за ПІБ користувача (повна форма)
    };

    const response = await apiClient.post<ApprovalRequestDto[]>('/requests/admin', requestFilters, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }
}

export default GetRequestsListService;
