# Build stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# copy csproj and restore as distinct layers
COPY BE/MovieManager.Api/MovieManager.Api.csproj ./MovieManager.Api/
RUN dotnet restore ./MovieManager.Api/MovieManager.Api.csproj

# copy the remaining source
COPY BE/MovieManager.Api/. ./MovieManager.Api/

WORKDIR /src/MovieManager.Api
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "MovieManager.Api.dll"]
