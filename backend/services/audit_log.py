"""
Audit log service module
Provides append-only audit trail for all system activities
Clinical-grade logging for NABL/ISO compliance mindset
"""
from datetime import datetime
from typing import List, Dict, Any, Literal
from enum import Enum


class LogSource(str, Enum):
    """Valid log sources"""
    USER = "USER"
    SENTINEL = "LabChain Sentinel"
    SYSTEM = "SYSTEM"


# In-memory audit log (session-persistent)
# Append-only: No delete, no update, no overwrite
_AUDIT_LOG: List[Dict[str, Any]] = []


def add_log(source: LogSource, message: str) -> None:
    """
    Add a new entry to the audit log
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
    
    _AUDIT_LOG.append(log_entry)


def get_all_logs() -> List[Dict[str, Any]]:
    """
    Get complete audit log timeline
    Returns logs ordered from oldest → newest
    Read-only operation
    """
    return _AUDIT_LOG.copy()  # Return copy to prevent external modification


def get_log_count() -> int:
    """
    Get total number of log entries
    Useful for monitoring system activity
    """
    return len(_AUDIT_LOG)


# Initialize with system startup log
add_log(LogSource.SYSTEM, "LabChainAi Backend initialized")
