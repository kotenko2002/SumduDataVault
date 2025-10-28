import axios, {type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig} from 'axios';
import { toast } from 'sonner';

// Інтерфейс для структури помилки з сервера
interface ServerError {
  title: string;
  statusCode: number;
  errors: string[];
}

// Базовий URL для API
const BASE_URL = 'https://localhost:7278';

// Створюємо екземпляр axios з базовими налаштуваннями
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 секунд таймаут
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (typeof window === 'undefined') {
            return config;
        }

        let token: string | null = null;
        try {
            token = localStorage.getItem('accessToken');
        } catch (error) {
            console.error('Не вдалося отримати токен з localStorage:', error);
            return config;
        }

        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`);
        }

        return config;
    },
    (error) => {
        console.error('Помилка в інтерцепторі запиту:', error);
        return Promise.reject(error);
    }
);

// Інтерцептор для відповідей
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error) => {
        if (!error.response) {
            if (error.code === 'ERR_NETWORK') {
              toast.error('Помилка мережі. Сервер недоступний або немає з\'єднання.');
            } else if (error.code === 'ECONNABORTED') {
              toast.error('Запит було скасовано (таймаут).');
            } else {
              toast.error('Сталася невідома помилка, сервер не відповів.');
            }

          console.error('Axios error without response:', error);
          return Promise.reject(error);
        }

        const { statusCode, errors } = error.response.data as ServerError;

        switch (statusCode) {
            case 401: {
                toast.error('Сесія закінчилася. Будь ласка, увійдіть знову.');

                try {
                  localStorage.removeItem('accessToken');
                  window.dispatchEvent(new CustomEvent('tokenRemoved'));
                } catch (e) {
                  console.error('Не вдалося очистити localStorage:', e);
                }
                break;
            }
            case 400:
            case 403:
            case 404:
            case 409:
            case 422: {
              errors.forEach((errorText: string) => toast.error(errorText));
              break;
            }
            default: {
              if (statusCode >= 500) {
                  toast.error('Сталася критична помилка на сервері. Спробуйте пізніше.');
                  console.error('Internal Server Error', error);
              }
              break;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
