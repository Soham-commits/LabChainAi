
import React from 'react';
import { ComputedInventoryItem, StockStatus } from '../types';

interface Props {
  inventory: ComputedInventoryItem[];
}

const InventoryTable: React.FC<Props> = ({ inventory }) => {
  const getStatusStyles = (status: StockStatus) => {
    switch (status) {
      case StockStatus.CRITICAL:
        return 'bg-red-50 text-red-700 border-red-100';
      case StockStatus.AT_RISK:
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  };

  const getRowStyles = (item: ComputedInventoryItem) => {
    if (item.status === StockStatus.CRITICAL) {
      return item.daysUntilStockOut < 2 ? 'bg-red-100/40' : 'bg-red-50/20';
    }
    return 'bg-white';
  };

  return (
    <div className="w-full space-y-4">
      {/* Micro-Legend with escaped characters */}
      <div className="flex justify-end space-x-6 px-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            🔴 {"< 3 Days"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            🟡 {"3-7 Days"}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            🟢 {"> 7 Days"}
          </span>
        </div>
      </div>

      <div className="w-full rounded-[2rem] border border-slate-200 shadow-[0_4px_30px_rgba(0,0,0,0.02)] bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-[#fafbfc]">
            <tr>
              <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Item Description</th>
              <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Stock On Hand</th>
              <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Usage Rate</th>
              <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <div>Days Until Stock-Out</div>
                <div className="text-[9px] font-medium tracking-normal normal-case text-slate-300 font-sans">Based on current usage rate</div>
              </th>
              <th className="px-10 py-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {inventory.map((item) => {
              const daysColor = item.daysUntilStockOut < 3 ? 'text-red-600' : (item.daysUntilStockOut < 7 ? 'text-amber-600' : 'text-slate-900');
              const progressBg = item.daysUntilStockOut < 3 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : (item.daysUntilStockOut < 7 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]');
              
              return (
                <tr key={item.id} className={`${getRowStyles(item)} transition-all hover:bg-indigo-50/30 group`}>
                  <td className="px-10 py-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors cursor-pointer hover:underline underline-offset-4 decoration-indigo-200 decoration-2">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        ₹{item.costPerUnit.toLocaleString('en-IN', { minimumFractionDigits: 2 })} / unit • Exp: {new Date(item.expiryDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-6 whitespace-nowrap">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-base font-black text-slate-900">{item.currentStock}</span>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.unit}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 whitespace-nowrap">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-sm font-black text-slate-600">{item.avgDailyUsage}</span>
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">/day</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className={`text-[14px] font-black ${daysColor}`}>
                        {item.daysUntilStockOut.toFixed(1)} Days
                      </span>
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-visible relative">
                        <div 
                          className={`h-full rounded-full transition-all duration-700 ${progressBg}`}
                          style={{ width: `${Math.min(100, item.daysUntilStockOut * 10)}%` }}
                        ></div>
                        <div className="absolute top-0 left-[30%] h-full w-[1px] bg-slate-300/50 z-10" title="3 Day Threshold"></div>
                        <div className="absolute top-0 left-[70%] h-full w-[1px] bg-slate-300/50 z-10" title="7 Day Threshold"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 whitespace-nowrap">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black border ${getStatusStyles(item.status)} uppercase tracking-[0.15em] shadow-sm`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
