
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { MOCK_INVENTORY, MOCK_SUPPLIERS } from './constants';
import { ComputedInventoryItem, StockStatus, AgentDecision, AuditLogEntry } from './types';
import InventoryTable from './components/InventoryTable';
import { analyzeProcurement } from './services/geminiService';
import { 
  BeakerIcon, 
  CpuChipIcon, 
  CheckBadgeIcon, 
  ArrowPathIcon,
  ShoppingBagIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  ScaleIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [decision, setDecision] = useState<AgentDecision | null>(null);
  const [isTraceExpanded, setIsTraceExpanded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    setLastUpdated(`${time} IST`);
  }, []);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Initialize logs on mount
  useEffect(() => {
    setAuditLogs([
      { 
        id: 'initial-system-ready', 
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }), 
        action: 'LabChain System ready. Sentinel Node-07 monitoring active.', 
        type: 'system' 
      }
    ]);
  }, []);

  const addLog = useCallback((action: string, type: 'system' | 'ai' | 'user' = 'ai') => {
    setAuditLogs(prev => {
      const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newLog: AuditLogEntry = {
        id: newId,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
        action,
        type
      };
      return [newLog, ...prev].slice(0, 20);
    });
  }, []);

  const inventoryData = useMemo(() => {
    return MOCK_INVENTORY.map((item): ComputedInventoryItem => {
      const daysUntilStockOut = item.currentStock / item.avgDailyUsage;
      let status = StockStatus.NORMAL;
      if (item.currentStock < item.minThreshold || daysUntilStockOut < 3) {
        status = StockStatus.CRITICAL;
      } else if (daysUntilStockOut < 7) {
        status = StockStatus.AT_RISK;
      }
      return { ...item, daysUntilStockOut, status };
    });
  }, []);

  const riskSummary = useMemo(() => {
    const counts = { [StockStatus.CRITICAL]: 0, [StockStatus.AT_RISK]: 0, [StockStatus.NORMAL]: 0 };
    inventoryData.forEach(item => counts[item.status]++);
    return counts;
  }, [inventoryData]);

  const runAgent = useCallback(async () => {
    setIsAnalyzing(true);
    setDecision(null);
    addLog('Operator initiated inventory audit & procurement review.', 'user');
    
    try {
      addLog('LabChain Sentinel scanning inventory matrices...', 'ai');
      const result = await analyzeProcurement(MOCK_INVENTORY, MOCK_SUPPLIERS);
      
      setDecision(result);
      
      if (result.decision === 'REORDER') {
        addLog(`Sentinel recommendation: Order ${result.recommendedQuantity} units from ${result.selectedSupplier}.`, 'ai');
        addLog(`Procurement successful: Purchase order ${result.poId} generated and transmitted.`, 'system');
        addLog('Sentinel task completed successfully: Supply chain optimization cycle concluded.', 'ai');
      } else {
        addLog('Sentinel analysis: Inventory buffers healthy. No reorder required.', 'ai');
        addLog('Sentinel task completed successfully: Audit cycle concluded.', 'ai');
      }
    } catch (error) {
      addLog('System error: Sentinel Node-07 analysis cycle interrupted. Check connectivity.', 'system');
      console.error(error);
      alert("Sentinel was unable to complete the analysis. Please check your API configuration and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [addLog]);

  const handleRefresh = useCallback(() => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    setLastUpdated(`${time} IST`);
    addLog('Inventory matrix manually refreshed by Operator.', 'user');
    setTimeout(() => addLog('Inventory feed sync: Success', 'system'), 300);
  }, [addLog]);

  const stockComparison = useMemo(() => {
    if (!decision || decision.decision !== 'REORDER') return null;
    const itemNameKey = decision.explanation.toLowerCase();
    const affectedItem = inventoryData.find(i => itemNameKey.includes(i.name.toLowerCase().split(' ')[0]) || i.id === '1');
    if (!affectedItem) return null;
    return {
      name: affectedItem.name,
      before: affectedItem.currentStock,
      after: affectedItem.currentStock + decision.recommendedQuantity,
      unit: affectedItem.unit
    };
  }, [decision, inventoryData]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-indigo-100 antialiased pb-20">
      {/* Smart Navbar */}
      <div className={`sticky top-0 z-[100] transition-all duration-500 w-full ${isScrolled ? 'pt-4 px-4 sm:px-6 lg:px-8' : 'pt-0 px-0'}`}>
        <header className={`mx-auto bg-white/95 backdrop-blur-xl border-slate-200 h-20 flex items-center justify-between transition-all duration-500 ${isScrolled ? 'max-w-7xl rounded-3xl border shadow-[0_20px_40px_rgba(0,0,0,0.06)] px-8' : 'w-full border-b shadow-none px-8 sm:px-12'}`}>
          <div 
            className="flex items-center space-x-4 cursor-pointer group" 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          >
            <div className="relative">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <BeakerIcon className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-[2px] border-white shadow-sm"></div>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none">LabChain<span className="text-indigo-600">AI</span></h1>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em] mt-1">Smart Hospital Supply</p>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-12">
            <button onClick={() => scrollToSection('inventory-section')} className="text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-600 transition-all relative group">
              Inventory Matrix
              <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
            </button>
            <button onClick={() => scrollToSection('agent-workspace')} className="text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-600 transition-all relative group">
              Sentinel Intelligence
              <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
            </button>
            <button onClick={() => scrollToSection('audit-trail')} className="text-[11px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-600 transition-all relative group">
              Activity Log
              <span className="absolute -bottom-1.5 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
            </button>
          </nav>

          <div className="flex items-center space-x-5">
             <div className="hidden sm:flex flex-col items-end px-4 py-2 bg-slate-100/50 rounded-xl border border-slate-200/50">
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-600">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></span>
                  System: Online
                </div>
                <span className="text-[8px] font-bold text-slate-400 mt-0.5">Sentinel Node-07 Sync: {lastUpdated}</span>
             </div>
          </div>
        </header>
      </div>

      <div className={`${isScrolled ? 'h-8' : 'h-12'}`}></div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Status Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-6">
            <div className="p-4 bg-red-50 rounded-2xl">
              <BeakerIcon className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Urgent Actions</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{riskSummary[StockStatus.CRITICAL]}</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-6">
            <div className="p-4 bg-amber-50 rounded-2xl">
              <ShieldCheckIcon className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Low Supplies</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{riskSummary[StockStatus.AT_RISK]}</p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-6">
            <div className="p-4 bg-emerald-50 rounded-2xl">
              <CheckBadgeIcon className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Healthy Inventory</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{riskSummary[StockStatus.NORMAL]}</p>
            </div>
          </div>
        </div>

        {/* Inventory Table Section */}
        <section id="inventory-section" className="space-y-6 scroll-mt-32">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-[0.25em] flex items-center">
                <ShoppingBagIcon className="w-5 h-5 mr-3 text-indigo-600" /> Hospital Inventory Feed
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Autonomous clinical stock monitoring via Sentinel Protocol</p>
            </div>
            <button 
               onClick={handleRefresh}
               className="group flex items-center space-x-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all duration-300"
             >
                <ArrowPathIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span>Refresh Matrix</span>
             </button>
          </div>
          <div className="w-full">
            <InventoryTable inventory={inventoryData} />
          </div>
        </section>

        {/* Main Workspace: Agent Control */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div id="agent-workspace" className="lg:col-span-8 space-y-8 scroll-mt-32">
            <section className="space-y-6">
              {!decision && !isAnalyzing && (
                <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between overflow-hidden relative group">
                  <div className="relative z-10 space-y-8">
                    <div className="space-y-4">
                      <div className="inline-flex items-center px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
                        Agent Instance: LabChain Sentinel
                      </div>
                      <h3 className="text-4xl font-black tracking-tighter leading-tight text-slate-900">Run Procurement Agent</h3>
                      <p className="text-slate-500 text-base max-w-sm leading-relaxed font-medium">
                        Engage <strong>LabChain Sentinel</strong> to autonomously audit clinical stock levels and execute optimal vendor selection.
                      </p>
                    </div>
                    <button 
                      onClick={runAgent}
                      className="bg-indigo-600 text-white px-10 py-5 rounded-xl font-black text-sm hover:bg-indigo-700 transition-all flex items-center space-x-3 shadow-md duration-300 active:scale-95"
                    >
                      <CpuChipIcon className="w-6 h-6" />
                      <span>Execute Sentinel Analysis</span>
                    </button>
                  </div>
                  <div className="relative z-10 mt-12 md:mt-0 p-8 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center space-y-4 group-hover:border-indigo-100 transition-colors">
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                       <UserCircleIcon className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">LabChain Sentinel</p>
                       <p className="text-xs font-bold text-slate-600">Node-07 • Standby</p>
                    </div>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="bg-white border border-slate-200 p-20 rounded-3xl flex flex-col items-center justify-center text-center space-y-8 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-50 opacity-30 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]"></div>
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-[4px] border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-[4px] border-t-indigo-600 rounded-full animate-spin"></div>
                  </div>
                  <div className="relative space-y-2">
                    <h4 className="text-xl font-bold tracking-tight text-slate-900">Sentinel Cycle Running</h4>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Optimizing Supply Chain Parameters</p>
                  </div>
                </div>
              )}

              {decision && (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 ease-out">
                  {/* Decision Panel */}
                  <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-sm border-b-[6px] border-b-indigo-600">
                    <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-8">
                      <div className="flex items-center space-x-5">
                        <div className="p-3 bg-indigo-50 rounded-xl">
                          <CheckBadgeIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-900 tracking-tight">Sentinel Recommendation</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Autonomous Procurement Intelligence</p>
                        </div>
                      </div>
                      <span className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest ${
                        decision.decision === 'REORDER' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {decision.decision}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item Required</p>
                        <p className="text-base font-bold text-slate-900">{stockComparison?.name || 'Scan Item'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order Vol.</p>
                        <p className="text-base font-bold text-slate-900">{decision.recommendedQuantity}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vendor</p>
                        <p className="text-base font-bold text-slate-900">{decision.selectedSupplier}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. Cost</p>
                        <p className="text-base font-bold text-indigo-600">₹{decision.estimatedCost.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 space-y-4">
                      <div className="flex items-start space-x-4">
                        <InformationCircleIcon className="w-6 h-6 text-indigo-500 shrink-0" />
                        <p className="text-[14px] text-slate-600 leading-relaxed font-medium italic">
                          "{decision.explanation}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Procurement Success UI */}
                  {decision.decision === 'REORDER' && (
                    <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm border-t-8 border-t-emerald-500 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="flex items-center space-x-6 flex-1">
                          <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-100 shrink-0 shadow-inner">
                             <CheckBadgeIcon className="w-7 h-7" />
                          </div>
                          <div className="space-y-1 text-center md:text-left">
                            <h5 className="text-2xl font-black tracking-tight text-slate-900 leading-none">Procurement Successful</h5>
                            <div className="flex flex-col">
                              <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wide">Autonomous PO transmission complete</p>
                              <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest mt-1.5">Authorized by LabChain Sentinel (Node-07)</p>
                            </div>
                          </div>
                        </div>

                        <div className="w-full md:w-auto flex items-stretch bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                           <div className="px-6 py-4 flex flex-col justify-center border-r border-slate-200 bg-white min-w-[140px]">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 leading-none">PO ID</p>
                              <p className="text-xl font-black text-indigo-600 tabular-nums leading-none tracking-tight">{decision.poId}</p>
                           </div>
                           <button className="px-8 py-4 bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center space-x-3 text-[11px] font-black uppercase tracking-[0.15em] group shrink-0">
                              <ArrowDownTrayIcon className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                              <span>Get PO Receipt</span>
                           </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inference Trace */}
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => setIsTraceExpanded(!isTraceExpanded)}
                      className="w-full px-10 py-6 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <ScaleIcon className="w-5 h-5 text-indigo-500" />
                        <span className="font-bold text-[12px] uppercase tracking-widest text-slate-500">Sentinel Inference Trace</span>
                      </div>
                      {isTraceExpanded ? <ChevronUpIcon className="w-5 h-5 text-slate-300" /> : <ChevronDownIcon className="w-5 h-5 text-slate-300" />}
                    </button>
                    {isTraceExpanded && (
                      <div className="px-10 pb-10 pt-2 space-y-4 border-t border-slate-50">
                        {decision.reasoningSteps.map((step, idx) => (
                          <div key={idx} className="flex items-start space-x-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                            <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-900 flex items-center justify-center text-[12px] font-bold shrink-0">{idx + 1}</span>
                            <div className="space-y-1">
                               <p className="text-[14px] text-slate-700 font-medium leading-relaxed">{step}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Activity Feed Sidebar */}
          <div id="audit-trail" className="lg:col-span-4 space-y-6 scroll-mt-32">
            <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm h-fit sticky top-32">
              <div className="px-8 py-8 border-b border-slate-50 bg-[#fafbfc]/80 backdrop-blur-sm flex items-center justify-between">
                <h4 className="text-[13px] font-bold uppercase text-slate-900 tracking-[0.1em] flex items-center">
                  <ClockIcon className="w-5 h-5 mr-3 text-slate-400" /> Sentinel Activity Log
                </h4>
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
              </div>
              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                {auditLogs.length === 0 && (
                  <p className="text-center text-[11px] font-bold text-slate-300 uppercase tracking-widest py-10">No activities detected</p>
                )}
                {auditLogs.map((log, index) => {
                  const logLabel = log.type === 'ai' ? 'Sentinel' : (log.type === 'user' ? 'Operator' : 'System');
                  const dotColor = log.type === 'ai' ? 'bg-indigo-600' : (log.type === 'user' ? 'bg-amber-500' : 'bg-slate-300');
                  const badgeColor = log.type === 'ai' ? 'text-indigo-600 bg-white border-indigo-50' : 'text-slate-500 bg-white border-slate-100';
                  
                  // Latest log logic: only highlight if it is index 0 (most recent) AND contains success keywords
                  const isLatest = index === 0;
                  const isSuccessAction = log.action.toLowerCase().includes('successful') || log.action.toLowerCase().includes('success');
                  const shouldHighlight = isLatest && isSuccessAction;
                  
                  return (
                    <div key={log.id} className="relative pl-9 pb-3 border-l border-slate-100 last:border-0 group">
                      <div className={`absolute -left-[6.5px] top-1.5 w-3 h-3 rounded-full ring-[4px] ring-white ${shouldHighlight ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : dotColor} transition-all duration-300`}></div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-400 tracking-tight tabular-nums">{log.timestamp}</span>
                          <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-lg border ${badgeColor}`}>{logLabel}</span>
                        </div>
                        <p className={`text-[13px] font-medium leading-relaxed group-hover:text-slate-900 transition-colors ${shouldHighlight ? 'text-emerald-600 font-bold' : 'text-slate-600'}`}>
                          {log.action}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="px-8 py-4 bg-slate-50 text-[10px] font-bold text-slate-400 text-center border-t border-slate-100 uppercase tracking-widest">
                Real-time Network Sync Active
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 mt-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
            <div className="md:col-span-6 space-y-8">
              <div 
                className="flex items-center space-x-4 cursor-pointer group" 
                onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
              >
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                  <BeakerIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tighter leading-none">LabChain<span className="text-indigo-600">AI</span></h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Smart Hospital Supply</p>
                </div>
              </div>
              
              <p className="text-[14px] text-slate-500 leading-relaxed font-medium max-w-md">
                LabChain AI is a clinical-grade supply chain intelligence layer for modern laboratories. Powered by <strong>Sentinel Protocol</strong>, we automate the gap between clinical demand and vendor logistics.
              </p>
            </div>

            <div className="md:col-span-3 space-y-6">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-900">Infrastructure</h4>
              <ul className="space-y-4">
                {['Sentinel Protocols', 'Agent Nodes', 'Vendor Matrix', 'Audit Hub'].map(link => (
                  <li key={link}><button className="text-[13px] font-medium text-slate-400 hover:text-indigo-600 transition-colors">{link}</button></li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-3 space-y-6">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-900">Compliance</h4>
              <ul className="space-y-4">
                {['NABL Guidelines', 'HIPAA Secure', 'Procurement Logic', 'Data Governance'].map(link => (
                  <li key={link}><button className="text-[13px] font-medium text-slate-400 hover:text-indigo-600 transition-colors">{link}</button></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-16 border-t border-slate-100 mt-16 gap-8">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.1em]">© 2024 LabChain AI. Healthcare Core Integration v1.0. Sentinel Node Active.</p>
            <div className="flex items-center space-x-10">
              <a href="#" className="text-[11px] font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Operator Guidelines</a>
              <a href="#" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest">Network Status</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
