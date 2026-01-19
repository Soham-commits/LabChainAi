"""
Inventory data management module
Provides lab inventory data with risk metrics
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any


# Static inventory data - realistic lab supplies
RAW_INVENTORY = [
    {
        "item_id": "LAB-001",
        "item_name": "Nitrile Gloves (Box of 100)",
        "current_stock": 45,
        "avg_daily_usage": 15,
        "expiry_date": "2026-08-15",
        "criticality": "high",
        "base_price_inr": 850
    },
    {
        "item_id": "LAB-002",
        "item_name": "Pipette Tips (1000μL)",
        "current_stock": 120,
        "avg_daily_usage": 25,
        "expiry_date": "2027-03-20",
        "criticality": "high",
        "base_price_inr": 2400
    },
    {
        "item_id": "LAB-003",
        "item_name": "Ethanol 95% (1L)",
        "current_stock": 8,
        "avg_daily_usage": 2,
        "expiry_date": "2026-06-30",
        "criticality": "medium",
        "base_price_inr": 1200
    },
    {
        "item_id": "LAB-004",
        "item_name": "PCR Tubes (0.2mL)",
        "current_stock": 200,
        "avg_daily_usage": 50,
        "expiry_date": "2028-01-10",
        "criticality": "high",
        "base_price_inr": 3500
    },
    {
        "item_id": "LAB-005",
        "item_name": "Agar Powder (500g)",
        "current_stock": 3,
        "avg_daily_usage": 1,
        "expiry_date": "2026-04-25",
        "criticality": "medium",
        "base_price_inr": 4500
    },
    {
        "item_id": "LAB-006",
        "item_name": "Petri Dishes (90mm)",
        "current_stock": 75,
        "avg_daily_usage": 20,
        "expiry_date": "2027-11-05",
        "criticality": "high",
        "base_price_inr": 1800
    },
    {
        "item_id": "LAB-007",
        "item_name": "Sodium Chloride (NaCl) 1kg",
        "current_stock": 12,
        "avg_daily_usage": 3,
        "expiry_date": "2028-09-12",
        "criticality": "low",
        "base_price_inr": 600
    },
    {
        "item_id": "LAB-008",
        "item_name": "pH Buffer Solution (pH 7.0)",
        "current_stock": 2,
        "avg_daily_usage": 1,
        "expiry_date": "2026-02-28",
        "criticality": "high",
        "base_price_inr": 950
    },
    {
        "item_id": "LAB-009",
        "item_name": "Microscope Slides (Box of 50)",
        "current_stock": 150,
        "avg_daily_usage": 10,
        "expiry_date": "2029-05-18",
        "criticality": "medium",
        "base_price_inr": 550
    },
    {
        "item_id": "LAB-010",
        "item_name": "Distilled Water (5L)",
        "current_stock": 6,
        "avg_daily_usage": 4,
        "expiry_date": "2026-07-22",
        "criticality": "medium",
        "base_price_inr": 150
    }
]


def calculate_days_until_stockout(current_stock: int, avg_daily_usage: float) -> int:
    """
    Calculate days until stock runs out
    Returns -1 if usage is 0 (infinite stock)
    """
    if avg_daily_usage <= 0:
        return -1
    return int(current_stock / avg_daily_usage)


def update_inventory_stock(item_id: str, added_quantity: int) -> bool:
    """
    Update stock levels after procurement execution
    """
    for item in RAW_INVENTORY:
        if item["item_id"] == item_id:
            item["current_stock"] += added_quantity
            return True
    return False


def get_inventory_with_metrics() -> List[Dict[str, Any]]:
    """
    Get inventory data with calculated risk metrics
    Returns inventory with days_until_stockout computed
    """
    inventory_with_metrics = []
    
    for item in RAW_INVENTORY:
        # Calculate days until stockout
        days_until_stockout = calculate_days_until_stockout(
            item["current_stock"],
            item["avg_daily_usage"]
        )
        
        # Create enriched item
        enriched_item = {
            **item,
            "days_until_stockout": days_until_stockout
        }
        
        inventory_with_metrics.append(enriched_item)
    
    return inventory_with_metrics

