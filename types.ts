
export enum StockStatus {
  NORMAL = 'Normal',
  AT_RISK = 'At Risk',
  CRITICAL = 'Critical'
}

export interface InventoryItem {
  id: string;
  name: string;
  currentStock: number;
  avgDailyUsage: number;
  expiryDate: string;
  unit: string;
  minThreshold: number;
  costPerUnit: number;
}

export interface ComputedInventoryItem extends InventoryItem {
  daysUntilStockOut: number;
  status: StockStatus;
}

export interface Supplier {
  id: string;
  name: string;
  deliveryTimeDays: number;
  rating: number;
}

export interface AgentDecision {
  decision: 'REORDER' | 'NO_ACTION';
  recommendedQuantity: number;
  selectedSupplier: string;
  estimatedDeliveryTime: string;
  estimatedCost: number;
  explanation: string;
  reasoningSteps: string[];
  confidenceScore: number;
  poId?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  type: 'system' | 'ai' | 'user';
}
