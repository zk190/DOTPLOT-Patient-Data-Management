# Dotplot

Dotplot is a PACS-EMR integration pilot for breast-cancer case review. It combines structured patient records, ultrasound study matching, lesion coordinates, a torso overview, image previews, role-based access control, server-side audit logging, and report generation.

All patient data in this repository is synthetic mock data. Do not add real patient data or PHI.

## Live Demo

Add the deployed URL here after release:

`https://<your-dotplot-demo-url>`

## Tech Stack

- Frontend: React, TypeScript, Vite, TanStack Query
- Backend: Node.js, Fastify, TypeScript, Zod
- Database: Prisma with local SQLite for development
- Security: bcrypt password hashes, JWT auth, role-based access control, no PHI in URLs, append-only audit events
- DevOps: Docker Compose and GitHub Actions CI

## Run Locally

```bash
npm install
cp apps/api/.env.example apps/api/.env
npm run db:push
npm run db:seed
npm run dev
```

Demo accounts, all with password `Dotplot123!`:

- `radiologist@dotplot.test`
- `nurse@dotplot.test`
- `it@dotplot.test`

Frontend: `http://localhost:5173`
Backend: `http://localhost:4000`
API docs: `http://localhost:4000/docs`

## Docker

```bash
docker compose up --build
```

## Project Structure

- `apps/web` - React clinical workspace
- `apps/api` - Fastify API, Prisma schema, seed data, RBAC, audit logging
- `packages/shared` - shared TypeScript domain types
- `PRODUCT_REPORT.md` - product development report for submission
- `index.html`, `app.js`, `styles.css` - original static prototype retained as early MVP evidence

## Repository Link

Add the GitHub URL here after pushing:

`https://github.com/<your-username>/dotplot`
