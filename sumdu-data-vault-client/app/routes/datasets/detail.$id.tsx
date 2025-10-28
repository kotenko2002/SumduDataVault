import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { MetadataFieldAutocomplete } from "~/components/autocompletes/MetadataFieldAutocomplete";
import { MetadataValueAutocomplete } from "~/components/autocompletes/MetadataValueAutocomplete";
import { ArrowLeft, Download, Calendar, FileText, Hash, Database, Key } from "lucide-react";
import GetDatasetByIdService, { AccessStatus, type GetDatasetByIdResponse } from "~/services/api/datasets/GetDatasetByIdService";
import DownloadDatasetService from "~/services/api/datasets/DownloadDatasetService";
import { useState } from "react";
import RequestDatasetDownloadAccessService, { type RequestDatasetDownloadAccessRequest } from "~/services/api/datasets/RequestDatasetDownloadAccessService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { useAuth } from "~/context/AuthContext";
import { DATASET, REQUESTS } from "~/lib/queryKeys";
import {useParams} from "react-router";

export default function DatasetDetails() {
  const { id } = useParams<{ id: string }>();

  const queryClient = useQueryClient();
  const [isAccessDialogOpen, setIsAccessDialogOpen] = useState(false);
  const [justificationText, setJustificationText] = useState("");
  const { userRole } = useAuth();

  // React Query для отримання датасету
  const datasetQuery = useQuery({
    queryKey: [DATASET, id, userRole],
    queryFn: async (): Promise<GetDatasetByIdResponse> => {
      return await GetDatasetByIdService.getDatasetById(Number(id));
    },
    enabled: !!id && userRole !== null,
  });

  // React Query mutation для завантаження файлу
  const downloadMutation = useMutation({
    mutationFn: (id: number) => DownloadDatasetService.downloadAndSaveDataset(id)
  });

  // React Query mutation для запиту доступу
  const requestAccessMutation = useMutation({
    mutationFn: (data: RequestDatasetDownloadAccessRequest) => 
      RequestDatasetDownloadAccessService.createAccessRequest(data),
    onSuccess: async (data, variables) => {
      // Інвалідуємо кеш для оновлення списків запитів та конкретного датасету
      await queryClient.invalidateQueries({ queryKey: [REQUESTS] });
      await queryClient.invalidateQueries({ queryKey: [DATASET, id] });
      
      setIsAccessDialogOpen(false);
      setJustificationText("");
    },
  });

  const handleDownload = () => {
    downloadMutation.mutate(Number(id));
  };

  const handleRequestAccess = () => {
    if (!justificationText || justificationText.trim().length === 0) {
      return;
    }
    requestAccessMutation.mutate({
      datasetId: Number(id),
      userJustification: justificationText.trim(),
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    if (bytes === 0) return '0 Б';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (datasetQuery.isLoading || userRole === null) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (datasetQuery.error || !datasetQuery.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
          </div>
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-semibold mb-2">Помилка завантаження</h3>
              <p className="text-muted-foreground">
                {datasetQuery.error?.message || 'Датасет не знайдено'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{datasetQuery.data.fileName}</h1>
              <p className="text-muted-foreground mt-2">
                ID: {datasetQuery.data.id} • Створено: {formatDate(datasetQuery.data.createdAt)}
              </p>
            </div>
            {datasetQuery.data.accessStatus === AccessStatus.Approved || 
             (datasetQuery.data.accessStatus === AccessStatus.NotAvailable && userRole === "Admin") ? (
              <Button 
                onClick={handleDownload}
                disabled={downloadMutation.isPending}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {downloadMutation.isPending ? 'Завантаження...' : 'Завантажити CSV'}
              </Button>
            ) : datasetQuery.data.accessStatus === AccessStatus.Requested ? (
              <Button 
                disabled={true}
                className="flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                Запит на розгляді
              </Button>
            ) : datasetQuery.data.accessStatus === AccessStatus.NotAvailable ? (
              <Button 
                disabled={true}
                className="flex items-center gap-2"
              >
                <Database className="h-4 w-4" />
                Датасет недоступний
              </Button>
            ) : (
              <Dialog open={isAccessDialogOpen} onOpenChange={setIsAccessDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    Запросити доступ
                    <Key className="h-2 w-2" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Запит на доступ до датасету</DialogTitle>
                    <DialogDescription>
                      Вкажіть коротке обґрунтування, чому вам потрібен доступ до даних.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Label htmlFor="justification">Обґрунтування</Label>
                    <Textarea
                      id="justification"
                      value={justificationText}
                      onChange={(e) => setJustificationText(e.target.value)}
                      placeholder="Наприклад: Потрібен для наукового дослідження"
                      className="min-h-28"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAccessDialogOpen(false)}
                      disabled={requestAccessMutation.isPending}
                    >
                      Скасувати
                    </Button>
                    <Button
                      onClick={handleRequestAccess}
                      disabled={requestAccessMutation.isPending || justificationText.trim().length === 0}
                      className="flex items-center gap-2"
                    >
                      {requestAccessMutation.isPending ? 'Надсилання...' : 'Надіслати запит'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основна інформація */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Опис датасету
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{datasetQuery.data.description}</p>
              </CardContent>
            </Card>

            {datasetQuery.data.previewLines && datasetQuery.data.previewLines.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Попередній перегляд даних</CardTitle>
                  <CardDescription>
                    Перші рядки з CSV файлу
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        {datasetQuery.data.previewLines[0]?.split(',').map((header: string, index: number) => (
                          <TableHead key={index} className="font-bold">
                            {header.trim().charAt(0).toUpperCase() + header.trim().slice(1).toLowerCase()}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {datasetQuery.data.previewLines.slice(1).map((row: string, rowIndex: number) => (
                        <TableRow key={rowIndex} className="odd:bg-white even:bg-gray-50 hover:bg-muted/50">
                          {row.split(',').map((cell: string, cellIndex: number) => (
                            <TableCell key={cellIndex}>
                              {cell.trim()}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}



          </div>

          {/* Бічна панель */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Період збору даних
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">З:</span>
                    <span className="font-medium">{formatDate(datasetQuery.data.collectedFrom)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">До:</span>
                    <span className="font-medium">{formatDate(datasetQuery.data.collectedTo)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Відомості про файл
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Кількість рядків</p>
                      <p className="text-2xl font-bold">{datasetQuery.data.rowCount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Розмір файлу</p>
                      <p className="text-2xl font-bold">{formatFileSize(datasetQuery.data.fileSizeBytes)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Метадані</CardTitle>
                <CardDescription>
                  {datasetQuery.data.metadataItems.length} полів метаданих
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {datasetQuery.data.metadataItems.length > 0 ? (
                  <div className="space-y-3">
                    {datasetQuery.data.metadataItems.map((item: any) => (
                      <div key={item.id} className="flex gap-2">
                        <div className="flex-1">
                          <MetadataFieldAutocomplete
                            value={item.field}
                            onChange={() => {}} // disabled - не змінюємо значення
                            placeholder="Назва поля"
                            className="pointer-events-none opacity-60"
                            disabled={true}
                          />
                        </div>
                        <div className="flex-1">
                          <MetadataValueAutocomplete
                            value={item.value}
                            onChange={() => {}} // disabled - не змінюємо значення
                            fieldName={item.field}
                            placeholder="Значення"
                            disabled={true}
                            className="pointer-events-none opacity-60"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Метадані відсутні</p>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
