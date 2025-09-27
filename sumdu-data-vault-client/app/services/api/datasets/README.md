# Datasets Services

Ця папка містить сервіси для роботи з датасетами, організовані за вертикальною архітектурою.

## Доступні сервіси:

### CreateDatasetService
Сервіс для створення нових датасетів.

```typescript
import CreateDatasetService from '~/services/api/datasets/CreateDatasetService';

const result = await CreateDatasetService.createDataset({
  Csv: file,
  Description: 'Опис датасету',
  Region: 'Київ',
  CollectedFrom: '2024-01-01',
  CollectedTo: '2024-12-31',
  MetadataJson: JSON.stringify({ source: 'API' })
});
```

### SearchDatasetService
Сервіс для пошуку датасетів з різними фільтрами.

```typescript
import SearchDatasetService from '~/services/api/datasets/SearchDatasetService';

// Простий пошук за описом
const result = await SearchDatasetService.searchDatasets({
  description: 'економічні дані'
});

// Пошук з діапазоном дат
const result = await SearchDatasetService.searchDatasets({
  description: 'економічні дані',
  collectedFrom: '2024-01-01T00:00:00.000Z',
  collectedTo: '2024-12-31T23:59:59.999Z'
});

// Пошук з фільтрами по розміру файлу та кількості рядків
const result = await SearchDatasetService.searchDatasets({
  region: 'Київ',
  rowCount: { min: 100, max: 10000 },
  fileSizeBytes: { min: 1024, max: 10485760 }, // 1KB - 10MB
  metadata: {
    source: 'API',
    category: 'economics'
  }
});
```

## Планується додати:

- GetDatasetService - для отримання датасету за ID
- UpdateDatasetService - для оновлення датасету
- DeleteDatasetService - для видалення датасету
