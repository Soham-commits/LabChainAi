import { AgentDecision } from "../types";

const API_BASE_URL = "http://127.0.0.1:8000";

export const analyzeProcurement = async (): Promise<AgentDecision> => {
  const response = await fetch(`${API_BASE_URL}/agent/run`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Map backend response to frontend AgentDecision format
  return {
    decision: data.decision,
    recommendedQuantity: data.procurement?.[0]?.quantity || 0,
    selectedSupplier: data.procurement?.[0]?.supplier_id || 'N/A',
    estimatedDeliveryTime: '2-3 days',
    estimatedCost: data.procurement?.reduce((sum: number, item: any) => sum + (item.estimated_cost || 0), 0) || 0,
    explanation: data.reasoning_trace?.join(' ') || 'Analysis complete.',
    reasoningSteps: data.reasoning_trace || [],
    confidenceScore: data.confidence_score || 0.95,
    poId: data.po_id
  };
};
