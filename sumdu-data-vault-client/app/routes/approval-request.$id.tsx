import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { ArrowLeft, User, Calendar, FileText, Check, X } from "lucide-react";
import { useAuth } from '~/context/AuthContext';
import type { ApprovalRequestDto } from '~/services/api/approval/types';
import apiClient from '~/services/api/apiClient';
import { REQUESTS, REQUEST } from '~/lib/queryKeys';

export default function ApprovalRequestDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { userRole } = useAuth();
  
  const queryClient = useQueryClient();

  // React Query для отримання запиту
  const requestQuery = useQuery({
    queryKey: [REQUEST, id, userRole],
    queryFn: async () => {
      if (!id) return null;
      
      const response = userRole === 'Admin' 
        ? await apiClient.get<ApprovalRequestDto>(`/requests/admin/${id}`, {
            headers: { 'Content-Type': 'application/json' }
          })
        : await apiClient.get<ApprovalRequestDto>(`/requests/${id}`, {
            headers: { 'Content-Type': 'application/json' }
          });
      
      return response.data;
    },
    enabled: !!id && userRole !== null, // Виконуємо запит тільки коли є ID та роль завантажена
  });

  const approveRequestMutation = useMutation({
    mutationFn: ({ id, request }: { id: number; request: { adminComments: string } }) =>
      apiClient.post(`/requests/${id}/approve`, request, {
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    onSuccess: async () => {
      // Інвалідуємо кеш для оновлення списку запитів та конкретного запиту
      await queryClient.invalidateQueries({ queryKey: [REQUESTS] });
      await queryClient.invalidateQueries({ queryKey: [REQUEST, id] });
    },
  });

  const rejectRequestMutation = useMutation({
    mutationFn: ({ id, request }: { id: number; request: { adminComments: string } }) =>
      apiClient.post(`/requests/${id}/reject`, request, {
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    onSuccess: async () => {
      // Інвалідуємо кеш для оновлення списку запитів та конкретного запиту
      await queryClient.invalidateQueries({ queryKey: [REQUESTS] });
      await queryClient.invalidateQueries({ queryKey: [REQUEST, id] });
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: (id: number) =>
      apiClient.post(`/requests/${id}/cancel`, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    onSuccess: async () => {
      // Інвалідуємо кеш для оновлення списку запитів та конкретного запиту
      await queryClient.invalidateQueries({ queryKey: [REQUESTS] });
      await queryClient.invalidateQueries({ queryKey: [REQUEST, id] });
    },
  });
  
  // Стан для модальних вікон та обробки запитів
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [adminComments, setAdminComments] = useState("");

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

  const openCancelDialog = () => {
    setAdminComments("");
    setIsCancelDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!id || !adminComments.trim()) return;
    
    try {
      await approveRequestMutation.mutateAsync({
        id: parseInt(id),
        request: { adminComments: adminComments.trim() }
      });
      console.log('Request approved successfully:', id);
      setIsApproveDialogOpen(false);
      setAdminComments("");
    } catch (error) {
      console.error('Failed to approve request:', error);
      alert('Помилка при схваленні запиту. Спробуйте ще раз.');
    }
  };

  const handleReject = async () => {
    if (!id || !adminComments.trim()) return;
    
    try {
      await rejectRequestMutation.mutateAsync({
        id: parseInt(id),
        request: { adminComments: adminComments.trim() }
      });
      console.log('Request rejected successfully:', id);
      setIsRejectDialogOpen(false);
      setAdminComments("");
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('Помилка при відхиленні запиту. Спробуйте ще раз.');
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    
    try {
      await cancelRequestMutation.mutateAsync(parseInt(id));
      console.log('Request canceled successfully:', id);
      setIsCancelDialogOpen(false);
      setAdminComments("");
    } catch (error) {
      console.error('Failed to cancel request:', error);
      alert('Помилка при скасуванні запиту. Спробуйте ще раз.');
    }
  };


  if (requestQuery.isLoading || userRole === null) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border rounded-lg p-6">
            <p className="text-muted-foreground">
              {userRole === null ? 'Завантаження авторизації...' : 'Завантаження деталей запиту...'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (requestQuery.error || !requestQuery.data) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border rounded-lg p-6">
            <p className="text-red-600">{requestQuery.error?.message || 'Запит не знайдено'}</p>
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
            <h1 className="text-3xl font-bold">{getRequestTypeLabel(requestQuery.data.requestType)}</h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRequestStatusColors(requestQuery.data.status).bg} ${getRequestStatusColors(requestQuery.data.status).text}`}>
              {getRequestStatusLabel(requestQuery.data.status)}
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
                <span className="font-medium">{requestQuery.data.requestingUserName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Дата запиту:</span>
                <span className="font-medium">
                  {new Date(requestQuery.data.requestedAt).toLocaleDateString('uk-UA', {
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
              <p className="whitespace-pre-wrap">{requestQuery.data.userJustification}</p>
            </div>
          </CardContent>
        </Card>

        {/* Рішення адміністратора */}
        {requestQuery.data.adminComments && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Рішення адміністратора
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {requestQuery.data.adminName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Адміністратор:</span>
                    <span className="font-medium">{requestQuery.data.adminName}</span>
                  </div>
                )}
                {requestQuery.data.processedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Дата обробки:</span>
                    <span className="font-medium">
                      {new Date(requestQuery.data.processedAt).toLocaleDateString('uk-UA', {
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
                <p className="whitespace-pre-wrap">{requestQuery.data.adminComments}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Об'єкт запиту */}
        {requestQuery.data.datasetId && (
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
                  <p className="font-medium">ID: {requestQuery.data.datasetId}</p>
                  {requestQuery.data.datasetName && (
                    <p className="text-sm text-muted-foreground">{requestQuery.data.datasetName}</p>
                  )}
                </div>
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/dataset/${requestQuery.data?.datasetId}`)}
                >
                  Переглянути датасет
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Кнопки дій для запитів в статусі "Pending" */}
        {requestQuery.data.status === 'Pending' && (
          <div className="flex justify-end gap-4">
            {userRole === 'Admin' ? (
              // Кнопки для адміністраторів
              <>
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
              </>
            ) : (
              // Кнопка для звичайних користувачів
              <Button 
                variant="destructive"
                className="flex items-center gap-2"
                onClick={openCancelDialog}
              >
                <X className="h-4 w-4" />
                Скасувати
              </Button>
            )}
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
              disabled={approveRequestMutation.isPending}
            >
              Скасувати
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveRequestMutation.isPending || adminComments.trim().length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
              {approveRequestMutation.isPending ? 'Схвалення...' : 'Схвалити'}
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
              disabled={rejectRequestMutation.isPending}
            >
              Скасувати
            </Button>
            <Button
              onClick={handleReject}
              disabled={rejectRequestMutation.isPending || adminComments.trim().length === 0}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
            >
              <X className="h-4 w-4" />
              {rejectRequestMutation.isPending ? 'Відхилення...' : 'Відхилити'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Модальне вікно для скасування */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Скасувати запит</DialogTitle>
            <DialogDescription>
              Ви впевнені, що хочете скасувати цей запит? Ця дія незворотна.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
              disabled={cancelRequestMutation.isPending}
            >
              Скасувати
            </Button>
            <Button
              onClick={handleCancel}
              disabled={cancelRequestMutation.isPending}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
            >
              <X className="h-4 w-4" />
              {cancelRequestMutation.isPending ? 'Скасування...' : 'Скасувати запит'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
