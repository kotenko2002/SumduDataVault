using OpenSearch.Client;
using OpenSearch.Net;
using SumduDataVaultApi.DataAccess;
using SumduDataVaultApi.Endpoints.Abstractions;
using System.Text.Json;

namespace SumduDataVaultApi.Endpoints
{
    public static class TestEndpoint
    {
        public record TestRequest(string Name, decimal Price);
        public record TestResponse(int Id, string Name, decimal Price);

        public class Endpoint : IEndpoint
        {
            public void MapEndpoint(IEndpointRouteBuilder app)
            {
                app.MapPost("test", Handler)
                    .WithTags("Test");
            }

            public static async Task<IResult> Handler(TestRequest request, IOpenSearchClient openSearch)
            {
                try
                {
                    var indexName = "my-dynamic-index3";
                    var documentId = Guid.NewGuid().ToString();

                    // Парсимо JSON-рядок у JsonDocument
                    string rawJson = @"{""fieldV"": 1, ""fieldK"": ""Це тестовий рядок"", ""timestamp"": ""2025-09-07T12:30:00Z""}";
                    using var jsonDocument = JsonDocument.Parse(rawJson);

                    // Створюємо модель для збереження в OpenSearch
                    var document = new
                    {
                        Name = "John Doe",
                        Age = 30,
                        AdditionalData = new Dictionary<string, object>
                        {
                            { "FieldA", 42 },
                            { "FieldB", "Тестовий рядок" },
                            { "FieldC", true }
                        },
                        Timestamp = DateTime.UtcNow.ToString("o"), // ISO 8601 формат
                        JsonData = jsonDocument.RootElement // Додаємо розпарсений JsonDocument
                    };

                    // Серіалізуємо об'єкт у JSON
                    var jsonDocumentSerialized = System.Text.Json.JsonSerializer.Serialize(document);

                    // Виконуємо індексацію
                    var indexResponse = await openSearch.LowLevel.IndexAsync<IndexResponse>(
                        indexName,
                        documentId,
                        PostData.String(jsonDocumentSerialized)
                    );

                    if (indexResponse.IsValid)
                    {
                        Console.WriteLine($"Документ успішно проіндексовано!");
                        Console.WriteLine($"Index: {indexResponse.Index}");
                        Console.WriteLine($"Id: {indexResponse.Id}");
                        Console.WriteLine($"Result: {indexResponse.Result}");

                        // Повертаємо відповідь із жорстко закодованими даними
                        return Results.Ok();
                    }
                    else
                    {
                        Console.WriteLine("Сталася помилка при індексації:");
                        Console.WriteLine(indexResponse.DebugInformation);
                        if (indexResponse.OriginalException != null)
                        {
                            Console.WriteLine(indexResponse.OriginalException.Message);
                        }
                        return Results.Problem("Помилка при індексації документа");
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine($"Виняток: {e.Message}");
                    return Results.Problem($"Виняток при обробці запиту: {e.Message}");
                }
            }
        }
    }
}
