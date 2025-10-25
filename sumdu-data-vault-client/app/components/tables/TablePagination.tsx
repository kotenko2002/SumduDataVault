import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "~/components/ui/pagination";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({
  page,
  totalPages,
  onPageChange
}: TablePaginationProps) {
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

  // Не показуємо пагінацію, якщо всього одна сторінка
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={goToPrev} 
              className={page === 1 ? 'pointer-events-none opacity-50' : ''} 
            />
          </PaginationItem>
          {renderPageNumbers().map((p) => (
            <PaginationItem key={p}>
              <PaginationLink 
                isActive={p === page} 
                onClick={() => goToPage(p)}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext 
              onClick={goToNext} 
              className={page === totalPages ? 'pointer-events-none opacity-50' : ''} 
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
