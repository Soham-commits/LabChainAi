"""
LabChain Sentinel Agent Core
Handles reasoning, response validation, and safety guardrails.
"""
import os
import json
import google.generativeai as genai
from typing import Any, Dict, List
from agent.schema import AgentResponse, DecisionType
from services.audit_log import add_log, LogSource
from data.inventory import get_inventory_with_metrics
from data.suppliers import get_all_suppliers

# Sentinel Mission Statement (Clinical-grade mindset)
SENTINEL_MISSION = """
You are LabChain Sentinel, a world-class laboratory procurement agent. 
Your mission is to ensure absolute stability in laboratory supply chains through clinical-grade reasoning. 
You operate with a high-integrity, ISO-compliant mindset. 

Your tasks:
1. Analyze critical inventory items (those with < 3 days of stock remaining).
2. Evaluate provided Indian suppliers based on reliability, delivery speed, and cost.
3. Select the best supplier for each item based on its criticality.
4. Return a structured JSON response identifying the best course of action.

Rules:
- You ONLY reorder items that are CRITICAL (< 3 days stock).
- You prioritize reliability for high-criticality items.
- You must explain your reasoning trace clearly in bullet points.
- Your confidence score must be realistic (0.7 - 0.99).

Your JSON response MUST follow this exact schema:
{
  "decision": "PROCURE" | "URGENT_RESTOCK" | "NO_ACTION",
  "reasoning_trace": ["step 1", "step 2", ...],
  "confidence_score": 0.0 to 1.0,
  "procurement": [
    {
      "item_id": "string",
      "item_name": "string",
      "quantity": number,
      "supplier_id": "string",
      "estimated_cost": number
    }
  ]
}
"""

def validate_agent_response(raw_response: Any) -> Dict[str, Any]:
    """
    Validates agent output against the strict AgentResponse schema.
    If validation fails, logs the error and returns a safe NO_ACTION fallback.
    """
    try:
        # If input is a string, try to parse it as JSON first
        if isinstance(raw_response, str):
            # Strip markdown code blocks if present
            clean_str = raw_response.strip()
            if clean_str.startswith("```json"):
                clean_str = clean_str[7:]
            if clean_str.endswith("```"):
                clean_str = clean_str[:-3]
            data = json.loads(clean_str)
        else:
            data = raw_response

        # Enforce schema validation
        validated_response = AgentResponse(**data)
        return validated_response.model_dump()

    except Exception as e:
        add_log(LogSource.SENTINEL, f"Validation Failed: {str(e)}")
        add_log(LogSource.SYSTEM, "Guardrail Triggered: Returning NO_ACTION fallback")
        
        safe_fallback = AgentResponse(
            decision=DecisionType.NO_ACTION,
            reasoning_trace=["Validation error occurred.", "Guardrail triggered."],
            confidence_score=0.0,
            procurement=[]
        )
        return safe_fallback.model_dump()

def run_sentinel_analysis() -> Dict[str, Any]:
    """
    The core Agent Loop: Observe -> Filter -> Context -> Reason -> Validate -> Respond.
    """
    add_log(LogSource.SENTINEL, "Sentinel analysis started")
    
    # 1. Observe & 2. Filter
    inventory = get_inventory_with_metrics()
    critical_items = [
        item for item in inventory 
        if item["days_until_stockout"] < 3 and item["days_until_stockout"] >= 0
    ]
    
    # Decision Rule: If no items are critical, return NO_ACTION without calling LLM
    if not critical_items:
        add_log(LogSource.SENTINEL, "No critical items detected (< 3 days)")
        add_log(LogSource.SENTINEL, "Decision: NO_ACTION")
        
        response = AgentResponse(
            decision=DecisionType.NO_ACTION,
            reasoning_trace=[
                "Observation: All inventory levels are currently stable.",
                "Filter: No items found with < 3 days of stock remaining.",
                "Final: No action required at this time to maintain stability."
            ],
            confidence_score=0.99,
            procurement=[]
        )
        return response.model_dump()

    # 3. Load Context
    suppliers = get_all_suppliers()
    
    # 4. Reason (Gemini)
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        add_log(LogSource.SYSTEM, "Gemini API key missing")
        return validate_agent_response({"error": "API key missing"})

    try:
        add_log(LogSource.SYSTEM, f"Configuring Gemini with API key (length: {len(api_key) if api_key else 0})")
        genai.configure(api_key=api_key)
        
        selected_model = 'gemini-3-flash-preview'
        add_log(LogSource.SYSTEM, f"Using model: {selected_model}")
        model = genai.GenerativeModel(selected_model)
        
        user_prompt = f"""
        INVENTORY DATA (including base_price_inr): {json.dumps(critical_items)}
        SUPPLIER DATA (including price_factor): {json.dumps(suppliers)}
        
        Analyze the critical items and provide a procurement plan. 
        For each item selected for reorder, calculate the estimated_cost as:
        (quantity * item.base_price_inr * supplier.price_factor)
        
        Return structured JSON matching the AgentResponse schema.
        """

        add_log(LogSource.SENTINEL, "Requesting reasoning from Gemini...")
        response = model.generate_content(
            f"{SENTINEL_MISSION}\n\n{user_prompt}",
            generation_config={"response_mime_type": "application/json"}
        )
        
        add_log(LogSource.SENTINEL, "Gemini response received")
        raw_output = response.text
        
        # 5. Validate
        add_log(LogSource.SYSTEM, "Validating agent response")
        validated_data = validate_agent_response(raw_output)

        
        # 6. Execute Action (New Layer)
        if validated_data["decision"] != DecisionType.NO_ACTION:
            from services.procurement import execute_procurement
            po_id = execute_procurement(validated_data.get("procurement", []))
            validated_data["po_id"] = po_id
        else:
            add_log(LogSource.SENTINEL, "No actions required; procurement execution skipped.")

        add_log(LogSource.SENTINEL, f"Analysis cycle complete. Decision: {validated_data['decision']}")
        return validated_data


    except Exception as e:
        add_log(LogSource.SENTINEL, f"Reasoning failed: {str(e)}")
        return validate_agent_response({})

