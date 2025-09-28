import apiClient from '../apiClient';

export class DownloadDatasetService {
  static async downloadDataset(id: number): Promise<Blob> {
    const response = await apiClient.get(`/datasets/${id}/download`, {
      responseType: 'blob',
      headers: {
        'Accept': 'text/csv',
      },
    });

    return response.data;
  }

  static async downloadDatasetWithFilename(id: number): Promise<{ blob: Blob; filename: string }> {
    const response = await apiClient.get(`/datasets/${id}/download`, {
      responseType: 'blob',
      headers: {
        'Accept': 'text/csv',
      },
    });

    // Отримуємо ім'я файлу з заголовка Content-Disposition
    const contentDisposition = response.headers['content-disposition'];
    let filename = `dataset_${id}.csv`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    return {
      blob: response.data,
      filename: filename
    };
  }

  static async downloadAndSaveDataset(id: number, filename?: string): Promise<void> {
    const { blob, filename: responseFilename } = await this.downloadDatasetWithFilename(id);
    const finalFilename = filename || responseFilename;

    // Створюємо URL для blob
    const url = window.URL.createObjectURL(blob);
    
    // Створюємо тимчасовий елемент для скачування
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    
    // Додаємо до DOM, клікаємо і видаляємо
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Очищуємо URL
    window.URL.revokeObjectURL(url);
  }
}

export default DownloadDatasetService;
