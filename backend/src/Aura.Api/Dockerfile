FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy solution and project files
COPY backend/AuraPlanning.sln backend/
COPY backend/src/Aura.Api/Aura.Api.csproj backend/src/Aura.Api/
COPY backend/src/Aura.Core/Aura.Core.csproj backend/src/Aura.Core/
COPY backend/src/Aura.Infrastructure/Aura.Infrastructure.csproj backend/src/Aura.Infrastructure/
COPY backend/tests/Aura.Core.Tests/Aura.Core.Tests.csproj backend/tests/Aura.Core.Tests/
COPY backend/workers/Aura.Workers.Email/Aura.Workers.Email.csproj backend/workers/Aura.Workers.Email/
COPY backend/workers/Aura.Workers.WhatsApp/Aura.Workers.WhatsApp.csproj backend/workers/Aura.Workers.WhatsApp/
COPY backend/workers/Aura.Workers.SSG/Aura.Workers.SSG.csproj backend/workers/Aura.Workers.SSG/

# Restore dependencies
RUN dotnet restore backend/AuraPlanning.sln

# Copy all source code
COPY backend/ backend/

# Publish
WORKDIR /app/backend/src/Aura.Api
RUN dotnet publish -c Release -o /app/publish

# Final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Aura.Api.dll"]
