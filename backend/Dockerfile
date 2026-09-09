FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY backend/TejaFlow.slnx backend/
COPY backend/TejaFlow.Domain/TejaFlow.Domain.csproj backend/TejaFlow.Domain/
COPY backend/TejaFlow.Application/TejaFlow.Application.csproj backend/TejaFlow.Application/
COPY backend/TejaFlow.Infrastructure/TejaFlow.Infrastructure.csproj backend/TejaFlow.Infrastructure/
COPY backend/TejaFlow.WebApi/TejaFlow.WebApi.csproj backend/TejaFlow.WebApi/

RUN dotnet restore backend/TejaFlow.WebApi/TejaFlow.WebApi.csproj

COPY backend/ backend/
RUN dotnet publish backend/TejaFlow.WebApi/TejaFlow.WebApi.csproj \
    --configuration Release \
    --no-restore \
    --output /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "TejaFlow.WebApi.dll"]
