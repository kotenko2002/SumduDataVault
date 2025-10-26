import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "~/components/ui/pagination";

export interface TableFooterProps {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalRows: number;
  pageSizeOptions: number[];
  changePageNumber: (pageNumber: number) => void;
  changePageSize: (pageSize: number) => void;
}

const MIN_PAGE_NUMBER = 1;

export const TableFooter: React.FC<TableFooterProps> = ({
  pageNumber,
  pageSize,
  totalPages,
  totalRows,
  pageSizeOptions,
  changePageNumber,
  changePageSize,
}) => {
  const [currentPageSearch, setCurrentPageSearch] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (currentPageSearch !== undefined && currentPageSearch > totalPages) {
      setCurrentPageSearch(totalPages);
    }
  }, [totalPages]);

  const handlePageSizeChange = (value: string) => changePageSize(+value);
  const handlePageNumberChange = (value?: number) => changePageNumber(value || MIN_PAGE_NUMBER);

  const handleCurrentPageSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = +event.target.value.replace(/\D/g, '');

    if (searchValue === 0) {
      setCurrentPageSearch(undefined);
    } else if (searchValue > totalPages) {
      setCurrentPageSearch(totalPages);
    } else {
      setCurrentPageSearch(searchValue);
    }
  };

  const handleCurrentPageSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    changePageNumber(currentPageSearch ?? MIN_PAGE_NUMBER);
  };

  // Функції навігації по сторінках
  const goToPrev = () => {
    if (pageNumber > 1) {
      changePageNumber(pageNumber - 1);
    }
  };

  const goToNext = () => {
    if (pageNumber < totalPages) {
      changePageNumber(pageNumber + 1);
    }
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages && pageNum !== pageNumber) {
      changePageNumber(pageNum);
    }
  };

  // Формування простого списку сторінок з обрізанням
  const renderPageNumbers = () => {
    const pages: number[] = [];
    const maxButtons = 5;
    if (totalPages <= maxButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const start = Math.max(1, pageNumber - 2);
      const end = Math.min(totalPages, start + maxButtons - 1);
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between mt-4">
      {/* Page Size Section */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm">Size:</span>
        <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">of {totalRows} Results</span>
      </div>

      {/* Page Navigation Section */}
      <div className="flex items-center gap-4">
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={goToPrev} 
                  className={pageNumber === 1 ? 'pointer-events-none opacity-50' : ''} 
                />
              </PaginationItem>
              {renderPageNumbers().map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink 
                    isActive={p === pageNumber} 
                    onClick={() => goToPage(p)}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={goToNext} 
                  className={pageNumber === totalPages ? 'pointer-events-none opacity-50' : ''} 
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* Page Input - показуємо тільки якщо більше однієї сторінки */}
        {totalPages > 1 && (
          <form onSubmit={handleCurrentPageSearchSubmit} className="flex items-center gap-2">
            <span className="font-semibold text-sm">Page</span>
            <Input
              type="text"
              value={currentPageSearch?.toString() ?? ''}
              onChange={handleCurrentPageSearch}
              className="w-12 h-8 text-center"
            />
            <Button type="submit" variant="outline" size="sm">
              Go
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
