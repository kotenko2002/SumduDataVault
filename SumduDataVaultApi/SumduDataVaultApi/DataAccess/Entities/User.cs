using Microsoft.AspNetCore.Identity;

namespace SumduDataVaultApi.DataAccess.Entities
{
    public class User : IdentityUser<long>
    {
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string MiddleName { get; set; }

        /// <summary>
        /// Повертає повне ім'я користувача
        /// </summary>
        /// <param name="isShortened">Якщо true, повертає скорочену версію у форматі "Прізвище І.П.", інакше повне ім'я "Прізвище Ім'я По батькові"</param>
        public string GetFullName(bool isShortened = false)
        {
            if (isShortened)
            {
                var firstInitial = FirstName.Length > 0 ? FirstName[0] : ' ';
                var middleInitial = MiddleName.Length > 0 ? MiddleName[0] : ' ';
                return $"{LastName} {firstInitial}.{middleInitial}.";
            }
            
            return $"{LastName} {FirstName} {MiddleName}";
        }
    }

    public static class Roles
    {
        public const string Admin = "Admin";
        public const string Client = "Client";
    }
}
