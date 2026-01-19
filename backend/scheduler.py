"""
Daily Autonomous Scheduler for LabChain Sentinel
STEP 2: Scheduler Wrapper (Does NOT contain decision logic)
"""
import asyncio
import threading
from datetime import datetime
from typing import Optional
from config import DAILY_AUTONOMOUS_SCAN, SCAN_INTERVAL_SECONDS
from services.audit_log import add_log, LogSource

# STEP 5: Safety Guard #1 - Re-entrancy Guard
_scan_in_progress = False
_scan_lock = threading.Lock()

class SentinelScheduler:
    """
    Scheduler wrapper that invokes Sentinel at regular intervals.
    Does NOT contain decision logic - only triggers the agent.
    """
    
    def __init__(self):
        self._task: Optional[asyncio.Task] = None
        self._stop_event = asyncio.Event()
        
    async def run_scheduled_scan(self):
        """
        Execute a single scheduled scan with safety guards
        """
        global _scan_in_progress
        
        # STEP 5: Safety Guard #1 - Re-entrancy check
        with _scan_lock:
            if _scan_in_progress:
                add_log(LogSource.SYSTEM, "Scheduled scan skipped: Previous scan still in progress (re-entrancy guard)")
                return
            _scan_in_progress = True
        
        try:
            # STEP 4: Logging - Trigger source
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            add_log(LogSource.SYSTEM, f"Daily autonomous scan triggered at {timestamp}")
            add_log(LogSource.SYSTEM, "Trigger source: SYSTEM_SCHEDULER")
            
            # STEP 2: Call existing /agent/run logic (does not add new logic)
            from agent.sentinel import run_sentinel_analysis
            result = run_sentinel_analysis()
            
            # STEP 4: Logging - Result
            decision = result.get("decision", "UNKNOWN")
            if decision == "NO_ACTION":
                add_log(LogSource.SYSTEM, "Scheduled scan result: NO_ACTION (inventory stable)")
            else:
                po_id = result.get("po_id", "N/A")
                add_log(LogSource.SYSTEM, f"Scheduled scan result: PROCUREMENT_EXECUTED (PO: {po_id})")
            
            # STEP 5: Safety Guard #2 - Idempotence is handled by Sentinel itself
            # (Sentinel checks inventory state and returns NO_ACTION if stable)
            
        except Exception as e:
            add_log(LogSource.SYSTEM, f"Scheduled scan error: {str(e)}")
        finally:
            with _scan_lock:
                _scan_in_progress = False
    
    async def start(self):
        """
        Start the scheduler with initial scan on startup
        """
        # STEP 5: Safety Guard #3 - Kill Switch
        if not DAILY_AUTONOMOUS_SCAN:
            add_log(LogSource.SYSTEM, "Daily autonomous scan DISABLED (kill switch active)")
            return
        
        add_log(LogSource.SYSTEM, "Daily autonomous scan mode ENABLED")
        add_log(LogSource.SYSTEM, f"Scan interval: {SCAN_INTERVAL_SECONDS} seconds ({SCAN_INTERVAL_SECONDS // 3600} hours)")
        
        # STEP 3: First run on startup (demo-friendly)
        # Run initial scan in background task to not block startup
        add_log(LogSource.SYSTEM, "Scheduling initial scan (startup simulation)...")
        asyncio.create_task(self._run_initial_scan())
        
        # Schedule subsequent runs
        self._task = asyncio.create_task(self._schedule_loop())
    
    async def _run_initial_scan(self):
        """
        Run the initial scan on startup without blocking
        """
        await self.run_scheduled_scan()
        add_log(LogSource.SYSTEM, "Initial scan complete. Next scan in 24 hours.")
    
    async def _schedule_loop(self):
        """
        Internal loop that runs scans at regular intervals
        """
        while not self._stop_event.is_set():
            try:
                # Wait for the configured interval
                await asyncio.wait_for(
                    self._stop_event.wait(), 
                    timeout=SCAN_INTERVAL_SECONDS
                )
            except asyncio.TimeoutError:
                # Timeout is expected - time to run the next scan
                await self.run_scheduled_scan()
    
    async def stop(self):
        """
        Stop the scheduler gracefully
        """
        add_log(LogSource.SYSTEM, "Shutting down daily autonomous scanner...")
        self._stop_event.set()
        if self._task:
            await self._task

# Global scheduler instance
_scheduler_instance: Optional[SentinelScheduler] = None

async def start_scheduler():
    """
    Initialize and start the global scheduler instance
    """
    global _scheduler_instance
    if _scheduler_instance is None:
        _scheduler_instance = SentinelScheduler()
        await _scheduler_instance.start()

async def stop_scheduler():
    """
    Stop the global scheduler instance
    """
    global _scheduler_instance
    if _scheduler_instance is not None:
        await _scheduler_instance.stop()
        _scheduler_instance = None
