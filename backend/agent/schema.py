"""
Safety and stability schema for LabChain Sentinel responses.
Enforces strict structure on all AI outputs to protect the UI and system.
"""
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from enum import Enum

class DecisionType(str, Enum):
    NO_ACTION = "NO_ACTION"
    PROCURE = "PROCURE"
    URGENT_RESTOCK = "URGENT_RESTOCK"

class ProcurementItem(BaseModel):
    item_id: str
    item_name: str
    quantity: int
    supplier_id: str
    estimated_cost: float

class AgentResponse(BaseModel):
    decision: DecisionType = Field(..., description="The primary decision made by the agent")
    reasoning_trace: List[str] = Field(..., description="Step-by-step logic used to reach the decision")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence in the decision (0.0-1.0)")
    procurement: Optional[List[ProcurementItem]] = Field(default=None, description="Detailed procurement plan if decision involves restocking")
    po_id: Optional[str] = Field(default=None, description="Unique Purchase Order ID if execution occurred")


    @field_validator('confidence_score')
    @classmethod
    def score_must_be_valid(cls, v: float) -> float:
        if not (0 <= v <= 1):
            raise ValueError('Confidence score must be between 0 and 1')
        return v
