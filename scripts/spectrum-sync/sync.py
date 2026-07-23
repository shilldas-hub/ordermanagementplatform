import pyodbc
import requests
import json
import os
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file if present
load_dotenv()

# ==============================================================================
# CONFIGURATION
# ==============================================================================

# Path to the local MS Access database file
MS_ACCESS_DB_PATH = os.getenv("MS_ACCESS_DB_PATH", r"C:\Path\To\Spectrum.accdb")

# The location string to identify this region (e.g., "Mumbai", "Nashik", "Delhi")
SOURCE_LOCATION = os.getenv("SOURCE_LOCATION", "Nashik")

# The URL of your Next.js application webhook
WEBHOOK_URL = os.getenv("WEBHOOK_URL", "http://localhost:3000/api/webhooks/spectrum-sync")

# The secret key to authenticate with the webhook
WEBHOOK_SECRET = os.getenv("SPECTRUM_SYNC_SECRET", "dev-secret-key-123")

# ==============================================================================

def get_db_connection():
    """Establishes a connection to the MS Access database using ODBC."""
    try:
        conn_str = (
            r'DRIVER={Microsoft Access Driver (*.mdb, *.accdb)};'
            f'DBQ={MS_ACCESS_DB_PATH};'
        )
        return pyodbc.connect(conn_str)
    except Exception as e:
        print(f"❌ Failed to connect to MS Access database: {e}")
        return None

def fetch_clients(cursor):
    """
    Fetches clients from the MS Access database.
    NOTE: You MUST update the SQL query and column names to match your actual Spectrum schema!
    """
    try:
        # TODO: Replace with actual Table name from your Spectrum DB
        cursor.execute("SELECT ClientID, CompanyName, Email, Phone, Address FROM Customers")
        clients = []
        for row in cursor.fetchall():
            clients.append({
                "spectrumClientId": str(row.ClientID),
                "companyName": row.CompanyName,
                "email": row.Email,
                "phone": row.Phone,
                "address": row.Address
            })
        print(f"✅ Fetched {len(clients)} clients.")
        return clients
    except Exception as e:
        print(f"⚠️ Error fetching clients (check table name/schema): {e}")
        return []

def fetch_skus(cursor):
    """
    Fetches SKUs/Products from the MS Access database.
    NOTE: You MUST update the SQL query and column names to match your actual Spectrum schema!
    """
    try:
        # TODO: Replace with actual Table name from your Spectrum DB
        cursor.execute("SELECT SkuID, ProductName, Category, UnitPrice FROM Products")
        skus = []
        for row in cursor.fetchall():
            skus.append({
                "spectrumSkuId": str(row.SkuID),
                "name": row.ProductName,
                "category": row.Category,
                "price": float(row.UnitPrice) if row.UnitPrice else 0.0
            })
        print(f"✅ Fetched {len(skus)} SKUs.")
        return skus
    except Exception as e:
        print(f"⚠️ Error fetching SKUs (check table name/schema): {e}")
        return []

def fetch_financials(cursor):
    """
    Fetches the current period's financial summary from MS Access.
    """
    try:
        # TODO: Replace with actual logic to calculate/fetch Monthly Revenue & Expenses
        # This is dummy logic representing a summation query
        cursor.execute("SELECT SUM(TotalAmount) as Revenue FROM Invoices WHERE MONTH(InvoiceDate) = MONTH(DATE())")
        rev_row = cursor.fetchone()
        revenue = float(rev_row.Revenue) if rev_row and rev_row.Revenue else 0.0

        cursor.execute("SELECT SUM(Amount) as Expenses FROM Expenses WHERE MONTH(ExpenseDate) = MONTH(DATE())")
        exp_row = cursor.fetchone()
        expenses = float(exp_row.Expenses) if exp_row and exp_row.Expenses else 0.0

        profit = revenue - expenses

        financials = {
            "period": datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat() + "Z",
            "revenue": revenue,
            "expenses": expenses,
            "profit": profit
        }
        print(f"✅ Fetched financials: Rev={revenue}, Exp={expenses}, Profit={profit}")
        return financials
    except Exception as e:
        print(f"⚠️ Error fetching financials: {e}")
        return None

def main():
    print(f"🔄 Starting Spectrum Data Sync for Region: {SOURCE_LOCATION}")
    
    conn = get_db_connection()
    if not conn:
        return
    
    cursor = conn.cursor()

    # Fetch Data
    clients = fetch_clients(cursor)
    skus = fetch_skus(cursor)
    financials = fetch_financials(cursor)

    conn.close()

    # Construct Payload
    payload = {
        "sourceLocation": SOURCE_LOCATION,
        "clients": clients,
        "skus": skus,
        "financials": financials
    }

    print("\n🚀 Sending payload to Central Order Management Platform...")
    try:
        response = requests.post(
            WEBHOOK_URL,
            json=payload,
            headers={
                "Content-Type": "application/json",
                "x-api-key": WEBHOOK_SECRET
            },
            timeout=30 # 30 second timeout
        )

        if response.status_code == 200:
            data = response.json()
            print("\n✅ Sync Successful!")
            print(f"   Clients Processed: {data.get('clientsProcessed', 0)}")
            print(f"   SKUs Processed: {data.get('skusProcessed', 0)}")
            print(f"   Financials Processed: {data.get('financialsProcessed', False)}")
        else:
            print(f"\n❌ Sync Failed! Server returned status: {response.status_code}")
            print(f"   Response: {response.text}")

    except Exception as e:
        print(f"\n❌ Network error while sending payload: {e}")

if __name__ == "__main__":
    main()
