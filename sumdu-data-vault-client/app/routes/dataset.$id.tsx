import type { Route } from "./+types/dataset.$id";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: `Деталі датасету ${params.id} - SumduDataVault` },
    { name: "description", content: "Детальна інформація про датасет" },
  ];
}

export default function DatasetDetails({ params }: Route.ComponentProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад до пошуку
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Деталі датасету</h1>
          <p className="text-muted-foreground mt-2">
            ID: {params.id}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Інформація про датасет</CardTitle>
            <CardDescription>
              Детальна інформація про вибраний датасет
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Сторінка деталей датасету</h3>
              <p className="text-muted-foreground">
                Функціональність деталей датасету буде додана пізніше
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                ID датасету: {params.id}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
