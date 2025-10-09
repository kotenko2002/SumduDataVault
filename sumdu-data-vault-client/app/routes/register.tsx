import { useState } from "react";
import type { Route } from "./+types/register";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import RegisterService from "~/services/api/auth/RegisterService";
import { toast } from "sonner";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Реєстрація - SumduDataVault" },
    { name: "description", content: "Створіть обліковий запис у SumduDataVault" },
  ];
}

export default function Register() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await RegisterService.register({ email, password, firstName, lastName });
      toast.success("Реєстрація успішна. Увійдіть до системи.");
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(`Помилка реєстрації: ${err instanceof Error ? err.message : "Невідома помилка"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Реєстрація</CardTitle>
            <CardDescription>Створіть новий обліковий запис</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ім'я</Label>
                <Input
                  id="firstName"
                  placeholder="Іван"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Прізвище</Label>
                <Input
                  id="lastName"
                  placeholder="Петренко"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Мінімум 6 символів"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full min-w-[140px]">
                {isSubmitting ? "Реєстрація..." : "Зареєструватися"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


