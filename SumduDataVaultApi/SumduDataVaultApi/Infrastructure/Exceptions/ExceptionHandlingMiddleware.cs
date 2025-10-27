using System.Net;

namespace SumduDataVaultApi.Infrastructure.Exceptions
{
    public class ExceptionHandlingMiddleware(RequestDelegate next)
    {
        public async Task InvokeAsync(HttpContext httpContext)
        {
            try
            {
                await next(httpContext);
            }
            catch (BusinessException ex)
            {
                await HandleExceptionAsync(
                    httpContext,
                    ex.Title,
                    ex.StatusCode,
                    ex.Errors);
            }
            catch (Exception)
            {
                await HandleExceptionAsync(
                    httpContext,
                    "Internal Server Error",
                    HttpStatusCode.InternalServerError,
                    []);
            }
        }

        private async Task HandleExceptionAsync(
            HttpContext context,
            string title,
            HttpStatusCode httpStatusCode,
            List<string> errors)
        {
            var response = context.Response;

            response.StatusCode = (int)httpStatusCode;

            var errorResponse = new
            {
                Title = title,
                StatusCode = (int)httpStatusCode,
                Errors = errors
            };

            await response.WriteAsJsonAsync(errorResponse);
        }
    }
}
