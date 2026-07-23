# Spectrum ERP Synchronization Script

This standalone Python script is designed to run directly on your regional Windows servers where the Spectrum MS Access (`.accdb`) databases reside.

It connects to the local database, extracts Clients, Products (SKUs), and current-month Financials, and securely pushes that data to the central Order Management Platform webhook.

## Prerequisites

1. **Python 3.8+** installed on the Windows Server.
2. **Microsoft Access Database Engine Redistributable** installed (usually already present if you are using Access).

## Installation

1. Open a command prompt or PowerShell window in this directory.
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

## Configuration

Create a `.env` file in this directory based on the following template:

```env
# The physical path to your MS Access Database file
MS_ACCESS_DB_PATH="C:\Spectrum\Data\Spectrum.accdb"

# Which regional office is this running in? (e.g., Mumbai, Nashik, Delhi, Bengaluru)
SOURCE_LOCATION="Nashik"

# The live URL of your Vercel deployment's webhook endpoint
WEBHOOK_URL="https://your-domain.vercel.app/api/webhooks/spectrum-sync"

# The secret key required to authenticate with the webhook
SPECTRUM_SYNC_SECRET="your-secure-webhook-secret"
```

## ⚠️ Important Customization Required ⚠️

Because every local ERP setup is different, you **MUST** open `sync.py` and modify the SQL queries inside the following functions to match the actual Table Names and Column Names inside your Access Database:
1. `fetch_clients(cursor)`
2. `fetch_skus(cursor)`
3. `fetch_financials(cursor)`

*Look for the `TODO:` comments inside `sync.py`.*

## Automation (Task Scheduler)

To run this automatically twice a day:
1. Open **Windows Task Scheduler**.
2. Click **Create Basic Task**.
3. Name it "Spectrum Database Sync".
4. Set the trigger to **Daily** (and set it to repeat every 12 hours).
5. For the Action, select **Start a program**.
6. Program/script: `python`
7. Add arguments: `C:\Path\To\This\Folder\sync.py`
8. Start in: `C:\Path\To\This\Folder` (Important! So it can read the `.env` file).
9. Save and run!
