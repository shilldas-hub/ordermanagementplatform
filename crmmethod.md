Here is the comprehensive Product Requirements Document (PRD) designed specifically for an AI coding assistant (like Cursor, Claude, or Devin).

AI agents perform best when given strict data models, clear user stories, and defined workflows. You can copy and paste the entire block below directly into your AI coding tool to start building.

# 📄 Product Requirements Document (PRD): Unified CRM & Order Management System

## 1\. Project Overview

**Objective:** Build a cloud-based CRM and Order Management System that centralizes operations across 5 regional sales offices (Mumbai, Nashik, Ahmedabad, Madurai, Bengaluru). The system will integrate with a legacy on-premise ERP (Spectrum) to synchronize databases twice daily, harmonize fragmented data, track sales pipelines, automate dispatch coordination, and consolidate financial reports.

**Target Interface:** Mobile-first, responsive web application (Progressive Web App - PWA) to feel like a native app for field sales executives, with a robust desktop view for Admin, Dispatch, and Accounts.

## 2\. Tech Stack Recommendations (For the AI Developer)

- **Frontend:** Next.js (React), Tailwind CSS (for fast, responsive mobile-first UI), Shadcn UI (for pre-built, clean components).
- **Backend:** Next.js API Routes or Node.js/Express.
- **Database:** PostgreSQL (Supabase or Vercel Postgres) - relational data is crucial here.
- **Cron Jobs/Workers:** For the twice-daily Spectrum database sync.
- **Authentication:** NextAuth or Supabase Auth (Role-Based Access Control is required).

## 3\. User Roles & Permissions (RBAC)

- **Super Admin (HQ):** Full CRUD access to all modules, all regions, global settings, and consolidated financial dashboards.
- **Regional Manager:** View and edit access for all Sales Executives, Leads, and Orders _only within their assigned region_.
- **Sales Executive:** View and edit access _only_ for their own assigned leads, clients, and orders. Cannot see other executives' data.
- **Dispatch / Logistics:** View incoming approved POs across regions. Can update order status, stock status, and dispatch timelines. No access to financial P&L or lead generation.
- **Accounts:** Access to the financial consolidation module, payment confirmations, and invoicing data.

## 4\. Core Workflows & Features

### Module A: Sales & Pipeline Management

- **Dynamic Kanban Board:** Visual pipeline for tracking leads.
- **Customizable Stages:** Admin must be able to add, edit, or remove pipeline stages from the settings module.
  - _Default stages:_ New Lead → Meeting Scheduled → Quotation Sent → Negotiation → Order Won (PO Received) → Lost.
- **Activity Logging:** Sales reps must be able to quickly log call notes, upload files (like the PO document), and update statuses via mobile.

### Module B: Order to Dispatch Workflow (State Machine)

When a deal hits "Order Won (PO Received)", the following workflow triggers:

- **System Check:** Is this a _New_ or _Existing_ customer?
- **New Customer Route:**
  - Status shifts to Pending Account Creation.
  - Dispatch/Admin receives the PO to create the account in the master system.
  - Accounts/Sales verify payment terms (e.g., advance payment required).
- **Existing Customer Route:**
  - Status shifts to Pending Dispatch Review.
- **Dispatch Action:** Dispatch team receives a notification/dashboard alert. They review the order and select one of two outcomes:
  - **In Stock:** Mark as Ready for Dispatch.
  - **Out of Stock:** Mark as Backordered, trigger an internal purchase request, and input an "Expected Lead Time" which automatically sends a push/in-app notification to the respective Sales Executive to inform the client.

### Module C: Spectrum ERP Integration & Data Harmonization

- **Twice-Daily Sync:** System must have an API endpoint to receive (or a cron job to fetch) database dumps/syncs from the 5 local Spectrum databases.
- **Data Harmonization Engine:** Because SKU codes and Client IDs might vary slightly across the 5 locations, the system requires a "Mapping Table."
  - _Logic:_ When syncing, the system checks if Spectrum_Client_Nashik_001 matches an existing Unified Client Profile. If not, it flags it for the Admin to merge or approve as a new record.

### Module D: Financial Consolidation

- **Financial Dashboard:** A unified view of the Balance Sheet and P&L.
- **Data Aggregation:** The system will pull the raw financial data synced from the 5 Spectrum databases, convert them into a standardized format, and sum them up.
- **Manual Fallback Form:** In case the Spectrum API sync fails or data is missing, provide a secure input form for regional accountants to manually upload a standardized CSV or input monthly top-line numbers for the consolidation engine to merge.

## 5\. High-Level Database Schema (Instructions for AI)

SQL

\-- AI Coder: Please implement the following entity relationships in Prisma/Drizzle or raw SQL:

Table Users {

id UUID PK

name String

role Enum (Admin, Regional_Manager, Sales_Exec, Dispatch, Accounts)

region_id UUID FK

}

Table Regions {

id UUID PK

name String (Mumbai, Nashik, Ahmedabad, Madurai, Bengaluru)

}

Table Unified_Clients {

id UUID PK

company_name String

is_new_account Boolean

\-- Mapping fields for the 5 Spectrum databases

spectrum_mumbai_id String NULL

spectrum_nashik_id String NULL

\-- etc...

}

Table Leads {

id UUID PK

sales_exec_id UUID FK

client_id UUID FK

stage_id UUID FK -- Links to dynamic stages table

expected_value Decimal

}

Table Orders {

id UUID PK

lead_id UUID FK

client_id UUID FK

po_document_url String

payment_terms String

status Enum (Pending_Account, Pending_Payment, Pending_Dispatch, Backordered, Dispatched)

lead_time_date Date NULL

}

## 6\. Development Phases & AI Instructions

**AI Coder, please execute this project in the following strict phases:**

- **Phase 1: Foundation & Auth:** Set up the Next.js app, configure the database, and implement the RBAC system so different logins see different navigation menus. Ensure it is fully responsive for mobile.
- **Phase 2: CRM & Dynamic Pipeline:** Build the Kanban board, Lead tracking, and the Admin settings page to customize pipeline stages.
- **Phase 3: The Order/Dispatch Engine:** Build the workflow described in Module B. Create the Dispatch dashboard where they can see incoming POs and update lead times. Ensure notifications flow back to the specific Sales Exec who owns the lead.
- **Phase 4: Data Consolidation & UI:** Build the UI for the Financial P&L/Balance Sheet merger, including the manual CSV upload fallback.
- **Phase 5: API & Sync Prep:** Create secure REST API endpoints that the legacy Spectrum servers will push data to twice daily. Implement the Data Harmonization UI for merging duplicate SKUs/Clients.

How the new system will connect or link to Spectrum?

To give your AI coder the exact instructions on how to build this connection, we need to look at how Microbrain's Spectrum ERP is actually built.

Based on Microbrain's technical architecture, Spectrum is a Windows-based application that runs on a **Microsoft SQL Server (MS SQL)** database located on your local servers.

Because your 5 locations have their own local servers, they are not natively "on the cloud." Therefore, the AI developer will need to build a **bridge** between your 5 local MS SQL databases and your new centralized Cloud CRM.

Here is the exact technical blueprint you should add to your PRD for the AI coder to build the connection. You can copy and paste this directly to them:

## Addendum: Spectrum ERP Integration & Database Architecture

**To the AI Developer:**

The client is using "Spectrum ERP by Microbrain" across 5 disparate geographical locations. Each location operates its own local server running a **Microsoft SQL Server** database.

Do NOT attempt to find a modern REST API for Spectrum, as it is a legacy client-server application. Instead, you must build a database-level integration using one of the following two architectures. **Architecture A is highly recommended for security and stability.**

### Architecture A: The "Push" Method via Local Middleware (Recommended)

Exposing 5 local MS SQL servers to the public internet is a major security risk. Instead, we will use a lightweight local agent.

- **The Local Agent:** Write a lightweight Node.js or Python script. The client will install this small script on the Windows Server at each of the 5 locations (Mumbai, Nashik, Ahmedabad, Madurai, Bengaluru).
- **The Connection:** This local script will connect directly to the local Spectrum MS SQL database using standard SQL drivers (e.g., mssql in Node or pyodbc in Python).
- **The Cron Job:** The script will be scheduled via Windows Task Scheduler or a Node cron-job to run twice daily (e.g., 1:00 PM and 9:00 PM).
- **The Payload:** When triggered, the script will run SELECT queries to extract:
  - Updated Customers / Accounts
  - Current Inventory / Stock Levels
  - Financial outputs (for the P&L and Balance Sheet)
  - _Crucial:_ It should use a "Delta Sync" (only querying rows where updated_at is greater than the last sync time) to keep the payload small.
- **The Push:** The script will package this data as JSON and send it via a secure POST request (with an API Key) to our new Cloud CRM's webhook endpoint (e.g., \[<https://api.yournewcrm.com/webhooks/spectrum-sync\>](<https://api.yournewcrm.com/webhooks/spectrum-sync>)).

### Architecture B: The "Pull" Method via Static IPs

If the client cannot install middleware on their local servers, we must have the Cloud CRM reach into the servers.

- **Network Setup:** The client must configure their router at all 5 locations to have a **Static IP** and set up Port Forwarding (usually Port 1433 for MS SQL).
- **Security Firewall:** The client's IT team must whitelist the static IP address of our new Cloud CRM server (e.g., Vercel, AWS, or Render IP) so _only_ our CRM can access the database.
- **The Cloud Cron Job:** The Cloud CRM will run a scheduled background job (e.g., using Inngest, Upstash, or standard Cron) twice a day.
- **The Query:** The cloud server will use an MS SQL client to securely connect to all 5 IP addresses, run the SELECT queries, and update the unified cloud PostgreSQL database.

### Handling Data Mapping (The "Golden Record" Problem)

Because the 5 databases are siloed, a customer might exist in Mumbai as CUST-001 and in Nashik as N-CUST-99.

- **Action Required:** Build a **Data Reconciliation UI** in the Admin panel.
- When the sync runs, if the CRM detects similar names but different Spectrum IDs, it should flag them in a "Pending Merges" queue. The Admin can click "Merge," linking both Spectrum IDs to one unified Cloud CRM ID.

### Summary for You (The Founder)

If you hand this to your AI coder, they will immediately know they need to write a **small script that lives on your office servers**. That script will securely read your Spectrum database twice a day and securely beam that data up to your new cloud dashboard. This completely bypasses the need for Microbrain to build an expensive custom API for you!

Note: Database is on Microsoft Access