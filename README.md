# Movie Watchlist Exam Project

Full-stack solution for the PRN232 practical exam (requirements 1–4). Users can list, search, filter, sort, add, edit, and delete movies they want to watch. The project consists of:

- **Backend**: ASP.NET Core 9 Web API + Entity Framework Core + PostgreSQL (`BE/MovieManager.Api`)
- **Frontend**: React + Vite + TypeScript + Ant Design (`FE`)

> **TODO (deployment & report)**  
> 1. Publish the repository publicly and deploy (Render/Railway/Vercel, etc.).  
> 2. Prepare the required `.doc/.docx` report with GitHub + deployed links, screenshot, and local run steps.

## Prerequisites

- [.NET SDK 9](https://dotnet.microsoft.com/en-us/download)
- [Node.js 20+](https://nodejs.org/) and npm
- PostgreSQL 14+ running locally (default connection string assumes `postgres:postgres` on `localhost:5432` with DB `movie_manager`)
- Optional: Docker/Postgres management tool for creating the database

## Backend (API)

```bash
cd BE/MovieManager.Api
dotnet restore
# Update appsettings if your Postgres credentials differ
dotnet ef database update   # creates the schema
dotnet run                  # launches on http://localhost:5119
```

Key endpoints (`/api/movies`):

| Method | Endpoint              | Description                                  |
|--------|-----------------------|----------------------------------------------|
| GET    | `/api/movies`         | List movies with `search`, `genre`, `sortBy`, `sortDirection` query params |
| GET    | `/api/movies/{id}`    | Get a single movie                           |
| POST   | `/api/movies`         | Create a movie (title required)              |
| PUT    | `/api/movies/{id}`    | Update a movie                               |
| DELETE | `/api/movies/{id}`    | Remove a movie (confirmation handled in FE)  |

## Frontend (React)

```bash
cd FE
npm install
# Adjust VITE_API_BASE_URL in FE/.env if backend port differs
npm run dev     # http://localhost:5173
```

Features implemented:

- Movie table with poster preview, genre tag, created date, and rating indicator
- Search by title, filter by genre, and sort by title or rating
- Add / edit forms with validation and client-side routing
- Delete confirmation modal before removal

For a production bundle: `npm run build`.

## Notes

- HTTPS redirection is enabled by default; trust the local ASP.NET developer certificate or update the front-end `.env` to match the HTTPS port shown by `dotnet run`.
- The API applies EF Core migrations on startup. Ensure the PostgreSQL server is running before launching the backend.

## Deployment Guide

### Backend on Render (Docker)

1. Ensure `render.yaml` and `BE/Dockerfile` remain in the repo root.
2. In Render, create a **Blueprint** (recommended) or Web Service:
   - Connect your GitHub repo.
   - If using Blueprint, Render reads `render.yaml` and builds the service automatically.
   - Otherwise, create a Web Service with:
     - Environment: `Docker`
     - Root Directory: repository root
     - Dockerfile path: `BE/Dockerfile`
     - Build Command: *(leave empty, handled by Docker)*
     - Start Command: *(leave empty, Docker entrypoint handles it)*
3. Add environment variables:
   - `ConnectionStrings__DefaultConnection` = `postgresql://prn_pe_user:17oElh6fYXWw9STewP3UmTodZE8yEHak@dpg-d4an670gjchc73f0a0c0-a.singapore-postgres.render.com/prn_pe?sslmode=require&trust_server_certificate=true`
   - `ASPNETCORE_ENVIRONMENT` = `Production`
4. Deploy; Render exposes a URL such as `https://movie-manager-api.onrender.com`. Keep this for the frontend.

### Frontend on Vercel

1. Push the `FE` folder to GitHub (same repo is fine).
2. On Vercel, create a new project, selecting the repo and setting **Root Directory** to `FE`.
3. Vercel auto-detects Vite settings via `vercel.json`. Confirm commands:
   - Install: `npm install`
   - Build: `npm run build`
   - Output: `dist`
4. Configure environment variable:
   - `VITE_API_BASE_URL` = `https://movie-manager-api.onrender.com` (replace with the Render URL after deployment).
5. Deploy; Vercel gives you a production URL to include in the final report.
