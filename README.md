# Unified CRM & Order Management Platform

A comprehensive, full-stack enterprise resource planning (ERP) overlay and CRM built to synchronize with legacy on-premise systems (like Spectrum MS Access) while providing a modern, web-based interface for sales, dispatch, and financial consolidation.

## 🌟 Core Features

### 1. CRM (Customer Relationship Management)
* **Lead Management:** Track potential clients through customizable Kanban pipeline stages. Log calls, emails, and meetings in a dedicated activity timeline.
* **Client Management:** Convert successful leads into persistent client records. Maintain order history and interaction timelines in one unified view.
* **Pipeline Customization:** Super Admins can add, reorder, or delete pipeline stages via the Settings panel to match unique sales workflows.

### 2. Order Management & Dispatch
* **Product Catalog:** Manage SKU catalogs synchronized from legacy ERPs.
* **Order Processing:** Create, track, and manage orders with states ranging from `PENDING` to `DELIVERED`.
* **Dispatch Dashboard:** Dedicated interface for logistics. Assign drivers, track vehicle numbers, and update dispatch statuses in real-time.

### 3. Financial Consolidation
* **Financial Reports:** Visual dashboards built with Recharts displaying revenue, expenses, and profit margins.
* **Manual Fallbacks:** Ability to manually input financial records for periods where legacy ERP data is missing or incomplete.

### 4. Legacy ERP Integration (Spectrum Sync)
* **Webhook Architecture:** Exposes an `/api/webhooks/spectrum-sync` endpoint designed to receive JSON payloads from a local Windows server script running against `.accdb` Access databases.
* **Data Harmonizer:** A dedicated `/data-sync` dashboard that intercepts incoming data with unrecognized Client Names or SKUs, allowing admins to manually map legacy string names to UUIDs in the modern database.
* **Mapping Engine:** Persists mappings so future synchronizations automatically route to the correct Client/Product without manual intervention.

---

## 🛠 Technology Stack

* **Frontend:** Next.js 15+ (App Router), React, Tailwind CSS, Base UI components, Recharts, Lucide Icons.
* **Backend:** Next.js Server Actions & API Routes.
* **Database:** PostgreSQL (Hosted on Supabase).
* **ORM:** Prisma Client.
* **Authentication:** Supabase Auth (with Prisma-backed User synchronization).

---

## 💻 Local Development Setup

### 1. Prerequisites
* Node.js (v18 or higher)
* A Supabase project (for PostgreSQL database)

### 2. Environment Variables
Create a `.env` file in the root directory based on the following template:

```env
# Use your direct connection string (port 5432) for local development
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Supabase Auth Keys
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SERVICE_ROLE_KEY="your-service-role-key"

# Secret used to authenticate the local script hitting the webhook
SPECTRUM_SYNC_SECRET="your-secure-webhook-secret"
```

### 3. Database Initialization
Push the Prisma schema to your Supabase database and generate the local client:
```bash
npm install
npx prisma db push
npx prisma generate
```

*(Optional)* Seed the database with a test Super Admin user:
```bash
npm run seed
```

### 4. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

---

## 🚀 Vercel Deployment Guide

Deploying Next.js + Prisma to Vercel requires specific database connection string modifications to account for Serverless environments.

### 1. The IPv4 Connection Pooler (Critical)
Vercel's serverless functions operate on **IPv4**, but Supabase's direct connection URLs (port `5432`) are exclusively **IPv6**. If you use the direct URL on Vercel, you will get a `P1001: Can't reach database server` error.
* Go to Supabase ➡️ Project Settings ➡️ Database.
* Under **Connection String**, select **Nodejs** and check **"Use connection pooling"**.
* The URL will change to use port `6543` and a domain like `aws-0-[region].pooler.supabase.com`.

### 2. Password Encoding
If your database password contains special characters (like `@`, `#`, `/`), the connection string parser will fail in production.
* Replace `@` with `%40` in the connection string.
* Example: `password@123` becomes `password%40123`.

### 3. Vercel Environment Variables
In your Vercel Dashboard ➡️ Project Settings ➡️ Environment Variables, add your keys:
```env
# Notice the %40 encoding, the pooler domain, port 6543, and the connection limit
DATABASE_URL="postgresql://postgres.[project-ref]:your%40password@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
```

**Note:** After changing Environment Variables in Vercel, you must manually trigger a **Redeploy** from the Deployments tab for them to take effect!
