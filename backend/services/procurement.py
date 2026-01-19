"""
Procurement execution service
Handles Purchase Order generation and inventory state updates
"""
import random
from typing import List, Dict, Any
from services.audit_log import add_log, LogSource
from data.inventory import update_inventory_stock

def generate_po_id() -> str:
    """
    Generates a unique, realistic Purchase Order ID
    """
    return f"ORD-{random.randint(100000, 999999)}"

def execute_procurement(procurement_plan: List[Dict[str, Any]]) -> str:
    """
    Executes the procurement plan:
    1. Generates a PO ID
    2. Updates inventory stock
    3. Calculates total cost
    4. Logs every step
    """
    if not procurement_plan:
        add_log(LogSource.SYSTEM, "Procurement execution skipped: Empty plan")
        return ""

    add_log(LogSource.SYSTEM, "Procurement execution started")
    
    po_id = generate_po_id()
    add_log(LogSource.SYSTEM, f"PO {po_id} generated")
    
    total_cost = 0
    for item in procurement_plan:
        item_id = item.get("item_id")
        quantity = item.get("quantity", 0)
        cost = item.get("estimated_cost", 0)
        
        # Update inventory
        success = update_inventory_stock(item_id, quantity)
        
        if success:
            add_log(LogSource.SYSTEM, f"Inventory updated for {item_id}: +{quantity} units")
            total_cost += cost
        else:
            add_log(LogSource.SYSTEM, f"Failed to update inventory for {item_id}")

    add_log(LogSource.SYSTEM, f"Procurement execution completed. Total PO value: ₹{total_cost:,.2f}")
    
    return po_id
