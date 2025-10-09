import { useState } from "react";
import type { Route } from "./+types/login";
import { useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import LoginService from "~/services/api/auth/LoginService";
import { toast } from "sonner";
import { useAuth } from "~/context/AuthContext";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Вхід - SumduDataVault" },
    { name: "description", content: "Увійдіть до SumduDataVault" },
  ];
}

export default function Login() {
  const navigate = useNavigate();
  const { setIsAuthorized } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = await LoginService.login({ email, password });
      localStorage.setItem("accessToken", token);
      setIsAuthorized(true);
      toast.success("Вхід виконано успішно");
      navigate("/", { replace: true });
    } catch (err) {
      toast.error(`Помилка входу: ${err instanceof Error ? err.message : "Невідома помилка"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Вхід</CardTitle>
            <CardDescription>Увійдіть, використовуючи email та пароль</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
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
                  placeholder="Ваш пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full min-w-[140px]">
                {isSubmitting ? "Вхід..." : "Увійти"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


