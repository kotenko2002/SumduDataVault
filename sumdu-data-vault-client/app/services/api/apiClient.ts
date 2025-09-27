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
    // Додаємо логування для запитів
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
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
    // Додаємо логування для успішних відповідей
    console.log(`API Response: ${response.status} ${response.config.url}`);
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
