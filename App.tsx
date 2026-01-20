
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { MOCK_INVENTORY, MOCK_SUPPLIERS } from './constants';
import { ComputedInventoryItem, StockStatus, AgentDecision, AuditLogEntry } from './types';
import InventoryTable from './components/InventoryTable';
import { analyzeProcurement } from './services/labchainApi';
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
        action: 'LabChain system ready. Sentinel monitoring active.', 
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
    addLog('Operator initiated autonomous audit cycle.', 'user');
    
    try {
      addLog('LabChain Sentinel scanning inventory matrices...', 'ai');
      const result = await analyzeProcurement();
      
      setDecision(result);
      
      if (result.decision === 'REORDER' || result.decision === 'URGENT_RESTOCK' || result.decision === 'PROCURE') {
        addLog(`Sentinel recommendation: Order ${result.recommendedQuantity} units from ${result.selectedSupplier}.`, 'ai');
        addLog(`Procurement successful: Purchase order ${result.poId} generated and transmitted.`, 'system');
        addLog('Sentinel task completed successfully: Supply chain optimization cycle concluded.', 'ai');
      } else {
        addLog('Sentinel analysis: Inventory buffers healthy. No action required.', 'ai');
        addLog('Sentinel task completed successfully: Audit cycle concluded.', 'ai');
      }
    } catch (error) {
      addLog('System error: Sentinel analysis cycle interrupted. Check connectivity.', 'system');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [addLog]);

  const handleRefresh = useCallback(() => {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    setLastUpdated(`${time} IST`);
    addLog('Inventory matrix refreshed by Operator.', 'user');
    setTimeout(() => addLog('Inventory feed sync: Successful', 'system'), 300);
  }, [addLog]);

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
      {/* Floating Header */}
      <div className={`fixed top-0 z-[100] transition-all duration-500 w-full ${isScrolled ? 'pt-4 px-4 sm:px-6 lg:px-8' : 'pt-0 px-0'}`}>
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
                  Sentinel: Online
                </div>
                <span className="text-[8px] font-bold text-slate-400 mt-0.5">Last Sync: {lastUpdated}</span>
             </div>
          </div>
        </header>
      </div>

      <div className="h-32"></div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Normal Stock</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{riskSummary[StockStatus.NORMAL]}</p>
            </div>
          </div>
        </div>

        {/* Inventory Section */}
        <section id="inventory-section" className="space-y-6 scroll-mt-32">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-[0.25em] flex items-center">
                <ShoppingBagIcon className="w-5 h-5 mr-3 text-indigo-600" /> Inventory Matrix
              </h3>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Autonomous monitoring via sentinel protocol</p>
            </div>
            <button 
               onClick={handleRefresh}
               className="group flex items-center space-x-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all duration-300"
             >
                <ArrowPathIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span>Sync Matrix</span>
             </button>
          </div>
          <InventoryTable inventory={inventoryData} />
        </section>

        {/* Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div id="agent-workspace" className="lg:col-span-8 space-y-8 scroll-mt-32">
            <section className="space-y-6">
              {!decision && !isAnalyzing && (
                <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between overflow-hidden relative group">
                  <div className="relative z-10 space-y-8">
                    <div className="space-y-4">
                      <div className="inline-flex items-center px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600">
                        Primary Directive: Autonomous Procurement
                      </div>
                      <h3 className="text-4xl font-black tracking-tighter leading-tight text-slate-900">LabChain Sentinel</h3>
                      <p className="text-slate-500 text-[15px] max-w-lg leading-relaxed font-medium">
                        LabChain Sentinel autonomously monitors laboratory inventory, identifies clinically critical supply risks, selects the optimal supplier, and executes procurement actions with full explainability and auditability.
                      </p>
                    </div>
                    <button 
                      onClick={runAgent}
                      className="bg-indigo-600 text-white px-10 py-5 rounded-xl font-black text-sm hover:bg-indigo-700 transition-all flex items-center space-x-3 shadow-md duration-300 active:scale-95"
                    >
                      <CpuChipIcon className="w-6 h-6" />
                      <span>Execute Sentinel Agent</span>
                    </button>
                  </div>
                  <div className="relative z-10 mt-12 md:mt-0 p-8 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                       <UserCircleIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <div className="text-center">
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Agent Node</p>
                       <p className="text-xs font-bold text-slate-600">Node-07 Active</p>
                    </div>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="bg-white border border-slate-200 p-20 rounded-3xl flex flex-col items-center justify-center text-center space-y-8 shadow-sm">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-[4px] border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-[4px] border-t-indigo-600 rounded-full animate-spin"></div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold tracking-tight text-slate-900">Sentinel is analyzing inventory...</h4>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Identifying clinically critical risks</p>
                  </div>
                </div>
              )}

              {decision && (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 ease-out">
                  {/* Decision Summary */}
                  <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-sm border-b-[6px] border-b-indigo-600">
                    <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-8">
                      <div className="flex items-center space-x-5">
                        <div className="p-3 bg-indigo-50 rounded-xl">
                          <CheckBadgeIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-slate-900 tracking-tight">Sentinel Recommendation</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Autonomous intelligence output</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={runAgent}
                          disabled={isAnalyzing}
                          className="group flex items-center space-x-3 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-sm text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowPathIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                          <span>Rerun Agent</span>
                        </button>
                        <span className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest ${
                          decision.decision === 'REORDER' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {decision.decision}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item</p>
                        <p className="text-base font-bold text-slate-900">Critical Stock</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quantity</p>
                        <p className="text-base font-bold text-slate-900">{decision.recommendedQuantity}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Supplier</p>
                        <p className="text-base font-bold text-slate-900">{decision.selectedSupplier}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Est. Cost</p>
                        <p className="text-base font-bold text-indigo-600">₹{decision.estimatedCost.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                      <p className="text-[14px] text-slate-600 leading-relaxed font-medium italic">
                        "{decision.explanation}"
                      </p>
                    </div>
                  </div>

                  {/* Execution Success Card */}
                  {decision.decision === 'REORDER' && (
                    <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm border-t-8 border-t-emerald-500">
                      <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="flex items-center space-x-6 flex-1">
                          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0">
                             <CheckBadgeIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <h5 className="text-xl font-black text-slate-900">Procurement Successful</h5>
                            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wide">Autonomous PO transmitted by Sentinel</p>
                          </div>
                        </div>

                        <div className="flex items-stretch bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                           <div className="px-6 py-4 flex flex-col justify-center border-r border-slate-200 bg-white">
                              <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Order Ref</p>
                              <p className="text-lg font-black text-indigo-600 tracking-tight">{decision.poId}</p>
                           </div>
                           <button className="px-6 py-4 bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest">
                              <ArrowDownTrayIcon className="w-4 h-4" />
                              <span>Get PO</span>
                           </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Logical Trace */}
                  <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => setIsTraceExpanded(!isTraceExpanded)}
                      className="w-full px-10 py-6 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <ScaleIcon className="w-5 h-5 text-indigo-500" />
                        <span className="font-bold text-[12px] uppercase tracking-widest text-slate-500">Sentinel Reasoning Trace</span>
                      </div>
                      {isTraceExpanded ? <ChevronUpIcon className="w-5 h-5 text-slate-300" /> : <ChevronDownIcon className="w-5 h-5 text-slate-300" />}
                    </button>
                    {isTraceExpanded && (
                      <div className="px-10 pb-10 pt-2 space-y-4 border-t border-slate-50">
                        {decision.reasoningSteps.map((step, idx) => (
                          <div key={idx} className="flex items-start space-x-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                            <span className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-900 flex items-center justify-center text-[12px] font-bold shrink-0">{idx + 1}</span>
                            <p className="text-[14px] text-slate-700 font-medium leading-relaxed">{step}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Activity Log */}
          <div id="audit-trail" className="lg:col-span-4 space-y-6 scroll-mt-32">
            <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm h-fit sticky top-32">
              <div className="px-8 py-8 border-b border-slate-50 bg-[#fafbfc] flex items-center justify-between">
                <h4 className="text-[13px] font-bold uppercase text-slate-900 tracking-[0.1em] flex items-center">
                  <ClockIcon className="w-5 h-5 mr-3 text-slate-400" /> Sentinel Activity Log
                </h4>
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                {auditLogs.map((log, index) => {
                  const logLabel = log.type === 'ai' ? 'Sentinel' : (log.type === 'user' ? 'Operator' : 'System');
                  const isLatest = index === 0;
                  const isSuccess = log.action.toLowerCase().includes('successful') || log.action.toLowerCase().includes('concluded');
                  const highlight = isLatest && isSuccess;
                  
                  return (
                    <div key={log.id} className="relative pl-9 pb-2 border-l border-slate-100 last:border-0">
                      <div className={`absolute -left-[6.5px] top-1.5 w-3 h-3 rounded-full ring-[4px] ring-white ${highlight ? 'bg-emerald-500 shadow-md' : 'bg-slate-300'}`}></div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] font-bold text-slate-400 tracking-tight">{log.timestamp}</span>
                          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500`}>{logLabel}</span>
                        </div>
                        <p className={`text-[13px] leading-relaxed ${highlight ? 'text-emerald-600 font-bold' : 'text-slate-600'}`}>
                          {log.action}
                        </p>
                      </div>
                    </div>
                  );
                })}
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
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                  <BeakerIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tighter leading-none">LabChain<span className="text-indigo-600">AI</span></h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Smart Hospital Supply</p>
                </div>
              </div>
              <p className="text-[14px] text-slate-500 leading-relaxed font-medium max-w-md">
                Clinical-grade supply chain intelligence. Powered by the Sentinel Protocol to automate the gap between demand and delivery.
              </p>
            </div>
            <div className="md:col-span-3 space-y-6">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Protocols</h4>
              <ul className="space-y-4 text-[13px] font-medium text-slate-400">
                <li>Audit Integrity</li>
                <li>Sentinel Logic</li>
                <li>Vendor Matrix</li>
              </ul>
            </div>
            <div className="md:col-span-3 space-y-6">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-900">Compliance</h4>
              <ul className="space-y-4 text-[13px] font-medium text-slate-400">
                <li>NABL Certified</li>
                <li>HIPAA Secure</li>
                <li>ISO 9001/13485</li>
              </ul>
            </div>
          </div>
          <div className="pt-16 border-t border-slate-100 mt-16">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">© 2024 LabChain AI. Sentinel Node Active.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
