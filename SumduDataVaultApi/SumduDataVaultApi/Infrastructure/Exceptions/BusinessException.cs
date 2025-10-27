using System.Net;

namespace SumduDataVaultApi.Infrastructure.Exceptions
{
    [Serializable]
    public class BusinessException : Exception
    {
        public string Title { get; set; }
        public HttpStatusCode StatusCode { get; set; }
        public List<string> Errors { get; set; }


        public BusinessException(string title, HttpStatusCode statusCode, string error)
        {
            Title = title;
            StatusCode = statusCode;
            Errors = [error];
        }

        public BusinessException(string title, HttpStatusCode statusCode, List<string> errors)
        {
            Title = title;
            StatusCode = statusCode;
            Errors = errors;
        }

        public BusinessException(string title, HttpStatusCode statusCode, params string[] errors)
        {
            Title = title;
            StatusCode = statusCode;
            Errors = errors.ToList();
        }
    }
}
