import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "~/components/ui/hover-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Info, MoreHorizontal, Eye, Check, X } from "lucide-react";
import GetPendingRequestsService from '../services/api/approval/View/GetPendingRequestsService';
import ApproveRequestService from '../services/api/approval/Manage/ApproveRequestService';
import RejectRequestService from '../services/api/approval/Manage/RejectRequestService';
import type { ApprovalRequestDto, RequestType } from '../services/api/approval/types';

export default function ApprovalRequests() {
  const [requests, setRequests] = useState<ApprovalRequestDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [adminComments, setAdminComments] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const openApproveDialog = (requestId: number) => {
    setSelectedRequestId(requestId);
    setAdminComments("");
    setIsApproveDialogOpen(true);
  };

  const openRejectDialog = (requestId: number) => {
    setSelectedRequestId(requestId);
    setAdminComments("");
    setIsRejectDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequestId || !adminComments.trim()) return;
    
    setIsProcessing(true);
    try {
      await ApproveRequestService.approveRequest(selectedRequestId, { adminComments: adminComments.trim() });
      console.log('Request approved successfully:', selectedRequestId);
      // Оновлюємо список запитів після успішного схвалення
      await fetchPending();
      setIsApproveDialogOpen(false);
      setAdminComments("");
      setSelectedRequestId(null);
    } catch (error) {
      console.error('Failed to approve request:', error);
      alert('Помилка при схваленні запиту. Спробуйте ще раз.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequestId || !adminComments.trim()) return;
    
    setIsProcessing(true);
    try {
      await RejectRequestService.rejectRequest(selectedRequestId, { adminComments: adminComments.trim() });
      console.log('Request rejected successfully:', selectedRequestId);
      // Оновлюємо список запитів після успішного відхилення
      await fetchPending();
      setIsRejectDialogOpen(false);
      setAdminComments("");
      setSelectedRequestId(null);
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('Помилка при відхиленні запиту. Спробуйте ще раз.');
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchPending = async () => {
    setIsLoading(true);
    try {
      const pending = await GetPendingRequestsService.getPendingRequests();
      console.log('Pending approval requests:', pending);
      setRequests(pending);
    } catch (error) {
      console.error('Failed to fetch pending approval requests', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Розгляд запитів</h1>
        
        {isLoading ? (
          <div className="bg-card border rounded-lg p-6">
            <p className="text-muted-foreground">Завантаження запитів...</p>
          </div>
        ) : requests.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Запити на схвалення</CardTitle>
              <CardDescription>
                Знайдено {requests.length} запитів для розгляду
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Тип запиту</TableHead>
                      <TableHead>Користувач</TableHead>
                      <TableHead>Обґрунтування</TableHead>
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
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRequestTypeColors(request.requestType).bg} ${getRequestTypeColors(request.requestType).text}`}>
                            {getRequestTypeLabel(request.requestType)}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          {request.requestingUserName}
                        </TableCell>
                        <TableCell>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="flex items-center gap-1 cursor-pointer hover:text-blue-600 transition-colors">
                                <div className="max-w-[300px] truncate">
                                  {request.userJustification}
                                </div>
                                <Info className="h-4 w-4 flex-shrink-0" />
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold">Обґрунтування запиту</h4>
                                <div className="text-sm">
                                  <div className="whitespace-pre-wrap break-words bg-gray-50 p-2 rounded border max-h-40 overflow-y-auto">
                                    {request.userJustification}
                                  </div>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </TableCell>
                        <TableCell>
                          {new Date(request.requestedAt).toLocaleDateString('uk-UA', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Дії</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {request.datasetId && (
                                <DropdownMenuItem
                                  onClick={() => window.location.href = `/dataset/${request.datasetId}`}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  Переглянути датасет
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => openApproveDialog(request.id)}
                                className="text-green-600 focus:text-green-600"
                              >
                                <Check className="mr-2 h-4 w-4" />
                                Схвалити
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openRejectDialog(request.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <X className="mr-2 h-4 w-4" />
                                Відхилити
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-card border rounded-lg p-6">
            <p className="text-muted-foreground">
              Немає запитів для розгляду.
            </p>
          </div>
        )}

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
      </div>
    </main>
  );
}
