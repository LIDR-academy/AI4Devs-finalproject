FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

COPY backend/AuraPlanning.sln backend/
COPY backend/src/Aura.Api/Aura.Api.csproj backend/src/Aura.Api/
COPY backend/src/Aura.Core/Aura.Core.csproj backend/src/Aura.Core/
COPY backend/src/Aura.Infrastructure/Aura.Infrastructure.csproj backend/src/Aura.Infrastructure/
COPY backend/tests/Aura.Core.Tests/Aura.Core.Tests.csproj backend/tests/Aura.Core.Tests/
COPY backend/workers/Aura.Workers.Email/Aura.Workers.Email.csproj backend/workers/Aura.Workers.Email/
COPY backend/workers/Aura.Workers.WhatsApp/Aura.Workers.WhatsApp.csproj backend/workers/Aura.Workers.WhatsApp/
COPY backend/workers/Aura.Workers.SSG/Aura.Workers.SSG.csproj backend/workers/Aura.Workers.SSG/
COPY backend/workers/Aura.Workers.ThankYouCards/Aura.Workers.ThankYouCards.csproj backend/workers/Aura.Workers.ThankYouCards/
COPY backend/workers/Aura.Workers.Reminders/Aura.Workers.Reminders.csproj backend/workers/Aura.Workers.Reminders/
COPY backend/tests/Aura.Api.Tests/Aura.Api.Tests.csproj backend/tests/Aura.Api.Tests/
COPY backend/tests/Aura.Infrastructure.Tests/Aura.Infrastructure.Tests.csproj backend/tests/Aura.Infrastructure.Tests/
COPY backend/tests/Aura.Workers.Email.Tests/Aura.Workers.Email.Tests.csproj backend/tests/Aura.Workers.Email.Tests/
COPY backend/tests/Aura.Workers.WhatsApp.Tests/Aura.Workers.WhatsApp.Tests.csproj backend/tests/Aura.Workers.WhatsApp.Tests/

RUN dotnet restore backend/AuraPlanning.sln

COPY backend/ backend/
WORKDIR /app/backend/workers/Aura.Workers.SSG
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Aura.Workers.SSG.dll"]
