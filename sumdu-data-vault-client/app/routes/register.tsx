import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { Route } from "./+types/register";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import RegisterService, { type RegisterRequest } from "~/services/api/auth/RegisterService";
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
  const [middleName, setMiddleName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // React Query mutation для реєстрації
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest): Promise<void> => 
      RegisterService.register(data),
    onSuccess: () => {
      toast.success("Реєстрація успішна. Увійдіть до системи.");
      navigate("/login", { replace: true });
    },
    onError: (error: Error) => {
      toast.error(`Помилка реєстрації: ${error.message}`);
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate({ email, password, firstName, lastName, middleName });
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
                <Label htmlFor="middleName">По батькові</Label>
                <Input
                  id="middleName"
                  placeholder="Іванович"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
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
              <Button type="submit" disabled={registerMutation.isPending} className="w-full min-w-[140px]">
                {registerMutation.isPending ? "Реєстрація..." : "Зареєструватися"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


