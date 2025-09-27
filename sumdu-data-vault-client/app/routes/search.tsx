import { useState } from "react";
import type { Route } from "./+types/search";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "~/components/ui/hover-card";
import { ChevronDown, ChevronUp, Search as SearchComponent, X, Info } from "lucide-react";
import SearchDatasetService, { type SearchDatasetRequest } from "~/services/api/datasets/SearchDatasetService";
import { MetadataFieldAutocomplete } from "~/components/MetadataFieldAutocomplete";
import { MetadataValueAutocomplete } from "~/components/MetadataValueAutocomplete";

interface MetadataField {
  id: string;
  key: string;
  value: string;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Пошук датасетів - SumduDataVault" },
    { name: "description", content: "Пошук та фільтрація датасетів в системі" },
  ];
}

export default function Search() {
  const [isBasicFiltersOpen, setIsBasicFiltersOpen] = useState(true);
  const [isDateFiltersOpen, setIsDateFiltersOpen] = useState(false);
  const [isSizeFiltersOpen, setIsSizeFiltersOpen] = useState(false);
  const [isMetadataFiltersOpen, setIsMetadataFiltersOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([]);
  
  const [formData, setFormData] = useState<SearchDatasetRequest>({
    description: "",
    region: "",
    collectedFrom: "",
    collectedTo: "",
    rowCount: { min: undefined, max: undefined },
    fileSizeBytes: { min: undefined, max: undefined },
    metadata: {}
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRangeChange = (field: 'rowCount' | 'fileSizeBytes', type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [type]: numValue
      }
    }));
  };


  const addMetadataField = () => {
    const newField: MetadataField = {
      id: Date.now().toString(),
      key: "",
      value: ""
    };
    setMetadataFields(prev => [...prev, newField]);
  };

  const removeMetadataField = (id: string) => {
    setMetadataFields(prev => prev.filter(field => field.id !== id));
  };

  const updateMetadataField = (id: string, fieldType: 'key' | 'value', value: string) => {
    setMetadataFields(prev => 
      prev.map(field => 
        field.id === id ? { ...field, [fieldType]: value } : field
      )
    );
  };

  const convertMetadataToSearch = (): Record<string, string> => {
    const metadataObj: Record<string, string> = {};
    metadataFields.forEach(field => {
      if (field.key.trim() && field.value.trim()) {
        metadataObj[field.key.trim()] = field.value.trim();
      }
    });
    return metadataObj;
  };

  const clearFilters = () => {
    setFormData({
      description: "",
      region: "",
      collectedFrom: "",
      collectedTo: "",
      rowCount: { min: undefined, max: undefined },
      fileSizeBytes: { min: undefined, max: undefined },
      metadata: {}
    });
    setMetadataFields([]);
    setSearchResults([]);
    setTotalCount(0);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      // Фільтруємо порожні значення
      const filteredData: SearchDatasetRequest = {};
      
      if (formData.description?.trim()) filteredData.description = formData.description.trim();
      if (formData.region?.trim()) filteredData.region = formData.region.trim();
      if (formData.collectedFrom) filteredData.collectedFrom = formData.collectedFrom;
      if (formData.collectedTo) filteredData.collectedTo = formData.collectedTo;
      
      if (formData.rowCount?.min !== undefined || formData.rowCount?.max !== undefined) {
        filteredData.rowCount = formData.rowCount;
      }
      
      if (formData.fileSizeBytes?.min !== undefined || formData.fileSizeBytes?.max !== undefined) {
        filteredData.fileSizeBytes = formData.fileSizeBytes;
      }
      
      const metadataFromFields = convertMetadataToSearch();
      if (Object.keys(metadataFromFields).length > 0) {
        filteredData.metadata = metadataFromFields;
      }

      const result = await SearchDatasetService.searchDatasets(filteredData);
      setSearchResults(result.datasets);
      setTotalCount(result.totalCount);
    } catch (error) {
      console.error('Помилка пошуку:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Пошук датасетів</h1>
        <p className="text-muted-foreground mt-2">
          Знайдіть потрібні датасети за допомогою різних фільтрів
        </p>
      </div>

      {/* Адаптивний макет: вертикальний для малих екранів, горизонтальний для великих */}
      <div className="flex flex-col lg:flex-row lg:gap-6">
        {/* Бічна панель фільтрів - зліва на великих екранах */}
        <div className="lg:w-80 lg:flex-shrink-0 mb-6 lg:mb-0">
          <Card className="sticky top-4">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <SearchComponent className="h-4 w-4" />
                Фільтри пошуку
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
                    <div className="space-y-1">
                      <Label htmlFor="description" className="text-sm">Опис</Label>
                      <Input
                        id="description"
                        placeholder="Введіть опис..."
                        value={formData.description || ""}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="region" className="text-sm">Регіон</Label>
                      <Input
                        id="region"
                        placeholder="Введіть регіон..."
                        value={formData.region || ""}
                        onChange={(e) => handleInputChange('region', e.target.value)}
                        className="h-9"
                      />
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
                    <div className="space-y-1">
                      <Label htmlFor="collectedFrom" className="text-sm">Дата збору від</Label>
                      <Input
                        id="collectedFrom"
                        type="date"
                        value={formData.collectedFrom || ""}
                        onChange={(e) => handleInputChange('collectedFrom', e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="collectedTo" className="text-sm">Дата збору до</Label>
                      <Input
                        id="collectedTo"
                        type="date"
                        value={formData.collectedTo || ""}
                        onChange={(e) => handleInputChange('collectedTo', e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Фільтри розміру */}
              <Collapsible open={isSizeFiltersOpen} onOpenChange={setIsSizeFiltersOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-sm">
                    📊 Фільтри розміру
                    {isSizeFiltersOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 mt-3">
                  {/* Кількість рядків */}
                  <div className="space-y-1">
                    <Label className="text-sm">Кількість рядків</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Мін"
                        type="number"
                        value={formData.rowCount?.min || ""}
                        onChange={(e) => handleRangeChange('rowCount', 'min', e.target.value)}
                        className="h-9"
                      />
                      <Input
                        placeholder="Макс"
                        type="number"
                        value={formData.rowCount?.max || ""}
                        onChange={(e) => handleRangeChange('rowCount', 'max', e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>

                  {/* Розмір файлу */}
                  <div className="space-y-1">
                    <Label className="text-sm">Розмір файлу (байти)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Мін"
                        type="number"
                        value={formData.fileSizeBytes?.min || ""}
                        onChange={(e) => handleRangeChange('fileSizeBytes', 'min', e.target.value)}
                        className="h-9"
                      />
                      <Input
                        placeholder="Макс"
                        type="number"
                        value={formData.fileSizeBytes?.max || ""}
                        onChange={(e) => handleRangeChange('fileSizeBytes', 'max', e.target.value)}
                        className="h-9"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Фільтри метаданих */}
              <Collapsible open={isMetadataFiltersOpen} onOpenChange={setIsMetadataFiltersOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-sm">
                    🏷️ Метадані
                    {isMetadataFiltersOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 mt-3">
                  <div className="text-sm text-muted-foreground">
                    Додайте додаткові поля для пошуку за метаданими
                  </div>
                  {metadataFields.map((field) => (
                    <div key={field.id} className="flex gap-2">
                      <div className="flex-1">
                        <MetadataFieldAutocomplete
                          value={field.key}
                          onChange={(value) => updateMetadataField(field.id, 'key', value)}
                          placeholder="Назва поля"
                        />
                      </div>
                      <div className="flex-1">
                        <MetadataValueAutocomplete
                          value={field.value}
                          onChange={(value) => updateMetadataField(field.id, 'value', value)}
                          fieldName={field.key}
                          placeholder="Значення"
                          disabled={!field.key.trim()}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeMetadataField(field.id)}
                        className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addMetadataField}
                    className="w-full h-9"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Додати поле метаданих
                  </Button>

                  {metadataFields.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Попередній перегляд:</p>
                      <pre className="text-xs font-mono text-gray-800 bg-white p-2 rounded border overflow-x-auto">
                        {JSON.stringify(convertMetadataToSearch(), null, 2) || "{}"}
                      </pre>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>

              {/* Кнопки дій */}
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSearch} disabled={isLoading} className="flex-1 h-9">
                  {isLoading ? "Пошук..." : "Шукати"}
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
          {/* Результати пошуку */}
          {searchResults.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Результати пошуку</CardTitle>
                <CardDescription>
                  Знайдено {totalCount} датасетів
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Опис</TableHead>
                        <TableHead>Регіон</TableHead>
                        <TableHead>Дата збору від</TableHead>
                        <TableHead>Дата збору до</TableHead>
                        <TableHead>Рядків</TableHead>
                        <TableHead>Розмір</TableHead>
                        <TableHead>Метадані</TableHead>
                        <TableHead className="w-[100px]">Дії</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((dataset) => (
                        <TableRow key={dataset.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-sm">
                            {dataset.id}
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="max-w-[200px] truncate" title={dataset.description}>
                              {dataset.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            {dataset.region || 'Не вказано'}
                          </TableCell>
                          <TableCell>
                            {dataset.collectedFrom ? new Date(dataset.collectedFrom).toLocaleDateString('uk-UA') : 'Не вказано'}
                          </TableCell>
                          <TableCell>
                            {dataset.collectedTo ? new Date(dataset.collectedTo).toLocaleDateString('uk-UA') : 'Не вказано'}
                          </TableCell>
                          <TableCell>
                            {dataset.rowCount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {(dataset.fileSizeBytes / 1024).toFixed(1)} KB
                          </TableCell>
                          <TableCell>
                            {dataset.metadata ? (
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors">
                                    <Info className="h-4 w-4" />
                                    <span className="text-sm">
                                      {(() => {
                                        try {
                                          const parsed = JSON.parse(dataset.metadata);
                                          return Object.keys(parsed).length + ' полів';
                                        } catch {
                                          return '1 поле';
                                        }
                                      })()}
                                    </span>
                                  </div>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-semibold">Метадані</h4>
                                    <div className="text-xs">
                                      <pre className="whitespace-pre-wrap break-words bg-gray-50 p-2 rounded border max-h-40 overflow-y-auto">
                                        {(() => {
                                          try {
                                            const parsed = JSON.parse(dataset.metadata);
                                            return JSON.stringify(parsed, null, 2);
                                          } catch {
                                            return dataset.metadata;
                                          }
                                        })()}
                                      </pre>
                                    </div>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            ) : (
                              <span className="text-muted-foreground text-sm">Немає</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.location.href = `/dataset/${dataset.id}`}
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
