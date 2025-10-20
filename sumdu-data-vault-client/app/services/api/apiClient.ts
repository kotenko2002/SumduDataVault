import axios, {type AxiosInstance, type AxiosResponse } from 'axios';

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

// Інтерцептор для запитів
apiClient.interceptors.request.use(
  (config) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    } catch (_) {
      // ігноруємо помилки доступу до localStorage
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Інтерцептор для відповідей
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Обробляємо помилки
    console.error('Response Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Час очікування запиту вичерпано. Перевірте підключення до сервера.');
    }
    
    if (error.response) {
      // Сервер відповів з кодом помилки
      const status = error.response.status;
      
      // Обробляємо 401 Unauthorized - токен прострочений або недійсний
      if (status === 401) {
        console.log('Received 401, logging out user');
        // Видаляємо токен
        try {
          localStorage.removeItem('accessToken');
          // Відправляємо кастомну подію для оновлення AuthContext
          window.dispatchEvent(new CustomEvent('tokenRemoved'));
        } catch (_) {
          // ігноруємо помилки доступу до localStorage
        }
        throw new Error('Сесія закінчилася. Будь ласка, увійдіть знову.');
      }
      
      const message = error.response.data?.message || `Помилка сервера: ${status}`;
      throw new Error(message);
    } else if (error.request) {
      // Запит був відправлений, але відповіді не отримано
      throw new Error('Помилка підключення до сервера. Перевірте, чи запущений бекенд на https://localhost:7278/');
    } else {
      // Щось інше сталося
      throw new Error('Сталася невідома помилка при виконанні запиту');
    }
  }
);

export default apiClient;
