"""
Main entry point for the backend application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = FastAPI(title="LabChainAi Backend")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def health_check():
    """Health check endpoint"""
    from services.audit_log import add_log, LogSource
    add_log(LogSource.SYSTEM, "Health check endpoint accessed")
    return {"status": "ok", "message": "LabChainAi Backend is running"}


@app.get("/inventory")
async def get_inventory():
    """Get inventory data with calculated risk metrics"""
    from data.inventory import get_inventory_with_metrics
    from services.audit_log import add_log, LogSource
    
    add_log(LogSource.USER, "Inventory endpoint accessed")
    
    inventory = get_inventory_with_metrics()
    
    add_log(LogSource.SYSTEM, f"Inventory data retrieved: {len(inventory)} items")
    
    return {
        "inventory": inventory,
        "total_items": len(inventory),
        "message": "Inventory data with risk metrics"
    }


@app.get("/agent/logs")
async def get_audit_logs():
    """Get complete audit log timeline"""
    from services.audit_log import get_all_logs, get_log_count
    
    logs = get_all_logs()
    
    return {
        "logs": logs,
        "total_entries": get_log_count(),
        "message": "Audit log timeline (oldest → newest)"
    }


@app.get("/agent/run")
async def run_agent():
    """Trigger LabChain Sentinel analysis loop"""
    from agent.sentinel import run_sentinel_analysis
    return run_sentinel_analysis()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

