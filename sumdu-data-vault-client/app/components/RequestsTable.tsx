import { useNavigate } from 'react-router';
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "~/components/ui/pagination";
import type { ApprovalRequestDto, RequestType, RequestStatus } from '../services/api/approval/types';

interface RequestsTableProps {
  requests: ApprovalRequestDto[];
  page: number;
  totalPages: number;
  totalCount: number;
  isLoading: boolean;
  showUserColumn?: boolean; // Чи показувати колонку з користувачем (для адміністраторів)
  onPageChange: (page: number) => void;
}

export function RequestsTable({
  requests,
  page,
  totalPages,
  totalCount,
  isLoading,
  showUserColumn = false,
  onPageChange
}: RequestsTableProps) {
  const navigate = useNavigate();

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

  // Функції навігації по сторінках
  const goToPrev = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const goToNext = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== page) {
      onPageChange(pageNumber);
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

  if (isLoading) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <p className="text-muted-foreground">Завантаження запитів...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-card border rounded-lg p-6">
        <p className="text-muted-foreground">
          Немає запитів, що відповідають обраним фільтрам.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Тип запиту</TableHead>
            <TableHead>Статус</TableHead>
            {showUserColumn && <TableHead>Користувач</TableHead>}
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
              {showUserColumn && (
                <TableCell className="font-medium">
                  {request.requestingUserName}
                </TableCell>
              )}
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
    </div>
  );
}
