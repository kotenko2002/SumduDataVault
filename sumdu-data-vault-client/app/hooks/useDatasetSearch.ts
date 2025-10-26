import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import SearchDatasetService, { type SearchDatasetRequest } from '~/services/api/datasets/SearchDatasetService';
import { DATASETS } from '~/lib/queryKeys';

export interface DatasetSearchFilters {
  description?: string;
  region?: string;
  collectedFrom?: string;
  collectedTo?: string;
  rowCount?: { min?: number; max?: number };
  fileSizeBytes?: { min?: number; max?: number };
  metadata?: Record<string, string>;
}

interface UseDatasetSearchProps {
  defaultPageSize?: number;
}

export const useDatasetSearch = ({ defaultPageSize = 10 }: UseDatasetSearchProps = {}) => {
  const [filters, setFilters] = useState<DatasetSearchFilters | null>(null);
  const [skip, setSkip] = useState(0);
  const [take, setTake] = useState(defaultPageSize);

  // React Query для пошуку датасетів
  const {
      data,
      isLoading,
      isError,
  } = useQuery({
    queryKey: [DATASETS, filters, skip, take],
    queryFn: async () => {
      const request: SearchDatasetRequest = {
        ...(filters || {}),
        skip,
        take
      };

      return await SearchDatasetService.searchDatasets(request);
    },
  });

  const totalPages = useMemo(
      () => (data?.totalCount ? Math.ceil(data?.totalCount / take) : 0),
    [data?.totalCount, take]
  );
  
  const currentPage = useMemo(
    () => Math.floor(skip / take) + 1,
    [skip, take]
  );

  // Функції для управління фільтрами
  const applyFilters = (newFilters: DatasetSearchFilters) => {
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
    datasets: data?.datasets || [],
    totalCount: data?.totalCount || 0,
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
