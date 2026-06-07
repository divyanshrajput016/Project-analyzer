# CodeAtlas

CodeAtlas is an AI-powered repository intelligence platform. It helps developers analyze GitHub repositories or uploaded ZIP projects and generate permanent reports covering architecture, APIs, auth flows, database models, security, README docs, diagrams, and interview preparation.

## Features

- JWT authentication with HTTP-only cookies
- Role-based user and admin access
- GitHub URL and ZIP repository intake
- Repository metadata and version history
- Folder, tech stack, auth, database, API, and security analysis
- Gemini-powered report generation
- Repository chat with saved chat history
- Saved reports with search, filters, reopen, and delete
- Markdown/PDF/README export endpoints
- Admin overview for users, reports, and analytics

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT, HTTP-only cookies, bcrypt
- AI: Gemini 2.5 Pro through `@google/genai`
- Parsing: static source extraction with AST-ready service boundaries
- Deployment: Docker and Docker Compose

## Project Structure

```txt
.
├── client
│   ├── src
│   │   ├── components
│   │   ├── context
│   │   ├── hooks
│   │   ├── pages
│   │   ├── services
│   │   └── types
│   └── Dockerfile
├── server
│   ├── src
│   │   ├── config
│   │   ├── controller
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   └── service
│   └── Dockerfile
└── docker-compose.yml
```

## Local Setup

1. Create `server/.env` from `server/.env.example`.
2. Create `client/.env` from `client/.env.example`.
3. Install dependencies:

```bash
npm install --prefix server
npm install --prefix client
```

4. Start both apps:

```bash
docker compose up --build
```

Backend runs on `http://localhost:3000`.
Frontend runs on `http://localhost:5173`.

## Environment Variables

Backend:

```txt
MONGO_URI=
JWT_SECRET=
GOOGLE_API_KEY=
FRONTEND_URL=http://localhost:5173
PORT=3000
```

Frontend:

```txt
VITE_API_URL=http://localhost:3000/api
```

## API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/get-me`
- `GET /api/dashboard`
- `POST /api/projects/analyze-url`
- `POST /api/projects/analyze-zip`
- `GET /api/projects`
- `GET /api/reports`
- `GET /api/reports/:id`
- `DELETE /api/reports/:id`
- `POST /api/chat/:projectId`
- `GET /api/admin/users`

