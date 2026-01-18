
import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem, Supplier, AgentDecision } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    As the LabChain AI Procurement Agent specialized in Indian Hospital Supply Chains, analyze the laboratory inventory and supplier options.
    Decide if a reorder is necessary for critical items. Use INR (₹) for all costing.
    
    INVENTORY STATUS:
    ${inventoryBrief}

    SUPPLIER OPTIONS:
    ${supplierBrief}

    Identify the MOST CRITICAL item needing reorder for the hospital.
    Provide:
    1. A high-level explanation in simple language.
    2. Exactly 4 simple logical steps (e.g., "Checked current tubes available", "Calculated usage for next week").
    3. A confidence score between 0.85 and 0.99.
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
