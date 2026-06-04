##Dotplot
Dotplot is a full-stack PACS-EMR integration prototype for breast-cancer case review. It brings patient records, ultrasound study metadata, lesion coordinates, breast torso visualisation, role-based workflows, audit logging, and report generation into one clinical workspace.

The project is built with synthetic data only and is designed as a graduate software developer portfolio piece for health-tech, clinical systems, and secure web application roles.

##Why This Project
Radiologists and nurses often move between disconnected systems: an EMR for patient details, a PACS viewer for scans, and paper notes for lesion locations. Dotplot explores how a browser-based clinical tool could reduce that context switching while preserving the security expectations of patient-data software.

##The application demonstrates:

Patient CRUD through a real backend API
Matching patient records to ultrasound imaging studies
Interactive torso map for breast lesion coordinates
Role-based access control for radiologist, nurse, and IT admin workflows
Server-side validation and append-only audit events
Report generation workflow for radiology review
Shared TypeScript types across frontend and backend
##Tech Stack
Area	Tools
Frontend	React, TypeScript, Vite, TanStack Query
Backend	Node.js, Fastify, TypeScript, Zod
Database	Prisma, SQLite for local development
Auth & Security	JWT, bcrypt password hashing, role-based access control, no PHI in URLs
DevOps	Docker Compose, GitHub Actions CI
Testing	Vitest
##Key Features
Clinical Workspace
Clinicians can view structured patient details, matched ultrasound scan IDs, diagnosis, BI-RADS rating, allergies, medications, and lesion metadata from one screen.

##Lesion Mapping
Radiologists can use the torso visualisation to review lesion side, quadrant, clock-face position, distance from nipple, and matching scan information.

##Role-Based Access Control
The backend enforces different permissions for:

Radiologist: patient review and report generation
Nurse: ward observation workflow
IT admin: audit trail review and administrative access
##Audit Logging
Patient access and clinical actions are recorded server-side with user, role, patient ID, action, and timestamp. This models the auditability expected in healthcare software.

##Security-Conscious Design
Dotplot uses synthetic data, bcrypt-hashed passwords, JWT authentication, server-side Zod validation, and avoids placing protected health information in URLs.

##Architecture
apps/web        React + TypeScript frontend
apps/api        Fastify API, Prisma schema, auth, RBAC, audit logging
packages/shared Shared TypeScript domain types
Running Locally
npm install
cp apps/api/.env.example apps/api/.env
npm run db:push
npm run db:seed
npm run dev
Frontend: http://localhost:5173
Backend: http://localhost:4000
API docs: http://localhost:4000/docs

Demo users all use the password Dotplot123!:

radiologist@dotplot.test
nurse@dotplot.test
it@dotplot.test
Docker
docker compose up --build
Quality Checks
npm run build
npm test
Data Notice
All names, patient identifiers, scan IDs, and clinical details are synthetic mock data. This repository must not be used with real patient data or PHI.
