import { useState } from "react";
import type { Route } from "./+types/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Switch } from "~/components/ui/switch";
import { Separator } from "~/components/ui/separator";
import { Badge } from "~/components/ui/badge";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Форма - SumduDataVault" },
    { name: "description", content: "Сучасна форма з використанням shadcn UI компонентів" },
  ];
}

export default function Form() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    country: "",
    message: "",
    newsletter: false,
    notifications: false,
    gender: "",
    interests: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInterestChange = (interest: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      interests: checked 
        ? [...prev.interests, interest]
        : prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Симуляція відправки форми
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Скидання форми через 3 секунди
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        age: "",
        country: "",
        message: "",
        newsletter: false,
        notifications: false,
        gender: "",
        interests: [],
      });
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="text-center">
              <CardTitle className="text-green-800">✅ Форма успішно відправлена!</CardTitle>
              <CardDescription className="text-green-600">
                Дякуємо за заповнення форми. Ваші дані були збережені.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Контактна форма</h1>
          <p className="text-lg text-muted-foreground">
            Заповніть форму нижче, щоб зв'язатися з нами
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Особиста інформація */}
          <Card>
            <CardHeader>
              <CardTitle>👤 Особиста інформація</CardTitle>
              <CardDescription>
                Вкажіть свої основні дані
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Ім'я *</Label>
                  <Input
                    id="firstName"
                    placeholder="Введіть ваше ім'я"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Прізвище *</Label>
                  <Input
                    id="lastName"
                    placeholder="Введіть ваше прізвище"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+380 (XX) XXX-XX-XX"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Вік</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Країна</Label>
                  <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Оберіть країну" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ukraine">🇺🇦 Україна</SelectItem>
                      <SelectItem value="usa">🇺🇸 США</SelectItem>
                      <SelectItem value="germany">🇩🇪 Німеччина</SelectItem>
                      <SelectItem value="france">🇫🇷 Франція</SelectItem>
                      <SelectItem value="poland">🇵🇱 Польща</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Стать</Label>
                <RadioGroup 
                  value={formData.gender} 
                  onValueChange={(value) => handleInputChange("gender", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Чоловік</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Жінка</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Інше</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* Інтереси */}
          <Card>
            <CardHeader>
              <CardTitle>🎯 Ваші інтереси</CardTitle>
              <CardDescription>
                Оберіть теми, які вас цікавлять
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  "Технології",
                  "Наука",
                  "Мистецтво",
                  "Спорт",
                  "Подорожі",
                  "Кулінарія",
                  "Музика",
                  "Кіно",
                  "Книги"
                ].map((interest) => (
                  <div key={interest} className="flex items-center space-x-2">
                    <Checkbox
                      id={interest}
                      checked={formData.interests.includes(interest)}
                      onCheckedChange={(checked) => 
                        handleInterestChange(interest, checked as boolean)
                      }
                    />
                    <Label htmlFor={interest}>{interest}</Label>
                  </div>
                ))}
              </div>
              {formData.interests.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Обрані інтереси:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map((interest) => (
                      <Badge key={interest} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Повідомлення */}
          <Card>
            <CardHeader>
              <CardTitle>💬 Повідомлення</CardTitle>
              <CardDescription>
                Розкажіть нам про себе або залиште коментар
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="message">Ваше повідомлення</Label>
                <Textarea
                  id="message"
                  placeholder="Напишіть тут ваше повідомлення..."
                  className="min-h-[120px]"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Налаштування */}
          <Card>
            <CardHeader>
              <CardTitle>⚙️ Налаштування</CardTitle>
              <CardDescription>
                Оберіть ваші налаштування сповіщень
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="newsletter">Підписка на розсилку</Label>
                  <p className="text-sm text-muted-foreground">
                    Отримувати новини та оновлення на email
                  </p>
                </div>
                <Switch
                  id="newsletter"
                  checked={formData.newsletter}
                  onCheckedChange={(checked) => handleInputChange("newsletter", checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Push-сповіщення</Label>
                  <p className="text-sm text-muted-foreground">
                    Отримувати сповіщення в браузері
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={formData.notifications}
                  onCheckedChange={(checked) => handleInputChange("notifications", checked)}
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
                  firstName: "",
                  lastName: "",
                  email: "",
                  phone: "",
                  age: "",
                  country: "",
                  message: "",
                  newsletter: false,
                  notifications: false,
                  gender: "",
                  interests: [],
                });
              }}
            >
              Очистити форму
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Відправка...
                </>
              ) : (
                "Відправити форму"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
