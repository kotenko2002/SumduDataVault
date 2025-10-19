import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "~/components/ui/pagination";
import { Filter, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import GetRequestsListService from '../services/api/approval/View/GetRequestsListService';
import type { ApprovalRequestDto, RequestType, RequestStatus, ApprovalRequestFiltersDto } from '../services/api/approval/types';
import { UserAutocomplete } from '../components/UserAutocomplete';

export default function ApprovalRequests() {
  const navigate = useNavigate();
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

  const getRequestTypeLabel = (requestType: RequestType): string => {
    switch (requestType) {
      case 0:
        return 'Повний доступ до даних';
      case 1:
        return 'Завантаження нового датасету';
      default:
        return 'Невідомий тип';
    }
  };

  const getRequestTypeColors = (requestType: RequestType): { bg: string; text: string } => {
    switch (requestType) {
      case 0: // Повний доступ до даних
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800'
        };
      case 1: // Завантаження нового датасету
        return {
          bg: 'bg-green-100',
          text: 'text-green-800'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800'
        };
    }
  };

  const getRequestStatusLabel = (status: string): string => {
    switch (status) {
      case 'Pending':
        return 'Очікує розгляду';
      case 'Approved':
        return 'Схвалено';
      case 'Rejected':
        return 'Відхилено';
      case 'Canceled':
        return 'Скасовано';
      default:
        return status;
    }
  };

  const getRequestStatusColors = (status: string): { bg: string; text: string } => {
    switch (status) {
      case 'Pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800'
        };
      case 'Approved':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800'
        };
      case 'Rejected':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800'
        };
      case 'Canceled':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800'
        };
    }
  };


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

  // Функції навігації по сторінках
  const goToPrev = () => {
    if (page > 1) {
      fetchRequests(page - 1);
    }
  };

  const goToNext = () => {
    if (page < totalPages) {
      fetchRequests(page + 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== page) {
      fetchRequests(pageNumber);
    }
  };

  // Формування простого списку сторінок (1 .. totalPages) з обрізанням
  const renderPageNumbers = () => {
    const pages: number[] = [];
    const maxButtons = 5;
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const start = Math.max(1, page - 2);
      const end = Math.min(totalPages, start + maxButtons - 1);
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
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
          {/* Результати */}
          {isLoading ? (
            <div className="bg-card border rounded-lg p-6">
              <p className="text-muted-foreground">Завантаження запитів...</p>
            </div>
          ) : requests.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Список запитів</CardTitle>
                <CardDescription>
                  Сторінка {page} з {totalPages} • Показано {requests.length} з {totalCount} запитів
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Тип запиту</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Користувач</TableHead>
                        <TableHead>Дата запиту</TableHead>
                        <TableHead className="w-[100px]">Дії</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requests.map((request) => (
                        <TableRow key={request.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-sm">
                            {request.id}
                          </TableCell>
                          <TableCell className="max-w-[120px] text-center">
                            <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium whitespace-normal break-words line-clamp-2 ${getRequestTypeColors(request.requestType).bg} ${getRequestTypeColors(request.requestType).text}`}>
                              {getRequestTypeLabel(request.requestType)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRequestStatusColors(request.status).bg} ${getRequestStatusColors(request.status).text}`}>
                              {getRequestStatusLabel(request.status)}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">
                            {request.requestingUserName}
                          </TableCell>
                          <TableCell className="max-w-[120px]">
                            <div className="text-sm whitespace-normal break-words line-clamp-2">
                              {new Date(request.requestedAt).toLocaleDateString('uk-UA', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => {
                                navigate(`/approval-request/${request.id}`);
                              }}
                              className="h-8"
                            >
                              Деталі
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Пагінація */}
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious onClick={goToPrev} className={page === 1 ? 'pointer-events-none opacity-50' : ''} />
                        </PaginationItem>
                        {renderPageNumbers().map((p) => (
                          <PaginationItem key={p}>
                            <PaginationLink isActive={p === page} onClick={() => goToPage(p)}>
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext onClick={goToNext} className={page === totalPages ? 'pointer-events-none opacity-50' : ''} />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="bg-card border rounded-lg p-6">
              <p className="text-muted-foreground">
                Немає запитів, що відповідають обраним фільтрам.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
