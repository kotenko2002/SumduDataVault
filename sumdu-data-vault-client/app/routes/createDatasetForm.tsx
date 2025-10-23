import { useState } from "react";
import type { Route } from "./+types/createDatasetForm";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { toast } from "sonner";
import CreateDatasetService from "~/services/api/datasets/CreateDatasetService";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Створення датасету - SumduDataVault" },
    { name: "description", content: "Створіть новий датасет з CSV файлом та метаданими" },
  ];
}

interface CreateDatasetRequest {
  csv: File | null;
  description: string;
  region: string;
  collectedFrom: string;
  collectedTo: string;
  metadata: Array<{ key: string; value: string }>;
  userJustification: string;
}

interface MetadataField {
  id: string;
  key: string;
  value: string;
}

interface CreateDatasetResponse {
  id: number;
  approvalRequestId: number;
}

export default function CreateDatasetForm() {
  const [formData, setFormData] = useState<CreateDatasetRequest>({
    csv: null,
    description: "",
    region: "",
    collectedFrom: "",
    collectedTo: "",
    metadata: [],
    userJustification: "",
  });

  const [metadataFields, setMetadataFields] = useState<MetadataField[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof CreateDatasetRequest, value: string | File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

  const convertMetadataToJson = (): string => {
    const metadataObj: Record<string, string> = {};
    metadataFields.forEach(field => {
      if (field.key.trim() && field.value.trim()) {
        metadataObj[field.key.trim()] = field.value.trim();
      }
    });
    return Object.keys(metadataObj).length > 0 ? JSON.stringify(metadataObj) : "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleInputChange("csv", file);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);

    try {
      if (!formData.csv) {
        throw new Error("Будь ласка, виберіть CSV файл");
      }

      const result = await CreateDatasetService.createDataset({
        Csv: formData.csv,
        Description: formData.description,
        Region: formData.region,
        CollectedFrom: formData.collectedFrom,
        CollectedTo: formData.collectedTo,
        MetadataJson: convertMetadataToJson(),
        UserJustification: formData.userJustification.trim(),
      });
      
      // Очищаємо форму одразу
      setFormData({
        csv: null,
        description: "",
        region: "",
        collectedFrom: "",
        collectedTo: "",
        metadata: [],
        userJustification: "",
      });
      setMetadataFields([]);
      
      toast.success(`Датасет створено (ID: ${result.id}). Запит на апрув створено (ID: ${result.approvalRequestId}).`);

    } catch (err) {
      toast.error(`Помилка при створенні датасету: ${err instanceof Error ? err.message : "Сталася невідома помилка"}`);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Створення датасету</h1>
          <p className="text-lg text-muted-foreground">
            Завантажте CSV файл та додайте метадані для створення нового датасету
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Основна інформація та Завантаження файлу в одному рядку */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Основна інформація - зліва */}
            <Card>
              <CardHeader>
                <CardTitle>📋 Основна інформація</CardTitle>
                <CardDescription>
                  Вкажіть опис та регіон датасету
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="description">Опис датасету</Label>
                  <Textarea
                    id="description"
                    placeholder="Детальний опис датасету, його призначення та зміст..."
                    className="min-h-[100px]"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="region">Регіон</Label>
                  <Input
                    id="region"
                    placeholder="Введіть регіон (наприклад: Україна, Європа, Глобальний)"
                    value={formData.region}
                    onChange={(e) => handleInputChange("region", e.target.value)}
                  />
                </div>

              </CardContent>
            </Card>

            {/* Завантаження файлу - справа */}
            <Card>
              <CardHeader>
                <CardTitle>📁 Завантаження CSV файлу</CardTitle>
                <CardDescription>
                  Виберіть CSV файл для створення датасету
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="csv">CSV файл</Label>
                    <Input
                      id="csv"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                  </div>
                  {formData.csv && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Вибраний файл:</strong> {formData.csv.name}
                      </p>
                      <p className="text-sm text-blue-600">
                        Розмір: {(formData.csv.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Період збору даних */}
          <Card>
            <CardHeader>
              <CardTitle>📅 Період збору даних</CardTitle>
              <CardDescription>
                Вкажіть період, за який були зібрані дані
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="collectedFrom">Дата початку збору</Label>
                  <Input
                    id="collectedFrom"
                    type="datetime-local"
                    value={formData.collectedFrom}
                    onChange={(e) => handleInputChange("collectedFrom", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collectedTo">Дата закінчення збору</Label>
                  <Input
                    id="collectedTo"
                    type="datetime-local"
                    value={formData.collectedTo}
                    onChange={(e) => handleInputChange("collectedTo", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Метадані */}
          <Card>
            <CardHeader>
              <CardTitle>🏷️ Метадані</CardTitle>
              <CardDescription>
                Додайте додаткові метадані (опціонально)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {metadataFields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`metadata-key-${field.id}`}>Назва поля</Label>
                    <Input
                      id={`metadata-key-${field.id}`}
                      placeholder="Наприклад: source, version, tags"
                      value={field.key}
                      onChange={(e) => updateMetadataField(field.id, 'key', e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`metadata-value-${field.id}`}>Значення</Label>
                    <Input
                      id={`metadata-value-${field.id}`}
                      placeholder="Наприклад: API, 1.0, research"
                      value={field.value}
                      onChange={(e) => updateMetadataField(field.id, 'value', e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeMetadataField(field.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addMetadataField}
                className="w-full"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Додати поле метаданих
              </Button>

              {metadataFields.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Попередній перегляд JSON:</p>
                  <pre className="text-xs font-mono text-gray-800 bg-white p-2 rounded border overflow-x-auto">
                    {convertMetadataToJson() || "{}"}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Обґрунтування запиту */}
          <Card>
            <CardHeader>
              <CardTitle>💭 Обґрунтування запиту</CardTitle>
              <CardDescription>
                Поясніть, чому потрібно створити цей датасет
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="userJustification">Обґрунтування запиту</Label>
                <Textarea
                  id="userJustification"
                  placeholder="Чому потрібно створити цей датасет або надати доступ"
                  className="min-h-[100px]"
                  value={formData.userJustification}
                  onChange={(e) => handleInputChange("userJustification", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Кнопки */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setFormData({
                  csv: null,
                  description: "",
                  region: "",
                  collectedFrom: "",
                  collectedTo: "",
                  metadata: [] as Array<{ key: string; value: string }>,
                  userJustification: "",
                });
                setMetadataFields([]);
                toast.info("Форма очищена");
              }}
            >
              Очистити форму
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Створення...
                </>
              ) : (
                "Створити датасет"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
