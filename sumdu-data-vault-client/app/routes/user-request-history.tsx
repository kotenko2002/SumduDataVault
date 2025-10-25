import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";
import GetUserRequestsService from '../services/api/approval/View/GetUserRequestsService';
import type { ApprovalRequestDto, RequestType, RequestStatus, UserRequestFiltersDto } from '../services/api/approval/types';
import { RequestsTable } from '../components/tables/RequestsTable';
import { REQUESTS } from '~/lib/queryKeys';

export default function UserRequestHistory() {
  // Стан для фільтрів
  const [filters, setFilters] = useState<UserRequestFiltersDto>({});
  const [requestTypeFilter, setRequestTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createdFromFilter, setCreatedFromFilter] = useState<string>("");
  const [createdToFilter, setCreatedToFilter] = useState<string>("");
  
  // Стан для управління розгортанням секцій
  const [isBasicFiltersOpen, setIsBasicFiltersOpen] = useState(true);
  const [isDateFiltersOpen, setIsDateFiltersOpen] = useState(false);
  
  // Стан для пагінації
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // Фіксований розмір сторінки

  // React Query для отримання списку запитів користувача
  const requestsQuery = useQuery({
    queryKey: [REQUESTS, filters, page, pageSize],
    queryFn: async () => {
      const skip = (page - 1) * pageSize;
      const requestFilters: UserRequestFiltersDto = {
        ...filters,
        skip: skip,
        take: pageSize
      };
      
      return await GetUserRequestsService.getUserRequests(requestFilters);
    },
    staleTime: 30000, // Дані вважаються свіжими 30 секунд
    gcTime: 300000, // Кеш зберігається 5 хвилин
  });

  // Обчислюємо загальну кількість та сторінки на основі отриманих даних
  const requests = requestsQuery.data || [];
  const isLoading = requestsQuery.isLoading;
  const isError = requestsQuery.isError;
  
  // Оскільки наш API не повертає totalCount, ми оцінюємо його на основі отриманих даних
  let totalCount = 0;
  let totalPages = 0;
  
  if (requests.length < pageSize) {
    // Якщо отримали менше записів ніж pageSize, то це остання сторінка
    totalCount = (page - 1) * pageSize + requests.length;
    totalPages = page;
  } else {
    // Якщо отримали повну сторінку, то можливо є ще сторінки
    totalCount = (page - 1) * pageSize + requests.length + 1; // +1 щоб показати що є ще сторінки
    totalPages = page + 1;
  }

  const applyFilters = () => {
    const newFilters: UserRequestFiltersDto = {};
    
    if (requestTypeFilter && requestTypeFilter !== "all") {
      newFilters.requestType = parseInt(requestTypeFilter) as RequestType;
    }
    
    if (statusFilter && statusFilter !== "all") {
      newFilters.status = parseInt(statusFilter) as RequestStatus;
    }
    
    if (createdFromFilter) {
      newFilters.createdFrom = new Date(createdFromFilter).toISOString();
    }
    
    if (createdToFilter) {
      newFilters.createdTo = new Date(createdToFilter).toISOString();
    }
    
    setFilters(newFilters);
    setPage(1); // Скидаємо на першу сторінку при застосуванні фільтрів
  };

  const clearFilters = () => {
    setRequestTypeFilter("all");
    setStatusFilter("all");
    setCreatedFromFilter("");
    setCreatedToFilter("");
    setFilters({});
    setPage(1); // Скидаємо на першу сторінку при очищенні фільтрів
  };

  // Обробник зміни сторінки
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Обробка станів завантаження та помилок
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Історія моїх запитів</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">Помилка при завантаженні запитів. Спробуйте ще раз.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Історія моїх запитів</h1>
      </div>

      {/* Адаптивний макет: вертикальний для малих екранів, горизонтальний для великих */}
      <div className="flex flex-col lg:flex-row lg:gap-6">
        {/* Бічна панель фільтрів - зліва на великих екранах */}
        <div className="lg:w-80 lg:flex-shrink-0 mb-6 lg:mb-0">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-4 w-4" />
                Фільтри
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Базові фільтри */}
              <Collapsible open={isBasicFiltersOpen} onOpenChange={setIsBasicFiltersOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-sm">
                    🔍 Базові фільтри
                    {isBasicFiltersOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  <div className="space-y-3">
                    {/* Фільтр за типом запиту */}
                    <div className="space-y-2">
                      <Label htmlFor="request-type-filter" className="text-sm">Тип запиту</Label>
                      <Select value={requestTypeFilter} onValueChange={setRequestTypeFilter}>
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue placeholder="Всі типи" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Всі типи</SelectItem>
                          <SelectItem value="0">Повний доступ до даних</SelectItem>
                          <SelectItem value="1">Завантаження нового датасету</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Фільтр за статусом */}
                    <div className="space-y-2">
                      <Label htmlFor="status-filter" className="text-sm">Статус</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-9 w-full">
                          <SelectValue placeholder="Всі статуси" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Всі статуси</SelectItem>
                          <SelectItem value="0">Очікує розгляду</SelectItem>
                          <SelectItem value="1">Схвалено</SelectItem>
                          <SelectItem value="2">Відхилено</SelectItem>
                          <SelectItem value="3">Скасовано</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Фільтри дат */}
              <Collapsible open={isDateFiltersOpen} onOpenChange={setIsDateFiltersOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-sm">
                    📅 Фільтри дат
                    {isDateFiltersOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  <div className="space-y-3">
                    {/* Фільтр за датою від */}
                    <div className="space-y-2">
                      <Label htmlFor="created-from-filter" className="text-sm">Дата від</Label>
                      <Input
                        id="created-from-filter"
                        type="date"
                        value={createdFromFilter}
                        onChange={(e) => setCreatedFromFilter(e.target.value)}
                        className="h-9 w-full"
                      />
                    </div>

                    {/* Фільтр за датою до */}
                    <div className="space-y-2">
                      <Label htmlFor="created-to-filter" className="text-sm">Дата до</Label>
                      <Input
                        id="created-to-filter"
                        type="date"
                        value={createdToFilter}
                        onChange={(e) => setCreatedToFilter(e.target.value)}
                        className="h-9 w-full"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Кнопки управління фільтрами */}
              <div className="flex gap-2 pt-2">
                <Button onClick={applyFilters} className="flex-1 h-9" disabled={isLoading}>
                  {isLoading ? "Завантаження..." : "Застосувати"}
                </Button>
                <Button variant="outline" onClick={clearFilters} className="h-9">
                  Очистити
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Основна область з результатами - справа на великих екранах */}
        <div className="flex-1 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Мої запити</CardTitle>
            </CardHeader>
            <CardContent>
              <RequestsTable
                requests={requests}
                page={page}
                totalPages={totalPages}
                totalCount={totalCount}
                isLoading={isLoading}
                showUserColumn={false}
                onPageChange={handlePageChange}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
