To add migration run:
```bash
dotnet ef migrations add InitMigration -p .\SumduDataVaultApi -o .\DataAccess\Migrations
```

To update database run:
```bash
dotnet ef database update -p .\SumduDataVaultApi
```