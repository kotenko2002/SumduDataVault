import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { ArrowLeft, User, Calendar, FileText, CheckCircle, XCircle, Clock, AlertCircle, Check, X } from "lucide-react";
import GetRequestByIdAdminService from '~/services/api/approval/View/GetRequestByIdAdminService';
import ApproveRequestService from '~/services/api/approval/Manage/ApproveRequestService';
import RejectRequestService from '~/services/api/approval/Manage/RejectRequestService';
import type { ApprovalRequestDto } from '~/services/api/approval/types';

export default function ApprovalRequestDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<ApprovalRequestDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Стан для модальних вікон та обробки запитів
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [adminComments, setAdminComments] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const getRequestTypeLabel = (requestType: number): string => {
    switch (requestType) {
      case 0:
        return 'Повний доступ до даних';
      case 1:
        return 'Завантаження нового датасету';
      default:
        return 'Невідомий тип';
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

  const getRequestStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'Approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'Rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'Canceled':
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
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

  const openApproveDialog = () => {
    setAdminComments("");
    setIsApproveDialogOpen(true);
  };

  const openRejectDialog = () => {
    setAdminComments("");
    setIsRejectDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!id || !adminComments.trim()) return;
    
    setIsProcessing(true);
    try {
      await ApproveRequestService.approveRequest(parseInt(id), { adminComments: adminComments.trim() });
      console.log('Request approved successfully:', id);
      // Оновлюємо дані запиту після успішного схвалення
      await fetchRequest();
      setIsApproveDialogOpen(false);
      setAdminComments("");
    } catch (error) {
      console.error('Failed to approve request:', error);
      alert('Помилка при схваленні запиту. Спробуйте ще раз.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!id || !adminComments.trim()) return;
    
    setIsProcessing(true);
    try {
      await RejectRequestService.rejectRequest(parseInt(id), { adminComments: adminComments.trim() });
      console.log('Request rejected successfully:', id);
      // Оновлюємо дані запиту після успішного відхилення
      await fetchRequest();
      setIsRejectDialogOpen(false);
      setAdminComments("");
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('Помилка при відхиленні запиту. Спробуйте ще раз.');
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchRequest = async () => {
    if (!id) {
      setError('ID запиту не вказано');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const requestData = await GetRequestByIdAdminService.getRequestById(parseInt(id));
      setRequest(requestData);
    } catch (error) {
      console.error('Помилка при завантаженні запиту:', error);
      setError('Не вдалося завантажити деталі запиту');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border rounded-lg p-6">
            <p className="text-muted-foreground">Завантаження деталей запиту...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !request) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border rounded-lg p-6">
            <p className="text-red-600">{error || 'Запит не знайдено'}</p>
            <Button 
              variant="outline" 
              onClick={() => navigate('/approval-requests')}
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Повернутися до списку
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Заголовок з кнопкою назад */}
        <div className="flex items-end gap-2 mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/approval-requests')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
          <div className="flex items-end gap-2">
            <h1 className="text-3xl font-bold">{getRequestTypeLabel(request.requestType)}</h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRequestStatusColors(request.status).bg} ${getRequestStatusColors(request.status).text}`}>
              {getRequestStatusLabel(request.status)}
            </span>
          </div>
        </div>

        {/* Запит користувача */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Запит користувача
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Користувач:</span>
                <span className="font-medium">{request.requestingUserName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Дата запиту:</span>
                <span className="font-medium">
                  {new Date(request.requestedAt).toLocaleDateString('uk-UA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{request.userJustification}</p>
            </div>
          </CardContent>
        </Card>

        {/* Рішення адміністратора */}
        {request.adminComments && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Рішення адміністратора
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {request.adminName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Адміністратор:</span>
                    <span className="font-medium">{request.adminName}</span>
                  </div>
                )}
                {request.processedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Дата обробки:</span>
                    <span className="font-medium">
                      {new Date(request.processedAt).toLocaleDateString('uk-UA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{request.adminComments}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Об'єкт запиту */}
        {request.datasetId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Об'єкт запиту
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">ID: {request.datasetId}</p>
                  {request.datasetName && (
                    <p className="text-sm text-muted-foreground">{request.datasetName}</p>
                  )}
                </div>
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/dataset/${request.datasetId}`)}
                >
                  Переглянути датасет
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Кнопки дій для запитів в статусі "Pending" */}
        {request.status === 'Pending' && (
          <div className="flex justify-end gap-4">
            <Button 
              variant="destructive"
              className="flex items-center gap-2"
              onClick={openRejectDialog}
            >
              <X className="h-4 w-4" />
              Відхилити
            </Button>
            <Button 
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              onClick={openApproveDialog}
            >
              <Check className="h-4 w-4" />
              Схвалити
            </Button>
          </div>
        )}
      </div>

      {/* Модальне вікно для схвалення */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Схвалити запит</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="approve-comments">Коментар адміністратора</Label>
            <Textarea
              id="approve-comments"
              value={adminComments}
              onChange={(e) => setAdminComments(e.target.value)}
              placeholder="Наприклад: Запит схвалено. Доступ надано для наукового дослідження."
              className="min-h-28"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsApproveDialogOpen(false)}
              disabled={isProcessing}
            >
              Скасувати
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing || adminComments.trim().length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
              {isProcessing ? 'Схвалення...' : 'Схвалити'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Модальне вікно для відхилення */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Відхилити запит</DialogTitle>
            <DialogDescription>
              Введіть коментар адміністратора для відхилення запиту.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-comments">Коментар адміністратора</Label>
            <Textarea
              id="reject-comments"
              value={adminComments}
              onChange={(e) => setAdminComments(e.target.value)}
              placeholder="Наприклад: Запит відхилено. Необхідні додаткові документи для підтвердження мети використання."
              className="min-h-28"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRejectDialogOpen(false)}
              disabled={isProcessing}
            >
              Скасувати
            </Button>
            <Button
              onClick={handleReject}
              disabled={isProcessing || adminComments.trim().length === 0}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
            >
              <X className="h-4 w-4" />
              {isProcessing ? 'Відхилення...' : 'Відхилити'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
