"""
Audit log service module
Provides append-only audit trail for all system activities
Clinical-grade logging for NABL/ISO compliance mindset
"""
import json
import os
from datetime import datetime
from typing import List, Dict, Any
from enum import Enum
from pathlib import Path


class LogSource(str, Enum):
    """Valid log sources"""
    USER = "USER"
    SENTINEL = "LabChain Sentinel"
    SYSTEM = "SYSTEM"


# Append-only log file path
LOG_DIR = Path(__file__).parent.parent / "logs"
LOG_FILE = LOG_DIR / "audit.log"

# Ensure log directory exists
LOG_DIR.mkdir(exist_ok=True)


def add_log(source: LogSource, message: str) -> None:
    """
    Add a new entry to the audit log (append-only file)
    Append-only operation - cannot be undone
    
    Args:
        source: Who/what generated this log (USER, LabChain Sentinel, SYSTEM)
        message: Clear, descriptive message of what happened
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    log_entry = {
        "timestamp": timestamp,
        "source": source.value,
        "message": message
    }
    
    # Append to file (append-only, no updates, no deletes)
    with open(LOG_FILE, "a") as f:
        f.write(json.dumps(log_entry) + "\n")


def get_all_logs() -> List[Dict[str, Any]]:
    """
    Get complete audit log timeline from file
    Returns logs ordered from oldest → newest
    Read-only operation
    """
    if not LOG_FILE.exists():
        return []
    
    logs = []
    with open(LOG_FILE, "r") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    logs.append(json.loads(line))
                except json.JSONDecodeError:
                    # Skip malformed lines (should never happen in append-only mode)
                    pass
    
    return logs


def get_log_count() -> int:
    """
    Get total number of log entries
    Useful for monitoring system activity
    """
    return len(get_all_logs())


# Initialize with system startup log
add_log(LogSource.SYSTEM, "LabChainAi Backend initialized")
