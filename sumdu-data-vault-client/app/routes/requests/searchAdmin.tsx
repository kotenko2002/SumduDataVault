import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";
import { UserAutocomplete } from '~/components/autocompletes/UserAutocomplete';
import { RequestsTable } from '~/components/tables/RequestsTable';
import { useRequestsAdminSearch, type RequestsAdminSearchFilters } from '~/hooks/useRequestsAdminSearch';

export default function SearchAdmin() {
  // Стан для управління розгортанням секцій
  const [isBasicFiltersOpen, setIsBasicFiltersOpen] = useState(true);
  const [isUserFiltersOpen, setIsUserFiltersOpen] = useState(false);
  const [isDateFiltersOpen, setIsDateFiltersOpen] = useState(false);
  
  // Використовуємо хук для роботи з запитами
  const {
    requests,
    totalCount,
    totalPages,
    currentPage,
    take,
    isLoading,
    isError,
    applyFilters,
    clearFilters,
    setPageNumber,
    setPageSize,
  } = useRequestsAdminSearch({ defaultPageSize: 10 });
  
  // Стан для форми (локальні зміни, які ще не застосовані)
  const [formData, setFormData] = useState<RequestsAdminSearchFilters>({
    requestType: undefined,
    status: undefined,
    userFullName: "",
    createdFrom: "",
    createdTo: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSelectChange = (field: 'requestType' | 'status', value: string) => {
    const numValue = value === "all" ? undefined : Number(value);
    setFormData(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  // Функція застосування фільтрів
  const handleApplyFilters = () => {
    const newFilters: RequestsAdminSearchFilters = {};
    
    if (formData.requestType !== undefined) {
      newFilters.requestType = formData.requestType;
    }
    
    if (formData.status !== undefined) {
      newFilters.status = formData.status;
    }
    
    if (formData.userFullName?.trim()) {
      newFilters.userFullName = formData.userFullName.trim();
    }
    
    if (formData.createdFrom) {
      newFilters.createdFrom = new Date(formData.createdFrom).toISOString();
    }
    
    if (formData.createdTo) {
      newFilters.createdTo = new Date(formData.createdTo).toISOString();
    }
    
    applyFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFormData({
      requestType: undefined,
      status: undefined,
      userFullName: "",
      createdFrom: "",
      createdTo: ""
    });
    clearFilters();
  };

  // Обробка станів завантаження та помилок
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Управління запитами</h1>
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
                      <Select 
                        value={formData.requestType?.toString() || "all"} 
                        onValueChange={(value) => handleSelectChange('requestType', value)}
                      >
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
                      <Select 
                        value={formData.status?.toString() || "all"} 
                        onValueChange={(value) => handleSelectChange('status', value)}
                      >
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
                        value={formData.createdFrom || ""}
                        onChange={(e) => handleInputChange('createdFrom', e.target.value)}
                        className="h-9 w-full"
                      />
                    </div>

                    {/* Фільтр за датою до */}
                    <div className="space-y-2">
                      <Label htmlFor="created-to-filter" className="text-sm">Дата до</Label>
                      <Input
                        id="created-to-filter"
                        type="date"
                        value={formData.createdTo || ""}
                        onChange={(e) => handleInputChange('createdTo', e.target.value)}
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
                        value={formData.userFullName || ""}
                        onChange={(value) => handleInputChange('userFullName', value)}
                        placeholder="Введіть ПІБ користувача"
                        className="w-full"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Кнопки управління фільтрами */}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleApplyFilters} className="flex-1 h-9" disabled={isLoading}>
                  {isLoading ? "Завантаження..." : "Застосувати"}
                </Button>
                <Button variant="outline" onClick={handleClearFilters} className="h-9">
                  Очистити
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Основна область з результатами - справа на великих екранах */}
        <div className="flex-1 min-w-0">
          {/* Обробка помилок */}
          {isError && (
            <Card>
              <CardContent className="p-6">
                <p className="text-red-600">Помилка при завантаженні запитів. Спробуйте ще раз.</p>
              </CardContent>
            </Card>
          )}

          {/* Повідомлення про відсутність результатів */}
          {!isLoading && !isError && requests?.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Filter className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold">Результати не знайдено</h3>
                    <p className="text-muted-foreground">Спробуйте змінити критерії пошуку</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Результати пошуку */}
          {requests && requests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Список запитів</CardTitle>
              </CardHeader>
              <CardContent>
                <RequestsTable
                  requests={requests}
                  isLoading={isLoading}
                  showUserColumn={true}
                  pageNumber={currentPage}
                  pageSize={take}
                  totalPages={totalPages}
                  totalRows={totalCount}
                  pageSizeOptions={[5, 10, 20, 50, 100]}
                  changePageNumber={setPageNumber}
                  changePageSize={setPageSize}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

    </div>
  );
}
