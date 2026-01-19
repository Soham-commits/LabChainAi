
import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, Supplier, AgentDecision } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "" });

export const analyzeProcurement = async (
  inventory: InventoryItem[],
  suppliers: Supplier[]
): Promise<AgentDecision> => {
  const model = 'gemini-3-flash-preview';

  const inventoryBrief = inventory.map(item => 
    `${item.name}: Stock ${item.currentStock}${item.unit}, Daily Use ${item.avgDailyUsage}, Min Threshold ${item.minThreshold}, Expiry ${item.expiryDate}, Cost per unit ₹${item.costPerUnit}`
  ).join('\n');

  const supplierBrief = suppliers.map(s => 
    `${s.name} (Delivers in ${s.deliveryTimeDays} days, Rating ${s.rating})`
  ).join('\n');

  const prompt = `
    PRIMARY DIRECTIVE: LabChain Sentinel autonomously monitors laboratory inventory, identifies clinically critical supply risks, selects the optimal supplier, and executes procurement actions with full explainability and auditability.
    
    As the LabChain Sentinel Agent, analyze the laboratory inventory and supplier options below.
    Your task is to identify items needing immediate reorder to prevent laboratory downtime while ensuring cost-effectiveness and supply chain resilience. Use INR (₹) for all costing.
    
    INVENTORY STATUS:
    ${inventoryBrief}
    
    SUPPLIER OPTIONS:
    ${supplierBrief}
    
    REQUIRED ACTION:
    Identify the MOST CRITICAL clinical item needing reorder based on "Days Until Stock-Out" and minimum thresholds.
    
    OUTPUT FORMAT:
    Provide:
    1. A clear high-level explanation of the identified risk and your mitigation strategy.
    2. Exactly 4 simple reasoning steps that demonstrate your logic trace (monitoring -> risk detection -> supplier choice -> execution).
    3. A confidence score between 0.85 and 0.99.
    4. Select the supplier with the best balance of delivery speed and reliability rating.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          decision: { type: Type.STRING, enum: ['REORDER', 'NO_ACTION'] },
          recommendedQuantity: { type: Type.NUMBER },
          selectedSupplier: { type: Type.STRING },
          estimatedDeliveryTime: { type: Type.STRING },
          estimatedCost: { type: Type.NUMBER },
          explanation: { type: Type.STRING },
          reasoningSteps: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          confidenceScore: { type: Type.NUMBER }
        },
        required: ['decision', 'recommendedQuantity', 'selectedSupplier', 'estimatedDeliveryTime', 'estimatedCost', 'explanation', 'reasoningSteps', 'confidenceScore']
      }
    }
  });

  const data = JSON.parse(response.text.trim());
  return {
    ...data,
    poId: data.decision === 'REORDER' ? `ORD-${Math.floor(100000 + Math.random() * 900000)}` : undefined
  };
};
