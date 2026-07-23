# Vercel & Supabase Deployment Guide

This guide explains the deployment architecture for the Order Management Platform, specifically addressing the interaction between Vercel Serverless Functions, Prisma, and Supabase PostgreSQL.

## 🏗 Architecture Overview
- **Frontend/Backend:** Next.js (hosted on Vercel)
- **Database:** PostgreSQL (hosted on Supabase)
- **ORM:** Prisma Client

When deploying this stack, you must configure your database connection carefully. Unlike a local development server that runs continuously, Vercel uses **Serverless Functions** to render your Next.js pages and API routes. These functions spin up and down hundreds of times per second depending on traffic.

---

## ⚠️ The Two Critical Deployment Gotchas

### 1. The IPv4 vs IPv6 Connection Issue (The `P1001` Error)
If you see the error `Can't reach database server at db.[your-project].supabase.co` on Vercel, you are hitting the IPv6 routing block.

* **The Cause:** Supabase recently updated their direct database connections (port `5432`) to resolve exclusively to **IPv6** addresses. However, Vercel's serverless functions operate within **IPv4** networks. Because of this mismatch, Vercel physically cannot reach the Supabase direct connection.
* **The Solution:** Supabase provides an **IPv4 Transaction Pooler**. Instead of connecting directly to the database, Vercel connects to a proxy (PgBouncer) hosted by Supabase which handles the traffic. This URL usually contains `pooler.supabase.com` and operates on port `6543`.

### 2. Password Special Characters (The Connection String Parsing Error)
If your database password contains special characters like `@`, `#`, or `/`, it will break the URL parsing string. 
* **The Cause:** Connection strings use the format `postgresql://user:password@host:port/database`. If your password is `myPass@word1`, the parser thinks the `@` symbol inside your password is the separator between your credentials and the host.
* **The Solution:** You must **URL-encode** special characters in your password:
  * `@` becomes `%40`
  * `#` becomes `%23`
  * `/` becomes `%2F`
  * Example: `myPass@word1` ➡️ `myPass%40word1`

---

## 🚀 Step-by-Step Vercel Setup

### Step 1: Get your Transaction Pooler URL
1. Go to your **Supabase Dashboard** ➡️ **Project Settings** ➡️ **Database**.
2. Scroll down to the **Connection String** section and click the **Nodejs** tab.
3. Check the box for **"Use connection pooling"**.
4. The URL will now look something like this:
   ```text
   postgresql://postgres.[project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

### Step 2: Encode your Password
Take the URL from Step 1 and manually replace your password. If your password is `ordermanagementsystem@1`, you must replace the `@` with `%40`.
* **Incorrect:** `...:ordermanagementsystem@1@aws-0...`
* **Correct:** `...:ordermanagementsystem%401@aws-0...`

### Step 3: Add `connection_limit=1`
Because Vercel serverless functions spin up rapidly, they can exhaust connection pools. Append `&connection_limit=1` to the very end of your `DATABASE_URL` string to prevent Prisma from opening too many concurrent connections per function.

**Final expected string:**
```text
postgresql://postgres.nnmpvldcxnvhffxuccrh:ordermanagementsystem%401@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### Step 4: Configure Vercel Environment Variables
1. Go to your **Vercel Dashboard** ➡️ **Project Settings** ➡️ **Environment Variables**.
2. Add the following keys (making sure `DATABASE_URL` is your new pooled URL):

| Variable Name | Example Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://...pooler.supabase.com:6543/postgres?...` | The transaction pooler connection |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[project-ref].supabase.co` | Used by the Supabase Auth client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` | Public key for Supabase Auth |
| `SERVICE_ROLE_KEY` | `eyJhbG...` | Private key for bypassing RLS (if used) |

### Step 5: Redeploy
Environment variables **do not** automatically apply to a currently running Vercel deployment.
1. Go to the **Deployments** tab in Vercel.
2. Click the three dots (`...`) on your latest build.
3. Click **Redeploy**.

Once the new build finishes, it will connect using IPv4 and properly parse your credentials, completely eliminating the `P1001: Can't reach database server` error!
