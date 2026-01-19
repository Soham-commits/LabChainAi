"""
Configuration settings for LabChain Sentinel
"""
import os
from dotenv import load_dotenv

load_dotenv()

# STEP 1: Daily Autonomous Scan Configuration
DAILY_AUTONOMOUS_SCAN = os.getenv("DAILY_AUTONOMOUS_SCAN", "true").lower() == "true"

# Scan interval in seconds (24 hours = 86400 seconds)
SCAN_INTERVAL_SECONDS = int(os.getenv("SCAN_INTERVAL_SECONDS", "86400"))

# Gemini API Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
