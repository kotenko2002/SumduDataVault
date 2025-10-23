import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";
import GetRequestsListService from '../services/api/approval/View/GetRequestsListService';
import type { ApprovalRequestDto, RequestType, RequestStatus, ApprovalRequestFiltersDto } from '../services/api/approval/types';
import { UserAutocomplete } from '../components/UserAutocomplete';
import { RequestsTable } from '../components/RequestsTable';

export default function ApprovalRequests() {
  const [requests, setRequests] = useState<ApprovalRequestDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Стан для фільтрів
  const [filters, setFilters] = useState<ApprovalRequestFiltersDto>({});
  const [requestTypeFilter, setRequestTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userNameFilter, setUserNameFilter] = useState<string>("");
  const [createdFromFilter, setCreatedFromFilter] = useState<string>("");
  const [createdToFilter, setCreatedToFilter] = useState<string>("");
  
  // Стан для управління розгортанням секцій
  const [isBasicFiltersOpen, setIsBasicFiltersOpen] = useState(true);
  const [isUserFiltersOpen, setIsUserFiltersOpen] = useState(false);
  const [isDateFiltersOpen, setIsDateFiltersOpen] = useState(false);
  
  // Стан для пагінації
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // Фіксований розмір сторінки
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);


  const applyFilters = () => {
    const newFilters: ApprovalRequestFiltersDto = {};
    
    if (requestTypeFilter && requestTypeFilter !== "all") {
      newFilters.requestType = parseInt(requestTypeFilter) as RequestType;
    }
    
    if (statusFilter && statusFilter !== "all") {
      newFilters.status = parseInt(statusFilter) as RequestStatus;
    }
    
    if (userNameFilter && userNameFilter.trim()) {
      newFilters.userFullName = userNameFilter.trim();
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
    setUserNameFilter("");
    setCreatedFromFilter("");
    setCreatedToFilter("");
    setFilters({});
    setPage(1); // Скидаємо на першу сторінку при очищенні фільтрів
  };

  const fetchRequests = async (pageNumber?: number) => {
    setIsLoading(true);
    try {
      const currentPage = pageNumber ?? page;
      const skip = (currentPage - 1) * pageSize;
      
      const requestFilters: ApprovalRequestFiltersDto = {
        ...filters,
        skip: skip,
        take: pageSize
      };
      
      const requestsData = await GetRequestsListService.getRequestsList(requestFilters);
      console.log('Requests data:', requestsData);
      setRequests(requestsData);
      
      // Оскільки наш API не повертає totalCount, ми оцінюємо його на основі отриманих даних
      // Якщо отримали менше записів ніж pageSize, то це остання сторінка
      if (requestsData.length < pageSize) {
        setTotalCount(skip + requestsData.length);
        setTotalPages(currentPage);
      } else {
        // Якщо отримали повну сторінку, то можливо є ще сторінки
        setTotalCount(skip + requestsData.length + 1); // +1 щоб показати що є ще сторінки
        setTotalPages(currentPage + 1);
      }
      
      setPage(currentPage);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обробник зміни сторінки
  const handlePageChange = (newPage: number) => {
    fetchRequests(newPage);
  };

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Управління запитами</h1>
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

              {/* Фільтри користувачів */}
              <Collapsible open={isUserFiltersOpen} onOpenChange={setIsUserFiltersOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-sm">
                    👤 Фільтри користувачів
                    {isUserFiltersOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  <div className="space-y-3">
                    {/* Фільтр за користувачем */}
                    <div className="space-y-2">
                      <Label htmlFor="user-name-filter" className="text-sm">Користувач</Label>
                      <UserAutocomplete
                        value={userNameFilter}
                        onChange={setUserNameFilter}
                        placeholder="Введіть ПІБ користувача"
                        className="w-full"
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
              <CardTitle className="text-lg">Список запитів</CardTitle>
              <CardDescription>
                Сторінка {page} з {totalPages} • Показано {requests.length} з {totalCount} запитів
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RequestsTable
                requests={requests}
                page={page}
                totalPages={totalPages}
                totalCount={totalCount}
                isLoading={isLoading}
                showUserColumn={true}
                onPageChange={handlePageChange}
              />
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
