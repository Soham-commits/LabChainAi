"""
Suppliers data management module
Provides static supplier data for laboratory procurement
Pure data only - no logic, no ranking, no decision-making
"""
from typing import List, Dict, Any


# Static supplier data - realistic Indian lab suppliers
# Each supplier has different trade-offs (no "perfect" supplier)
SUPPLIERS = [
    {
        "supplier_id": "SUP-001",
        "supplier_name": "BioLab Express Mumbai",
        "location": "Mumbai",
        "delivery_eta_days": 2,
        "reliability_rating": 4.2,
        "price_factor": 1.25  # 25% premium for fast delivery
    },
    {
        "supplier_id": "SUP-002",
        "supplier_name": "MedSupply India",
        "location": "Bengaluru",
        "delivery_eta_days": 4,
        "reliability_rating": 4.7,
        "price_factor": 1.0  # Baseline pricing
    },
    {
        "supplier_id": "SUP-003",
        "supplier_name": "LabChem Solutions",
        "location": "Delhi",
        "delivery_eta_days": 3,
        "reliability_rating": 3.8,
        "price_factor": 0.85  # 15% cheaper but less reliable
    },
    {
        "supplier_id": "SUP-004",
        "supplier_name": "Scientific Supplies Co.",
        "location": "Mumbai",
        "delivery_eta_days": 5,
        "reliability_rating": 4.5,
        "price_factor": 0.90  # Slower but reliable and affordable
    },
    {
        "supplier_id": "SUP-005",
        "supplier_name": "QuickLab Distributors",
        "location": "Bengaluru",
        "delivery_eta_days": 1,
        "reliability_rating": 3.5,
        "price_factor": 1.40  # Fastest but expensive and less reliable
    }
]


def get_all_suppliers() -> List[Dict[str, Any]]:
    """
    Get all supplier data
    Returns static supplier list - no filtering, no ranking
    """
    return SUPPLIERS
