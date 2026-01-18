
import { InventoryItem, Supplier } from './types';

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    name: 'Vacutainer Tubes (K3 EDTA)',
    currentStock: 450,
    avgDailyUsage: 150,
    expiryDate: '2025-10-15',
    unit: '(units)',
    minThreshold: 600,
    costPerUnit: 12.50
  },
  {
    id: '2',
    name: 'Dengue NS1 Antigen Kits',
    currentStock: 15,
    avgDailyUsage: 8,
    expiryDate: '2025-06-20',
    unit: '(kits)',
    minThreshold: 30,
    costPerUnit: 450.00
  },
  {
    id: '3',
    name: 'Medical Grade Ethanol (99%)',
    currentStock: 8,
    avgDailyUsage: 2.5,
    expiryDate: '2025-12-31',
    unit: '(liters)',
    minThreshold: 15,
    costPerUnit: 320.00
  },
  {
    id: '4',
    name: 'Nitrile Gloves (Box of 100)',
    currentStock: 120,
    avgDailyUsage: 35,
    expiryDate: '2027-01-01',
    unit: '(boxes)',
    minThreshold: 100,
    costPerUnit: 380.00
  },
  {
    id: '5',
    name: 'Rapid Malaria PF/PV Kits',
    currentStock: 250,
    avgDailyUsage: 12,
    expiryDate: '2025-09-10',
    unit: '(tests)',
    minThreshold: 100,
    costPerUnit: 85.00
  }
];

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'S1', name: 'Bharat Medical Systems (Bengaluru)', deliveryTimeDays: 2, rating: 4.9 },
  { id: 'S2', name: 'Hind Diagnostics (New Delhi)', deliveryTimeDays: 4, rating: 4.6 },
  { id: 'S3', name: 'Mumbai Pharma Logistics', deliveryTimeDays: 3, rating: 4.4 }
];
