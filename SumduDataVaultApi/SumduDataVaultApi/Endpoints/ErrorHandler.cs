using ErrorOr;
using Microsoft.AspNetCore.Mvc;

namespace SumduDataVaultApi.Endpoints
{
    public class ExtendedProblemDetails : ProblemDetails
    {
        public List<string> Errors { get; set; } = new();
    }

    public static class ErrorHandler
    {
        public static IActionResult Problem(List<Error> errors)
        {
            Error firstError = errors.First();
            List<string> errorMessages = errors.Select(e => e.Description).ToList();

            (int statusCode, string title, string type) = firstError.Type switch
            {
                ErrorType.Failure => (StatusCodes.Status400BadRequest, "Bad Request", "1"),
                ErrorType.Validation => (StatusCodes.Status422UnprocessableEntity, "One or more validation errors occurred.", "1"),
                ErrorType.Conflict => (StatusCodes.Status409Conflict, "Conflict", "2"),
                ErrorType.NotFound => (StatusCodes.Status404NotFound, "Not Found", "3"),
                ErrorType.Unauthorized => (StatusCodes.Status401Unauthorized, "Unauthorized", "4"),
                ErrorType.Forbidden => (StatusCodes.Status403Forbidden, "Forbidden", "5"),
                _ => (StatusCodes.Status500InternalServerError, "Internal Server Error", "6"),
            };

            var problemDetails = new ExtendedProblemDetails
            {
                Type = $"https://tools.ietf.org/html/rfc9110#section-15.5.{type}",
                Title = title,
                Status = statusCode,
                Errors = errorMessages
            };

            return new ObjectResult(problemDetails)
            {
                StatusCode = statusCode
            };
        }
    }
}
