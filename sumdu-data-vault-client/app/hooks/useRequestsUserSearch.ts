import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import GetUserRequestsService from '~/services/api/approval/View/GetUserRequestsService';
import type { UserRequestFiltersDto } from '~/services/api/approval/types';
import { REQUESTS } from '~/lib/queryKeys';

export interface RequestsUserSearchFilters {
  requestType?: number;
  status?: number;
  createdFrom?: string;
  createdTo?: string;
}

interface UseRequestsUserSearchProps {
  defaultPageSize?: number;
}

export const useRequestsUserSearch = ({ defaultPageSize = 10 }: UseRequestsUserSearchProps = {}) => {
  const [filters, setFilters] = useState<RequestsUserSearchFilters | null>(null);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(defaultPageSize);

  // React Query для отримання списку запитів користувача
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [REQUESTS, 'user', filters, skip, take],
    queryFn: async () => {
      const requestFilters: UserRequestFiltersDto = {
        ...(filters || {}),
        skip,
        take
      };

      return await GetUserRequestsService.getUserRequests(requestFilters);
    },
  });

  const totalPages = useMemo(
    () => (data?.total ? Math.ceil(data?.total / take) : 0),
    [data?.total, take]
  );
  
  const currentPage = useMemo(
    () => Math.floor(skip / take) + 1,
    [skip, take]
  );

  // Функції для управління фільтрами
  const applyFilters = (newFilters: RequestsUserSearchFilters) => {
    setFilters(newFilters);
    setSkip(0); // Скидаємо на першу сторінку при застосуванні фільтрів
  };

  const clearFilters = () => {
    setFilters(null);
    setSkip(0);
  };

  // Функції для управління пагінацією
  const setPageNumber = (pageNumber: number) => {
    setSkip((pageNumber - 1) * take);
  };

  const setPageSize = (newTake: number) => {
    setTake(newTake);
    setSkip(0); // Скидаємо на першу сторінку при зміні розміру сторінки
  };

  return {
    // Дані
    requests: data?.requests || [],
    totalCount: data?.total || 0,
    totalPages,
    currentPage,
    take,
    
    // Стани завантаження
    isLoading,
    isError,
    
    // Функції
    applyFilters,
    clearFilters,
    setPageNumber,
    setPageSize,
  };
};
