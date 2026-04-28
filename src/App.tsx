/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  ShieldAlert, 
  Cpu, 
  Activity, 
  Flame, 
  Wind, 
  Lightbulb, 
  Power, 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Info,
  Layers,
  Globe,
  DollarSign,
  Bell,
  Clock,
  User,
  Thermometer,
  Sun,
  Plus,
  X
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from './lib/utils';
import { 
  getSmartMacroSuggestions, 
  getEnergyInsights, 
  SmartRule, 
  EnergyInsight 
} from './services/geminiService';

// --- Mock Data ---
const generateChartData = (range: string = 'Daily') => {
  const points = range === 'Daily' ? 24 : range === 'Weekly' ? 7 : 30;
  return Array.from({ length: points }, (_, i) => ({
    name: range === 'Daily' ? `${i}:00` : range === 'Weekly' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] : `Day ${i+1}`,
    value: Math.floor(Math.random() * 400) + 100,
    previous: Math.floor(Math.random() * 350) + 150,
  }));
};

// --- Components ---

const Sidebar = ({ 
  activeView, 
  setActiveView, 
  zonesCount, 
  alertActive, 
  setZones, 
  addToast,
  metrics,
  isEcoMode,
  setIsEcoMode,
  isSyncing,
  setIsSyncing
}: { 
  activeView: string, 
  setActiveView: (v: string) => void, 
  zonesCount: number, 
  alertActive: boolean,
  setZones: React.Dispatch<React.SetStateAction<any[]>>,
  addToast: (message: string, icon: any) => void,
  metrics: any,
  isEcoMode: boolean,
  setIsEcoMode: (v: boolean) => void,
  isSyncing: boolean,
  setIsSyncing: (v: boolean) => void
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'zones', label: 'Energy Zones', icon: Zap, badge: zonesCount },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'controls', label: 'Manual Control', icon: Power },
    { id: 'safety', label: 'Safety Hub', icon: ShieldAlert, alert: alertActive },
    { id: 'automation', label: 'Automation', icon: Cpu },
    { id: 'events', label: 'System Events', icon: Bell },
    { id: 'settings', label: 'Configuration', icon: Settings },
  ];

  return (
    <aside className="w-80 h-screen bg-white border-r border-olive/10 flex flex-col sticky top-0 z-40 overflow-hidden">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-olive flex items-center justify-center shadow-lg shadow-olive/10">
            <Cpu size={22} className="text-white" />
          </div>
          <div>
            <span className="block font-display font-bold text-xl text-ink leading-none">AETHER.</span>
            <span className="text-[8px] font-black uppercase text-olive tracking-[0.3em]">Mesh OS v2.4</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-6 py-2 space-y-1.5 custom-scrollbar">
        <div className="px-3 mb-4">
          <span className="text-[9px] font-black uppercase text-ink/20 tracking-[0.2em]">Management</span>
        </div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={cn(
              "w-full flex items-center justify-between px-4 py-3.5 rounded-[1.5rem] transition-all group relative",
              activeView === item.id 
                ? "bg-bg-card shadow-sm border border-olive/5 text-ink" 
                : "text-ink/40 hover:bg-bg-card/40 hover:text-ink border border-transparent"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-2 rounded-xl transition-colors",
                activeView === item.id ? "bg-white text-olive shadow-sm" : "group-hover:bg-white group-hover:text-olive"
              )}>
                <item.icon size={18} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-lg bg-olive/10 text-olive text-[8px] font-black">{item.badge}</span>
              )}
              {item.alert && (
                <div className="w-2 h-2 rounded-full bg-danger animate-pulse shadow-sm shadow-danger/20" />
              )}
              <ChevronRight size={14} className={cn("transition-transform", activeView === item.id ? "opacity-100" : "opacity-0 group-hover:opacity-40")} />
            </div>
            {activeView === item.id && (
              <motion.div layoutId="nav-glow" className="absolute inset-0 bg-olive/[0.02] rounded-[1.5rem] pointer-events-none" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-8 border-t border-olive/5 space-y-4">
        <div className="space-y-3">
          <button 
            onClick={() => {
              const anyActive = metrics.activeCount > 0;
              setZones(prev => prev.map(z => {
                const nextActive = !anyActive;
                return { 
                  ...z, 
                  active: nextActive, 
                  status: nextActive ? 'Active' : (z.type === 'HVAC' ? 'Standby' : 'Idle'),
                  startTime: nextActive ? Date.now() : null
                };
              }));
              addToast(
                anyActive ? "Global isolation initiated" : "Full system mesh restoration", 
                anyActive ? Power : Zap
              );
            }}
            className={cn(
              "w-full py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl group relative overflow-hidden",
              metrics.activeCount > 0 ? "bg-ink text-white shadow-ink/20 hover:bg-danger" : "bg-olive text-white shadow-olive/20 hover:bg-sage"
            )}
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Power size={14} className="relative z-10" />
            <span className="relative z-10">{metrics.activeCount > 0 ? 'Master Override' : 'System Restore'}</span>
          </button>
          
          <div className="p-1.5 bg-bg-card rounded-full flex gap-1 border border-olive/5">
            <button 
              onClick={() => {
                setIsEcoMode(!isEcoMode);
                addToast(isEcoMode ? "Eco Mode Deactivated" : "Eco-Optimization Engaged", TrendingUp);
              }}
              className={cn(
                "flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center",
                isEcoMode ? "bg-olive text-white shadow-lg shadow-olive/10" : "text-ink/30 hover:text-ink"
              )}
            >
              <Wind size={12} />
              Eco
            </button>
            <button 
              disabled={isSyncing}
              onClick={() => {
                setIsSyncing(true);
                addToast("Synchronizing system topology...", Layers);
                setTimeout(() => setIsSyncing(false), 2000);
              }}
              className={cn(
                "flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center relative overflow-hidden",
                isSyncing ? "bg-bg-card text-olive cursor-wait" : "text-ink/30 hover:text-ink"
              )}
            >
              {isSyncing && (
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="absolute inset-0 bg-olive/10"
                />
              )}
              <Layers size={12} className={cn(isSyncing && "animate-spin")} />
              {isSyncing ? 'Syncing...' : 'Sync Mesh'}
            </button>
          </div>
        </div>

        <div className="p-6 rounded-[2.5rem] bg-white border border-olive/10 relative overflow-hidden soft-shadow group">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-[9px] font-black uppercase text-ink/20 tracking-widest mb-1 group-hover:text-olive transition-colors">Grid Capacity</div>
              <div className="text-xl font-display font-medium text-olive">{metrics.totalLoad} <span className="text-[10px] opacity-30">kW</span></div>
            </div>
            <div className="relative">
               <div className="w-10 h-10 rounded-full border border-sage/20 flex items-center justify-center">
                 <Activity size={14} className="text-sage/60 animate-pulse" />
               </div>
               <svg className="absolute inset-0 w-10 h-10 -rotate-90">
                 <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="2" className="text-sage/5" />
                 <motion.circle 
                    cx="20" cy="20" r="18" fill="none" stroke="#2D4C3B" strokeWidth="2" 
                    strokeLinecap="round" strokeDasharray="113" 
                    initial={{ strokeDashoffset: 113 }}
                    animate={{ strokeDashoffset: 113 - (parseFloat(metrics.totalLoad) / 2) * 113 }}
                 />
               </svg>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const DashboardView = ({ 
  data, 
  metrics, 
  zones, 
  onZoneSelect,
  isSecurityLocked,
  setIsSecurityLocked,
  onGoToSafety
}: { 
  data: any, 
  metrics: any, 
  zones: any[],
  onZoneSelect: (z: any) => void,
  isSecurityLocked: boolean,
  setIsSecurityLocked: (v: boolean) => void,
  onGoToSafety: () => void
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-10 pb-20"
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      <StatItem label="Current Load" value={`${metrics.totalLoad} kW`} icon={Zap} trend={-metrics.activeCount} />
      <StatItem label="Est. Daily Cost" value={`₹${metrics.dailySpend}`} icon={DollarSign} trend={+12} sub="Mesh optimized" />
      <StatItem label="System Efficiency" value={`${metrics.efficiency}%`} icon={Cpu} sub="Active node health" />
      <StatItem label="Active Nodes" value={metrics.activeCount} icon={Globe} sub="12ms Mesh Latency" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-[4rem] p-10 border border-olive/10 shadow-sm transition-all hover:border-olive/20">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-sm font-bold text-ink uppercase tracking-[0.2em]">Global Mesh Consumption</h3>
              <p className="text-[10px] text-ink/30 font-black uppercase mt-1 tracking-widest">Real-time aggregate load tracing</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-sage/10 text-sage text-[9px] font-black rounded-xl uppercase tracking-widest border border-sage/5">
              <div className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
              Live Feed
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="dashboardGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D4C3B" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2D4C3B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D4C3B10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'rgba(45,76,59,0.3)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'rgba(45,76,59,0.3)' }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-4 rounded-3xl shadow-2xl border border-olive/10 flex flex-col gap-1 ring-8 ring-olive/5">
                          <p className="text-[10px] font-black text-ink/30 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-olive" />
                            <p className="text-xs font-bold text-ink">{Number(payload[0].value)?.toFixed(0)} <span className="opacity-40 italic">Watts</span></p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="#2D4C3B" fillOpacity={1} fill="url(#dashboardGrad)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {zones.slice(0, 2).map((zone) => (
            <div 
              key={zone.id} 
              onClick={() => onZoneSelect(zone)}
              className="bg-bg-card/40 rounded-[3.5rem] p-8 border border-olive/10 group cursor-pointer hover:bg-white transition-all hover:shadow-xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl bg-white shadow-sm transition-transform group-hover:scale-110", zone.color)}>
                  <zone.icon size={22} />
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black uppercase text-ink/20 tracking-widest">Efficiency</div>
                  <div className="text-lg font-display font-medium text-olive">98.4%</div>
                </div>
              </div>
              <h4 className="text-xl font-display font-medium text-ink mb-1">{zone.name}</h4>
              <p className="text-[10px] text-ink/30 font-black uppercase tracking-[0.2em]">{zone.type}</p>
              <div className="mt-6 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-bg-card flex items-center justify-center text-[8px] font-black text-ink/20">
                      {i}
                    </div>
                  ))}
                </div>
                <button className="p-2 rounded-full bg-white text-ink/20 group-hover:text-olive group-hover:bg-olive/10 transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        <div className="p-10 rounded-[4rem] bg-olive text-white shadow-2xl shadow-olive/20 relative overflow-hidden h-full flex flex-col min-h-[500px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
          <ShieldAlert size={140} className="absolute -bottom-10 -right-10 opacity-5" />
          
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-12 opacity-60">System Security</h4>
          <div className="text-4xl font-display font-medium mb-4 italic leading-[1.1]">Mesh <br /> {isSecurityLocked ? 'Protected' : 'Unlocked'}.</div>
          <p className="text-[11px] opacity-60 mb-10 font-medium italic leading-relaxed">Active perimeter tracing engaged. All sensor nodes reporting nominal operations with zero signal drop.</p>
          
          <div className="mt-auto space-y-4">
             <div 
               onClick={() => setIsSecurityLocked(!isSecurityLocked)}
               className="p-5 bg-white/10 rounded-[2rem] border border-white/10 backdrop-blur-sm flex items-center justify-between cursor-pointer group"
             >
               <div className="flex items-center gap-4">
                 <div className="p-2 bg-sage/20 rounded-xl transition-colors group-hover:bg-sage/40">
                   <Globe size={14} />
                 </div>
                 <span className="text-[10px] font-bold uppercase tracking-widest">Global Lock</span>
               </div>
               <div className={cn(
                 "w-10 h-6 rounded-full relative p-1 transition-colors duration-300",
                 isSecurityLocked ? "bg-sage" : "bg-white/20"
               )}>
                 <motion.div 
                   animate={{ x: isSecurityLocked ? 16 : 0 }}
                   className="w-4 h-4 bg-white rounded-full shadow-sm" 
                 />
               </div>
             </div>
             <button 
               onClick={onGoToSafety}
               className="w-full py-5 bg-white text-olive rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:bg-sage hover:text-white transition-all shadow-xl shadow-black/5"
             >
               Configure sentinel
             </button>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

const AnalyticsView = ({ 
  data, 
  zones, 
  metrics, 
  activeRange, 
  onRangeChange,
  onDetailedMap,
  insight,
  isLoading,
  onRefresh
}: { 
  data: any, 
  zones: any[], 
  metrics: any, 
  activeRange: string,
  onRangeChange: (r: string) => void,
  onDetailedMap: () => void,
  insight: EnergyInsight | null,
  isLoading: boolean,
  onRefresh: () => void
}) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    className="space-y-10 pb-20"
  >
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-4xl font-display font-medium text-ink leading-none mb-3">Mesh Analytics</h2>
        <p className="text-[10px] text-ink/30 font-black uppercase tracking-[0.3em]">Advanced topological load research</p>
      </div>
      <div className="flex items-center gap-4">
        {isLoading && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}><Cpu size={16} className="text-olive" /></motion.div>}
        <div className="flex gap-2 p-1.5 bg-bg-card rounded-[2rem] border border-olive/5">
          {['Day', 'Week', 'Month', 'Year'].map(t => (
            <button 
              key={t} 
              onClick={() => onRangeChange(t)}
              className={cn(
                "px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all", 
                activeRange === t ? "bg-white text-olive shadow-sm" : "text-ink/30 hover:text-ink"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white rounded-[4rem] p-12 border border-olive/10 soft-shadow">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-sage/10 rounded-2xl">
              <TrendingUp size={24} className="text-olive" />
            </div>
            <div>
               <h3 className="text-sm font-bold text-ink uppercase tracking-widest">Thermal Dissipation Map</h3>
               <p className="text-[9px] text-ink/20 font-black uppercase mt-0.5 tracking-widest">Aggregate node stress test</p>
            </div>
          </div>
          <div className="text-right">
             <div className="text-[8px] font-black text-ink/20 uppercase tracking-widest">Stability Index</div>
             <div className="text-xl font-display font-medium text-olive">0.982 <span className="text-xs opacity-40">σ</span></div>
          </div>
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="analysisGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#606C38" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#606C38" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#606C3810" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'rgba(96,108,56,0.3)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: 'rgba(96,108,56,0.3)' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '32px', border: 'none', boxShadow: '0 20px 50px rgba(45,76,59,0.1)', padding: '20px' }}
                itemStyle={{ color: '#2D4C3B', fontWeight: 900, fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="value" stroke="#606C38" fillOpacity={1} fill="url(#analysisGrad)" strokeWidth={5} />
              <Area type="monotone" dataKey="previous" stroke="#D9D9D9" fillOpacity={0} strokeWidth={2} strokeDasharray="10 10" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-bg-card/40 rounded-[3.5rem] p-10 border border-olive/10 h-full flex flex-col items-center justify-center text-center relative overflow-hidden">
           {isLoading && (
             <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }}>
                  <Cpu size={40} className="text-olive" />
                </motion.div>
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-olive">AI Synthesizing...</p>
             </div>
           )}
           
           {!insight && !isLoading ? (
             <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-olive/5 rounded-full flex items-center justify-center mb-6">
                  <Activity size={24} className="text-olive" />
                </div>
                <h4 className="text-lg font-display font-medium text-ink mb-2 italic">No Insights Yet</h4>
                <p className="text-[11px] text-ink/40 italic px-6 mb-6">Start analysis to get AI-powered recommendations.</p>
                <button 
                  onClick={onRefresh}
                  className="px-8 py-3 bg-olive text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-olive/10 transition-all hover:scale-105"
                >
                  Analyze System
                </button>
             </div>
           ) : (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="h-full flex flex-col"
             >
                <div className="w-12 h-12 bg-olive rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-olive/20 mx-auto">
                  <Zap size={20} className="text-white" />
                </div>
                <h4 className="text-lg font-display font-medium text-ink mb-2 italic">Gemini Insights</h4>
                <div className="text-[10px] text-ink/50 italic leading-relaxed text-left mb-6 bg-white/40 p-4 rounded-2xl border border-olive/5">
                  {insight?.analysis}
                </div>
                <div className="space-y-3 text-left">
                  {insight?.recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-4 h-4 rounded-full bg-olive/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Plus size={8} className="text-olive" />
                      </div>
                      <p className="text-[9px] font-bold text-ink/60 italic">{rec}</p>
                    </div>
                  ))}
                </div>
                <button 
                   onClick={onRefresh}
                   className="mt-auto px-8 py-3 text-olive border border-olive/10 rounded-full text-[9px] font-black uppercase tracking-widest transition-all hover:bg-olive/5"
                >
                   Refresh Analysis
                </button>
             </motion.div>
           )}
        </div>
      </div>
    </div>
  </motion.div>
);

const AutomationView = ({ 
  zones, 
  addToast, 
  onToggleRule, 
  onNewMacro, 
  onGlobalTrigger,
  onAiOptimize,
  isLoading,
  suggestions,
  onDeployAiRule
}: { 
  zones: any[], 
  addToast: any, 
  onToggleRule: (zoneId: string, ruleIndex: number) => void,
  onNewMacro: () => void,
  onGlobalTrigger: () => void,
  onAiOptimize: () => void,
  isLoading: boolean,
  suggestions: SmartRule[],
  onDeployAiRule: (text: string) => void
}) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="space-y-10 pb-20"
  >
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-4xl font-display font-medium text-ink leading-none mb-3">Automation Hub</h2>
        <p className="text-[10px] text-ink/30 font-black uppercase tracking-[0.3em]">Decentralized trigger propagation</p>
      </div>
      <div className="flex gap-4">
        <button 
          onClick={onAiOptimize}
          disabled={isLoading}
          className={cn(
            "px-8 py-4 bg-white border border-olive/10 text-olive rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-olive/5 hover:bg-olive hover:text-white transition-all flex items-center gap-3",
            isLoading && "opacity-50 cursor-wait"
          )}
        >
          {isLoading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
              <Cpu size={16} />
            </motion.div>
          ) : (
            <Zap size={16} />
          )}
          AI Optimize
        </button>
        <button 
          onClick={onNewMacro}
          className="px-8 py-4 bg-ink text-white rounded-[2rem] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-ink/20 hover:bg-olive transition-all flex items-center gap-3"
        >
          <Plus size={16} />
          New Macro
        </button>
      </div>
    </div>

    {suggestions.length > 0 && (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-olive p-10 rounded-[4rem] text-white overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
             <div className="p-3 bg-white/10 rounded-2xl">
               <Cpu size={24} />
             </div>
             <div>
                <h3 className="text-xl font-display font-medium italic">Aether AI Insights</h3>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Synthesized Macro Proposals</p>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suggestions.map((suggestion, i) => (
              <div key={i} className="p-6 bg-white/10 border border-white/10 rounded-[2.5rem] backdrop-blur-sm flex flex-col justify-between group">
                <div>
                  <div className="text-[11px] font-black text-white/40 uppercase tracking-widest mb-3">Protocol Prop {i+1}</div>
                  <h4 className="text-sm font-bold italic mb-2">"{suggestion.text}"</h4>
                  <p className="text-[9px] opacity-60 italic leading-relaxed">{suggestion.reason}</p>
                </div>
                <button 
                  onClick={() => onDeployAiRule(suggestion.text)}
                  className="mt-6 w-full py-3 bg-white text-olive rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-sage hover:text-white transition-all"
                >
                  Apply Rule
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {/* ... zone mapping ... */}
      {zones.map(zone => (
        <div key={zone.id} className="bg-white rounded-[4rem] p-10 border border-olive/10 soft-shadow group">
          <div className="flex items-center gap-5 mb-10">
            <div className={cn("p-5 rounded-3xl bg-bg-card shadow-sm transition-all group-hover:scale-110", zone.color)}>
              <zone.icon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-display font-medium text-ink italic">{zone.name}</h3>
              <p className="text-[9px] text-ink/20 font-black uppercase tracking-widest mt-0.5">{zone.rules.length} Active Protocols</p>
            </div>
          </div>
          
          <div className="space-y-4 mb-10">
            {zone.rules.map((rule: any, i: number) => (
              <div key={i} className="p-5 bg-bg-card/50 rounded-[2rem] border border-transparent hover:border-olive/10 transition-all group/rule flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn("w-1.5 h-1.5 rounded-full shadow-sm transition-colors", rule.active ? "bg-sage" : "bg-ink/10")} />
                  <span className={cn("text-[11px] font-bold italic transition-all", rule.active ? "text-ink/70 opacity-80 group-hover/rule:opacity-100" : "text-ink/20 line-through")}>
                    {rule.text}
                  </span>
                </div>
                <div 
                  onClick={() => onToggleRule(zone.id, i)}
                  className={cn("w-8 h-4 rounded-full relative p-0.5 cursor-pointer transition-colors", rule.active ? "bg-sage/20" : "bg-ink/5")}
                >
                  <motion.div 
                    animate={{ x: rule.active ? 16 : 0 }}
                    className={cn("w-3 h-3 rounded-full shadow-sm transition-colors", rule.active ? "bg-sage" : "bg-ink/20")} 
                  />
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => addToast(`Re-deploying protocols for ${zone.name}`, Cpu)}
            className="w-full py-5 border border-olive/5 bg-bg-card/30 rounded-[2rem] text-[9px] font-black uppercase tracking-widest text-ink/30 hover:bg-olive hover:text-white transition-all flex items-center justify-center gap-3"
          >
            <Cpu size={14} />
            Deploy Protocol
          </button>
        </div>
      ))}

      <div 
        onClick={onGlobalTrigger}
        className="bg-bg-card/30 rounded-[4rem] border-2 border-dashed border-olive/10 flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-olive/30 transition-all"
      >
         <div className="p-8 bg-white/50 rounded-full mb-6 group-hover:scale-110 transition-transform shadow-xl shadow-black/5">
            <Plus size={32} className="text-ink/10 group-hover:text-olive transition-colors" />
         </div>
         <h4 className="text-xl font-display font-medium text-ink/20 group-hover:text-ink/40 transition-colors uppercase tracking-widest">Global Trigger</h4>
      </div>
    </div>
  </motion.div>
);


const StatItem = ({ label, value, sub, icon: Icon, trend }: any) => (
  <div className="p-8 rounded-[2.5rem] bg-white border border-olive/10 shadow-sm transition-all hover:soft-shadow">
    <div className="flex justify-between items-start mb-6">
      <div className="p-3 rounded-2xl bg-bg-card text-sage shadow-sm border border-olive/5">
        <Icon size={24} />
      </div>
      {trend !== undefined && (
        <span className={cn("text-[10px] px-2 py-1 rounded-full font-black uppercase tracking-widest", trend > 0 ? "bg-clay/10 text-clay" : "bg-sage/10 text-sage")}>
          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <div className="text-3xl font-display font-medium text-olive mb-1 leading-none">{value}</div>
    <div className="text-[10px] text-ink/30 uppercase font-black tracking-[0.2em]">{label}</div>
    {sub && <div className="text-[10px] text-ink/20 mt-2 font-bold uppercase tracking-widest">{sub}</div>}
  </div>
);

const useAudioAlert = (active: boolean) => {
  useEffect(() => {
    if (!active) return;

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);

    const interval = setInterval(() => {
      const g = audioCtx.createGain();
      const o = audioCtx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(880, audioCtx.currentTime);
      o.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);
      g.gain.setValueAtTime(0.1, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      o.stop(audioCtx.currentTime + 0.5);
    }, 1000);

    return () => {
      clearInterval(interval);
      audioCtx.close();
    };
  }, [active]);
};

// --- Components ---

const SafetyAlertOverlay = ({ type, message, onDismiss }: { type: 'fire' | 'gas', message: string, onDismiss: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-red-950/40 backdrop-blur-md"
  >
    <motion.div 
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      className="max-w-md w-full bg-white rounded-[3rem] p-8 shadow-2xl border-4 border-danger relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-danger/5 animate-pulse" />
      <div className="relative z-10 text-center">
        <div className="w-20 h-20 bg-danger rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-danger/20">
          {type === 'fire' ? <Flame size={40} className="text-white" /> : <ShieldAlert size={40} className="text-white" />}
        </div>
        <h2 className="text-3xl font-display font-bold text-ink mb-2 uppercase tracking-tighter">Critical Alert</h2>
        <p className="text-danger font-black text-xs uppercase tracking-[0.2em] mb-4">{type === 'fire' ? 'Flame Detected' : 'Gas Leak Detected'}</p>
        
        <div className="p-4 bg-bg-card rounded-2xl mb-8 border border-olive/10">
          <p className="text-sm text-ink/70 leading-relaxed font-medium">
            {message}
          </p>
        </div>

        <div className="space-y-3">
          <button 
            onClick={onDismiss}
            className="w-full py-4 bg-danger text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-danger/30 hover:bg-red-700 transition-all"
          >
            Acknowledge & Mute
          </button>
          <div className="text-[10px] text-ink/30 font-black uppercase tracking-widest">
            Aether is executing emergency shut-off protocol...
          </div>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// --- Main App ---

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isEcoMode, setIsEcoMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSecurityLocked, setIsSecurityLocked] = useState(true);
  const [isFlame, setIsFlame] = useState(false);
  const [gasLevel, setGasLevel] = useState(120);
  const [showOverlay, setShowOverlay] = useState<null | 'fire' | 'gas'>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [zones, setZones] = useState([
    { 
      id: 'lr-lights', 
      name: 'Living Room', 
      type: 'Lights', 
      icon: Lightbulb, 
      active: true, 
      status: 'Active',
      nominalConsumption: 45, // W
      color: 'text-clay',
      dailyAvg: '1.2 kWh',
      rules: [{ text: 'Dim at 10 PM', active: true }, { text: 'Auto-off if unoccupied > 15m', active: true }],
      history: [30, 45, 20, 60, 45, 50, 45],
      historyPrev: [25, 40, 30, 55, 40, 45, 40],
      lastOptimized: '2h ago',
      startTime: Date.now() - 3600000 // 1h ago
    },
    { 
      id: 'kitchen-app', 
      name: 'Kitchen', 
      type: 'Appliance', 
      icon: Zap, 
      active: true, 
      status: 'Active',
      nominalConsumption: 1200, // W
      color: 'text-olive',
      dailyAvg: '4.8 kWh',
      rules: [{ text: 'Heater priority off during peak', active: true }, { text: 'Standby isolation', active: false }],
      history: [1200, 1100, 1300, 1200, 1250, 1200, 1200],
      historyPrev: [1100, 1050, 1200, 1150, 1100, 1150, 1100],
      lastOptimized: '4h ago',
      startTime: Date.now() - 15735000 // approx 4.3h ago
    },
    { 
      id: 'hvac', 
      name: 'Thermostat', 
      type: 'HVAC', 
      icon: Wind, 
      active: false, 
      status: 'Standby',
      nominalConsumption: 800, // W
      color: 'text-sage',
      dailyAvg: '8.4 kWh',
      rules: [{ text: 'Maintain 22°C', active: true }, { text: 'Humidity exhaust over 60%', active: true }],
      history: [200, 150, 250, 200, 220, 210, 200],
      historyPrev: [180, 140, 230, 190, 210, 200, 190],
      lastOptimized: 'Just now',
      startTime: null
    },
    { 
      id: 'tv-unit', 
      name: 'Media Unit', 
      type: 'Samsung TV', 
      icon: Activity, 
      active: false, 
      status: 'Idle',
      nominalConsumption: 150, // W
      color: 'text-ink',
      dailyAvg: '0.9 kWh',
      rules: [{ text: 'Master switch off after 1 AM', active: false }, { text: 'Child lock enabled', active: true }],
      history: [0, 50, 10, 0, 0, 40, 0],
      historyPrev: [0, 60, 20, 0, 0, 30, 0],
      lastOptimized: '6h ago',
      startTime: null
    }
  ]);

  // Derived Stats
  const systemMetrics = useMemo(() => {
    const activeNodes = zones.filter(z => z.active);
    const totalLoad = activeNodes.reduce((acc, z) => {
      let consumption = z.nominalConsumption;
      if (isEcoMode && z.active) consumption *= 0.7; // 30% reduction in eco mode
      return acc + consumption;
    }, 0);

    const activeCount = activeNodes.length;
    const efficiency = activeCount > 0 ? (98.5 - (activeCount * 0.4)).toFixed(1) : '100';
    const dailySpend = (totalLoad * 0.024 * 7.5).toFixed(2); // Mock calculation

    return {
      totalLoad: (totalLoad / 1000).toFixed(2), // kW
      activeCount,
      efficiency,
      dailySpend
    };
  }, [zones, isEcoMode]);

  const [data, setData] = useState(generateChartData());

  const fetchAiSuggestions = async () => {
    setIsAiLoading(true);
    addToast("Consulting Mesh Intelligence...", Cpu);
    const suggestions = await getSmartMacroSuggestions(zones);
    setAiSuggestions(suggestions);
    setIsAiLoading(false);
  };

  const fetchEnergyInsights = async () => {
    setIsInsightLoading(true);
    const insights = await getEnergyInsights(systemMetrics, zones);
    setEnergyInsight(insights);
    setIsInsightLoading(false);
  };

  useEffect(() => {
    if (activeView === 'analytics' && !energyInsight && !isInsightLoading) {
      fetchEnergyInsights();
    }
  }, [activeView]);

  const [selectedZone, setSelectedZone] = useState<null | typeof zones[0]>(null);
  const [analyticsRange, setAnalyticsRange] = useState('Week');
  const [aiSuggestions, setAiSuggestions] = useState<SmartRule[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [energyInsight, setEnergyInsight] = useState<EnergyInsight | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [zoneRange, setZoneRange] = useState('Daily');
  const [isComparing, setIsComparing] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string; icon: any }[]>([]);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);
  const [newRule, setNewRule] = useState({ condition: 'Time of Day', action: 'Turn Off', value: '' });

  const addToast = (message: string, icon: any) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [{ id, message, icon }, ...prev].slice(0, 3));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addAutomationRule = () => {
    if (!selectedZone) return;
    const ruleText = `${newRule.action}${newRule.value ? ' (' + newRule.value + ')' : ''} if ${newRule.condition}`;
    const ruleObj = { text: ruleText, active: true };
    setZones(prev => prev.map(z => {
      if (z.id === selectedZone.id) {
        return { ...z, rules: [...z.rules, ruleObj] };
      }
      return z;
    }));
    // Update local selectedZone so UI refreshes immediately
    setSelectedZone(prev => prev ? { ...prev, rules: [...prev.rules, ruleObj] } : null);
    addToast("Automation rule deployed to mesh", Cpu);
    setShowRuleBuilder(false);
  };

  const toggleRule = (zoneId: string, ruleIndex: number) => {
    setZones(prev => prev.map(z => {
      if (z.id === zoneId) {
        const newRules = [...z.rules];
        newRules[ruleIndex] = { ...newRules[ruleIndex], active: !newRules[ruleIndex].active };
        addToast(
          `Protocol ${newRules[ruleIndex].active ? 'engaged' : 'suspended'} for ${z.name}`,
          newRules[ruleIndex].active ? Cpu : ShieldAlert
        );
        return { ...z, rules: newRules };
      }
      return z;
    }));
  };

  const toggleZone = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setZones(prev => prev.map(zone => {
      if (zone.id === id) {
        const nextActive = !zone.active;
        addToast(
          `${zone.name} node ${nextActive ? 'activated' : 'isolated'}`,
          nextActive ? Zap : Power
        );
        return { 
          ...zone, 
          active: nextActive, 
          status: nextActive ? 'Active' : (zone.type === 'HVAC' ? 'Standby' : 'Idle'),
          startTime: nextActive ? Date.now() : null
        };
      }
      return zone;
    }));
  };

  useAudioAlert(!!showOverlay && !isMuted);

  useEffect(() => {
    const interval = setInterval(() => {
      setGasLevel(prev => {
        const next = Math.max(100, Math.min(450, prev + (Math.random() * 30 - 10)));
        if (next > 350 && !showOverlay) setShowOverlay('gas');
        else if (next <= 350 && showOverlay === 'gas') setShowOverlay(null);
        return next;
      });

      if (Math.random() > 0.95) {
        setIsFlame(true);
        setShowOverlay('fire');
      } else if (Math.random() < 0.2) {
        setIsFlame(false);
        if (showOverlay === 'fire') setShowOverlay(null);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [showOverlay]);

  return (
    <div className="flex min-h-screen bg-bg-base relative">
      <div className="fixed bottom-8 right-8 z-[110] space-y-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-white border border-olive/10 rounded-2xl p-4 shadow-xl soft-shadow min-w-[280px] flex items-center gap-4 pointer-events-auto overflow-hidden relative group/toast"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-olive animate-pulse" />
              <div className="p-2 rounded-xl bg-sage/10 text-olive">
                <toast.icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-ink/30 tracking-widest mb-0.5">Command Dispatched</p>
                <p className="text-xs font-bold text-ink italic">{toast.message}</p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-bg-card rounded-lg text-ink/20 hover:text-ink transition-colors"
                title="Dismiss"
              >
                <Power size={14} className="rotate-45" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        zonesCount={zones.length} 
        alertActive={!!showOverlay} 
        setZones={setZones}
        addToast={addToast}
        metrics={systemMetrics}
        isEcoMode={isEcoMode}
        setIsEcoMode={setIsEcoMode}
        isSyncing={isSyncing}
        setIsSyncing={setIsSyncing}
      />
      
      <main className="flex-1 p-12 overflow-y-auto">
        <AnimatePresence>
          {showOverlay && (
            <SafetyAlertOverlay 
              type={showOverlay} 
              onDismiss={() => {
                setIsMuted(true);
                setShowOverlay(null);
                setIsFlame(false);
                setGasLevel(120);
                addToast("Safety alert acknowledged", ShieldAlert);
              }}
              message={showOverlay === 'fire' 
                ? "IR Sensors detected primary flame source in Zone 4 (Kitchen). Solenoid valve #01 has been locked and kitchen HVAC initialized at max capacity."
                : `LPG concentration has reached ${gasLevel.toFixed(0)}ppm. This exceeds the 300ppm safety threshold. All secondary electrical nodes have been isolated.`
              } 
            />
          )}

          {selectedZone && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink/20 backdrop-blur-sm"
              onClick={() => setSelectedZone(null)}
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="max-w-4xl w-full bg-white rounded-[4rem] p-8 md:p-12 shadow-2xl relative border border-olive/10 max-h-[90vh] overflow-y-auto no-scrollbar"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-12">
                  <div className="flex items-center gap-6">
                    <div className={cn("p-6 rounded-3xl bg-bg-card shadow-sm relative group", selectedZone.color)}>
                      <selectedZone.icon size={32} />
                      {selectedZone.active && isEcoMode && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-sage flex items-center justify-center border-4 border-white"
                        >
                          <Wind size={10} className="text-white" />
                        </motion.div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-3xl font-display font-medium text-ink leading-none mb-2">{selectedZone.name}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] font-bold text-ink/30 uppercase tracking-[0.2em]">{selectedZone.type}</p>
                        <span className="w-1 h-1 rounded-full bg-ink/20" />
                        <p className={cn(
                          "text-[10px] font-bold uppercase tracking-[0.2em]",
                          selectedZone.active ? "text-sage" : "text-ink/30"
                        )}>{selectedZone.status}</p>
                        {selectedZone.active && isEcoMode && (
                           <>
                             <span className="w-1 h-1 rounded-full bg-sage/20" />
                             <p className="text-[10px] font-bold text-sage uppercase tracking-[0.2em]">Efficiency Protocol 01</p>
                           </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleZone(selectedZone.id)}
                    className={cn(
                      "group relative overflow-hidden px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                      selectedZone.active ? "bg-olive text-white shadow-xl shadow-olive/10" : "bg-bg-card text-ink/40"
                    )}
                  >
                    <span className="relative z-10">{selectedZone.active ? 'Isolate Node' : 'Initialize Node'}</span>
                    {selectedZone.active && (
                       <motion.div 
                         initial={{ x: '-100%' }}
                         animate={{ x: '100%' }}
                         transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                         className="absolute inset-0 bg-white/10 skew-x-12"
                       />
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-[10px] font-black uppercase text-ink/20 tracking-widest">Thermal Load Profile</h4>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setIsComparing(!isComparing)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all",
                            isComparing ? "bg-olive text-white shadow-md shadow-olive/10" : "bg-bg-card/50 text-ink/30 hover:text-ink"
                          )}
                        >
                          <Activity size={10} />
                          {isComparing ? 'Comparing' : 'Compare'}
                        </button>
                        <div className="flex gap-2 bg-bg-card/50 p-1 rounded-full">
                          {['Daily', 'Weekly', 'Monthly'].map(r => (
                            <button 
                              key={r}
                              onClick={() => {
                            setZoneRange(r);
                            setData(generateChartData(r));
                          }}
                              className={cn(
                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all",
                                zoneRange === r ? "bg-white text-olive shadow-sm" : "text-ink/30 hover:text-ink"
                              )}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="h-64 w-full bg-bg-card/10 rounded-[3rem] p-8 relative overflow-hidden border border-olive/5">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                          <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2D4C3B" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#2D4C3B" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#D9D9D9" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#D9D9D9" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#31332908" />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white p-4 rounded-2xl shadow-xl border border-olive/10 flex flex-col gap-1">
                                    <p className="text-[10px] font-black text-ink/30 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                                    <div className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-olive" />
                                      <p className="text-xs font-bold text-ink">Current: {Number(payload[0].value ?? 0).toFixed(0)}W</p>
                                    </div>
                                    {isComparing && payload[1] && (
                                      <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-ink/10" />
                                        <p className="text-xs font-bold text-ink/40">Previous: {Number(payload[1].value ?? 0).toFixed(0)}W</p>
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#2D4C3B" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorVal)" 
                            animationDuration={1500}
                          />
                          {isComparing && (
                            <Area 
                              type="monotone" 
                              dataKey="previous" 
                              stroke="#D9D9D9" 
                              strokeWidth={2}
                              strokeDasharray="5 5"
                              fillOpacity={1} 
                              fill="url(#colorPrev)" 
                              animationDuration={1500}
                            />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className="absolute top-4 left-8 pointer-events-none">
                        <span className="text-[9px] font-black text-ink/10 uppercase tracking-[0.2em]">Live Topology Trace</span>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-between">
                      <div>
                        <div className="text-[8px] font-black text-ink/20 uppercase tracking-widest">Range Average</div>
                        <div className="text-lg font-display font-medium text-olive">{selectedZone.dailyAvg}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[8px] font-black text-ink/20 uppercase tracking-widest">Sync Integrity</div>
                        <div className="text-lg font-display font-medium text-sage">Perfect</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8 border-t lg:border-t-0 lg:border-l border-olive/5 pt-12 lg:pt-0 lg:pl-12">
                    <div className="space-y-6">
                       <div className="flex justify-between items-center">
                          <h4 className="text-[10px] font-black uppercase text-ink/20 tracking-widest">Applied Logic Rules</h4>
                        <button 
                          onClick={() => setShowRuleBuilder(!showRuleBuilder)}
                          className="p-2 rounded-xl bg-bg-card hover:bg-olive hover:text-white transition-all text-ink/40"
                        >
                          {showRuleBuilder ? <X size={14} /> : <Plus size={14} />}
                        </button>
                     </div>
                     
                     <AnimatePresence>
                       {showRuleBuilder && (
                         <motion.div 
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           exit={{ opacity: 0, height: 0 }}
                           className="p-6 bg-bg-card/50 rounded-[2.5rem] border border-olive/10 space-y-4 overflow-hidden"
                         >
                           <div className="grid grid-cols-2 gap-4 text-center">
                             <div>
                               <label className="text-[8px] font-black uppercase text-ink/30 mb-2 block tracking-widest">When</label>
                               <div className="flex flex-wrap gap-2 justify-center">
                                 {['Time', 'Motion', 'Temp'].map(c => (
                                   <button 
                                     key={c}
                                     onClick={() => setNewRule({ ...newRule, condition: c })}
                                     className={cn(
                                       "px-3 py-1.5 rounded-full text-[9px] font-bold transition-all border",
                                       newRule.condition === c ? "bg-olive text-white border-olive" : "bg-white text-ink/30 border-olive/5"
                                     )}
                                   >
                                     {c}
                                   </button>
                                 ))}
                               </div>
                             </div>
                             <div>
                               <label className="text-[8px] font-black uppercase text-ink/30 mb-2 block tracking-widest">Action</label>
                               <div className="flex flex-wrap gap-2 justify-center">
                                 {['On', 'Off', 'Dim'].map(a => (
                                   <button 
                                     key={a}
                                     onClick={() => setNewRule({ ...newRule, action: a })}
                                     className={cn(
                                       "px-3 py-1.5 rounded-full text-[9px] font-bold transition-all border",
                                       newRule.action === a ? "bg-olive text-white border-olive" : "bg-white text-ink/30 border-olive/5"
                                     )}
                                   >
                                     {a}
                                   </button>
                                 ))}
                               </div>
                             </div>
                           </div>
                           
                           <button 
                             onClick={addAutomationRule}
                             className="w-full py-3 bg-ink text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all hover:bg-olive"
                           >
                             Deploy Logic Rule
                           </button>
                         </motion.div>
                       )}
                     </AnimatePresence>

                     <div className="space-y-3">
                       {selectedZone.rules.map((rule: any, i: number) => (
                         <div key={i} className="p-4 bg-bg-base border border-olive/5 rounded-2xl text-[11px] font-bold text-ink/70 flex items-center justify-between italic">
                           <div className="flex items-center gap-4">
                             <div className={cn("w-1.5 h-1.5 rounded-full transition-colors", rule.active ? "bg-sage" : "bg-ink/10")} />
                             {rule.text}
                           </div>
                           <button 
                             onClick={() => {
                               const updatedRules = selectedZone.rules.filter((_: any, idx: number) => idx !== i);
                               setZones(prev => prev.map(z => z.id === selectedZone.id ? { ...z, rules: updatedRules } : z));
                               setSelectedZone({ ...selectedZone, rules: updatedRules });
                               addToast("Rule purged from mesh", AlertTriangle);
                             }}
                             className="text-ink/10 hover:text-danger p-1 transition-all"
                           >
                             <X size={12} />
                           </button>
                         </div>
                       ))}
                     </div>
                  </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && (
            <DashboardView 
              data={data} 
              metrics={systemMetrics} 
              zones={zones} 
              onZoneSelect={(zone) => {
                setSelectedZone(zone);
                setActiveView('zones');
              }}
              isSecurityLocked={isSecurityLocked}
              setIsSecurityLocked={setIsSecurityLocked}
              onGoToSafety={() => setActiveView('safety')}
            />
          )}

          {activeView === 'zones' && (
            <motion.div 
              key="zones"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-12 pb-20"
            >
              <div>
                <h2 className="text-3xl font-display font-medium text-olive mb-2 italic">Energy Topology</h2>
                <p className="text-[10px] text-ink/30 font-black uppercase tracking-[0.3em] mb-10">Spatial load mapping across the mesh</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {zones.map((zone) => (
                    <div 
                      key={zone.id}
                      onClick={() => setSelectedZone(zone)}
                      className={cn(
                        "p-8 rounded-[3.5rem] border transition-all cursor-pointer flex flex-col justify-between group h-64",
                        zone.active ? "bg-white border-olive/10 soft-shadow" : "bg-bg-card/30 border-transparent opacity-60"
                      )}
                    >
                      <div className="flex justify-between items-start">
                          <div className={cn("p-5 rounded-2xl bg-bg-card/50 shadow-sm transition-transform group-hover:scale-110", zone.active ? zone.color : "text-ink/20")}>
                            <zone.icon size={28} />
                          </div>
                          <div 
                            onClick={(e) => toggleZone(zone.id, e)}
                            className={cn(
                              "w-12 h-6 rounded-full flex items-center px-1 transition-colors",
                              zone.active ? "bg-olive/10" : "bg-ink/5"
                            )}
                          >
                            <motion.div 
                              animate={{ x: zone.active ? 24 : 0 }}
                              className={cn("w-4 h-4 rounded-full shadow-md", zone.active ? "bg-olive" : "bg-ink/20")} 
                            />
                          </div>
                      </div>
                      
                      <div>
                          <div className="text-[10px] text-ink/50 font-black tracking-[0.2em] uppercase flex items-center gap-2 mb-1">
                            {zone.name}
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              zone.status === 'Active' ? "bg-sage animate-pulse" : 
                              zone.status === 'Standby' ? "bg-clay" : "bg-ink/10"
                            )} />
                          </div>
                          <div className="text-2xl font-display font-medium text-ink flex items-baseline gap-2">
                            {zone.active ? `${zone.nominalConsumption}W` : zone.status}
                            <span className="text-[10px] text-ink/30 font-black uppercase tracking-widest">{zone.type}</span>
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeView === 'analytics' && (
            <AnalyticsView 
              data={data} 
              zones={zones} 
              metrics={systemMetrics} 
              activeRange={analyticsRange}
              onRangeChange={(range) => {
                setAnalyticsRange(range);
                setData(generateChartData(range));
              }}
              onDetailedMap={() => setActiveView('zones')}
              insight={energyInsight}
              isLoading={isInsightLoading}
              onRefresh={fetchEnergyInsights}
            />
          )}

          {activeView === 'automation' && (
            <AutomationView 
              zones={zones} 
              addToast={addToast} 
              onToggleRule={toggleRule} 
              onNewMacro={() => {
                setSelectedZone(zones[0]);
                setShowRuleBuilder(true);
                addToast("Macro drafting system initialized", Plus);
              }}
              onGlobalTrigger={() => {
                setSelectedZone(zones[0]);
                setShowRuleBuilder(true);
                addToast("Global trigger matrix mapping initiated", Globe);
              }}
              onAiOptimize={fetchAiSuggestions}
              isLoading={isAiLoading}
              suggestions={aiSuggestions}
              onDeployAiRule={(text) => {
                const ruleObj = { text, active: true };
                setZones(prev => prev.map(z => z.id === zones[0].id ? { ...z, rules: [...z.rules, ruleObj] } : z));
                addToast("AI Protocol deployed to Living Room", Zap);
                setAiSuggestions(prev => prev.filter(s => s.text !== text));
              }}
            />
          )}

          {activeView === 'controls' && (
            <ManualControlView zones={zones} toggleZone={toggleZone} setZones={setZones} addToast={addToast} />
          )}

          {activeView === 'safety' && (
            <SafetyHubView gasLevel={gasLevel} isFlame={isFlame} />
          )}

          {activeView === 'events' && (
            <EventsView />
          )}

          {activeView === 'settings' && (
            <SettingsView />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

const ActiveTimeDisplay = ({ startTime }: { startTime: number }) => {
  const [elapsed, setElapsed] = useState(Date.now() - startTime);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return <div className="text-xs font-mono font-bold text-olive">{formatTime(elapsed)}</div>;
};

const ManualControlView = ({ zones, toggleZone, setZones, addToast }: any) => (
  <motion.div 
    key="controls"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-4xl space-y-12 pb-20"
  >
    <div className="flex justify-between items-end">
      <div>
        <h2 className="text-3xl font-display font-medium text-ink mb-2 italic">Manual Override Hub</h2>
        <p className="text-[10px] text-ink/30 font-black uppercase tracking-widest leading-relaxed">Direct node interruption. Bypasses predictive schedules.</p>
      </div>
      <div className="flex gap-4">
        <button 
          onClick={() => {
            setZones((z: any[]) => z.map(x => ({ 
              ...x, 
              active: false, 
              status: x.type === 'HVAC' ? 'Standby' : 'Idle',
              startTime: null
            })));
            addToast("Global safety isolation enforced", ShieldAlert);
          }} 
          className="px-6 py-2 rounded-xl bg-ink/5 text-ink/40 text-[10px] font-black uppercase tracking-widest hover:bg-danger/10 hover:text-danger transition-all"
        >
          Kill All Nodes
        </button>
      </div>
    </div>

    <div className="bg-white rounded-[4rem] border border-olive/10 divide-y divide-olive/5 overflow-hidden shadow-sm">
      {zones.map((zone: any) => (
        <div key={zone.id} className="p-8 flex items-center justify-between hover:bg-bg-card/30 transition-colors">
          <div className="flex items-center gap-6">
            <div className={cn("p-4 rounded-2xl bg-bg-card font-bold", zone.active ? zone.color : "text-ink/10")}>
              <zone.icon size={24} />
            </div>
            <div>
              <h4 className="font-bold text-ink leading-none mb-2">{zone.name}</h4>
              <p className="text-[10px] text-ink/30 font-black uppercase tracking-widest">{zone.type} • {zone.active ? 'Consuming ' + zone.nominalConsumption + 'W' : 'Dormant'}</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            {zone.active && zone.startTime && (
              <div className="text-right hidden md:block">
                <div className="text-[8px] font-black text-olive/30 uppercase tracking-widest">Active Time</div>
                <ActiveTimeDisplay startTime={zone.startTime} />
              </div>
            )}
            <button 
              onClick={(e) => toggleZone(zone.id, e)}
              className={cn(
                "px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border group relative overflow-hidden",
                zone.active 
                  ? "bg-olive text-white border-olive shadow-lg shadow-olive/10" 
                  : "bg-white text-ink/30 border-olive/10 hover:border-olive/30"
              )}
            >
              <motion.span 
                key={zone.active ? 'active' : 'inactive'}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative z-10 flex items-center gap-2"
              >
                {zone.active ? <Activity size={12} className="animate-pulse" /> : <Power size={12} />}
                {zone.active ? 'Active' : 'Offline'}
              </motion.span>
              {zone.active && (
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute inset-0 bg-white/10 skew-x-12"
                />
              )}
            </button>
          </div>
        </div>
      ))}
    </div>

    <div className="p-10 rounded-[3rem] bg-sage/5 border border-sage/10 flex items-center gap-8">
      <div className="w-16 h-16 rounded-full bg-sage flex items-center justify-center shrink-0">
        <Info size={32} className="text-white" />
      </div>
      <div>
        <h5 className="font-bold text-ink mb-1">Governance Mode</h5>
        <p className="text-sm text-ink/50 leading-relaxed italic">Manual overrides expire after 4 hours of inactivity to restore global energy harmony. Ensure critical nodes are locked in the logic settings.</p>
      </div>
    </div>
  </motion.div>
);

const SafetyHubView = ({ gasLevel, isFlame }: any) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="grid grid-cols-1 lg:grid-cols-2 gap-10 pb-20"
  >
    <div className={cn("p-12 rounded-[4rem] border-2 transition-all duration-700", isFlame ? "border-danger bg-danger/5 shadow-2xl shadow-danger/20" : "bg-white border-olive/5 shadow-sm")}>
      <div className="flex justify-between items-start mb-12">
        <div className="flex items-center gap-6">
          <div className={cn("p-8 rounded-[2.5rem] soft-shadow transition-transform", isFlame ? "bg-danger text-white scale-110" : "bg-bg-card text-ink/30")}>
            <Flame size={48} />
          </div>
          <div>
            <h4 className="text-2xl font-display font-medium text-ink leading-tight mb-2 italic">Infrared <br /> Thermal Array</h4>
            <p className="text-xs font-bold text-ink/30 uppercase tracking-widest">MQ-2 + IR Shielding Active</p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
          <div className="p-6 bg-bg-card/20 rounded-3xl border border-olive/5 flex items-center justify-between">
            <span className="text-sm font-bold text-ink/60">Molecular Shutter Status</span>
            <span className={cn("text-[10px] font-black uppercase px-2 py-1 rounded", isFlame ? "bg-danger text-white px-3" : "bg-sage/10 text-sage")}>
              {isFlame ? 'LOCKED' : 'OPEN'}
            </span>
          </div>
      </div>
    </div>

    <div className="p-12 rounded-[4rem] bg-white border border-olive/5 shadow-sm space-y-12">
      <div>
        <div className="flex items-center gap-6 mb-10">
          <div className={cn("p-8 rounded-[2.5rem] shadow-sm", gasLevel > 300 ? "bg-clay text-white" : "bg-bg-card text-ink/20")}>
            <Wind size={48} />
          </div>
          <div>
            <h4 className="text-2xl font-display font-medium text-ink italic leading-tight mb-2">Molecular <br /> Concentration</h4>
            <p className="text-xs font-bold text-ink/30 uppercase tracking-widest">{gasLevel.toFixed(1)} PPM</p>
          </div>
        </div>
        <div className="h-4 w-full bg-bg-card rounded-full overflow-hidden relative mb-6">
          <motion.div animate={{ width: `${(gasLevel / 450) * 100}%` }} className={cn("h-full relative z-10 transition-colors", gasLevel > 300 ? "bg-clay" : "bg-sage")} />
        </div>
        <p className="text-xs text-ink/40 leading-relaxed font-medium">Monitoring methane, LPG, and smoke particles across Zone 1-12 metadata clusters.</p>
      </div>
    </div>
  </motion.div>
);

const EventsView = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-4 pb-20"
  >
    {[
      { title: 'System Recalibration', time: '2m ago', type: 'info', desc: 'Main kitchen node triggered thermal threshold reversal.' },
      { title: 'Energy Target Met', time: '1h ago', type: 'success', desc: 'Living room light cycle optimized for daylight.' },
      { title: 'Mesh Topology Update', time: '4h ago', type: 'info', desc: 'Zigbee channels updated for zero-latency drift.' },
    ].map((notif, i) => (
      <div key={i} className="p-8 rounded-[3rem] bg-white border border-olive/5 shadow-sm flex items-center justify-between group hover:bg-bg-card transition-all">
        <div className="flex items-center gap-8">
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", 
            notif.type === 'danger' ? "bg-danger/10 text-danger" : 
            notif.type === 'success' ? "bg-sage/10 text-sage" : "bg-bg-card text-ink/30"
          )}>
            <Bell size={24} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h5 className="font-bold text-ink">{notif.title}</h5>
              <span className="text-[10px] font-black text-ink/20">{notif.time}</span>
            </div>
            <p className="text-sm text-ink/40 font-medium">{notif.desc}</p>
          </div>
        </div>
        <ChevronRight size={20} className="text-ink/10 group-hover:text-olive transition-all" />
      </div>
    ))}
  </motion.div>
);

const SettingsView = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="max-w-2xl bg-white rounded-[4rem] p-12 border border-olive/10 shadow-sm mx-auto pb-20"
  >
    <div className="flex items-center gap-6 mb-10">
      <div className="p-6 bg-olive text-white rounded-3xl soft-shadow">
        <Settings size={32} />
      </div>
      <h3 className="text-2xl font-display font-medium text-olive italic">System Preference Matrix</h3>
    </div>
    
    <div className="space-y-8">
      <div className="flex items-center justify-between p-6 bg-bg-card/20 rounded-3xl">
        <div>
          <h5 className="font-bold text-ink mb-1">Dark Mode Override</h5>
          <p className="text-[10px] text-ink/40 font-black uppercase tracking-widest">Automatic based on solar cycle</p>
        </div>
        <div className="w-12 h-6 bg-sage rounded-full flex items-center px-1">
          <div className="w-4 h-4 bg-white rounded-full translate-x-6 shadow-sm" />
        </div>
      </div>
      <div className="flex items-center justify-between p-6 bg-bg-card/20 rounded-3xl opacity-50">
          <div>
          <h5 className="font-bold text-ink mb-1">Predictive Loading</h5>
          <p className="text-[10px] text-ink/40 font-black uppercase tracking-widest">Beta testing active</p>
        </div>
        <div className="w-12 h-6 bg-ink/10 rounded-full flex items-center px-1">
          <div className="w-4 h-4 bg-ink/20 rounded-full" />
        </div>
      </div>
    </div>

    <div className="mt-12 p-8 bg-olive/5 rounded-[2.5rem] border border-olive/5 text-center">
       <div className="text-[9px] font-black text-olive/40 uppercase tracking-widest mb-2">Mesh Identity</div>
       <div className="text-[10px] font-bold text-ink/40 italic">AETHER-OS-v2.4.1-MESH-TOPOLOGY</div>
    </div>
  </motion.div>
);

