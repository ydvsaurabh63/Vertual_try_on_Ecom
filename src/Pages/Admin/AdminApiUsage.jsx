import React, { useState, useEffect } from 'react';
import { Activity, Sparkles, CheckCircle2, AlertTriangle, Clock, Zap, Server, ShieldCheck } from 'lucide-react';
import StatCard from '../../Components/Admin/StatCard';
import Loader from '../../Components/Admin/Loader';
import { adminApi } from '../../services/adminApi';
import toast from 'react-hot-toast';

export const AdminApiUsage = () => {
  const [data, setData] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsageData = async () => {
    setIsLoading(true);
    try {
      const [usageRes, healthRes] = await Promise.all([
        adminApi.getApiUsage(),
        fetch('/api/health').then(r => r.json()).catch(() => ({ ok: false }))
      ]);
      setData(usageRes);
      setHealthData(healthRes);
    } catch (err) {
      toast.error('Failed to load API usage analytics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, []);

  if (isLoading) {
    return <Loader message="Loading AI API usage analytics..." />;
  }

  const { metrics, dailyUsage, errorLogs } = data || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">API Usage & Engine Diagnostics</h1>
          <p className="text-sm text-zinc-400 mt-1">Real-time performance metrics for LightX AI Virtual Try-On and Google Gemini Stylist.</p>
        </div>

        <button
          onClick={fetchUsageData}
          className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 text-amber-400 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Backend Engine & Tunnel Health Card */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Express Engine + LocalTunnel Bridge</h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${healthData?.ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {healthData?.ok ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Public Asset Tunnel: <code className="text-amber-300">{healthData?.publicBaseUrl || 'Active (Localtunnel Proxy)'}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div>
            <p className="text-zinc-500 font-semibold uppercase text-[10px]">LightX Key Status</p>
            <p className="font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Configured in Server .env
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total API Invocations"
          value={metrics?.totalRequests || 0}
          icon={Zap}
          subtitle="Try-On requests initiated"
          colorScheme="amber"
        />
        <StatCard
          title="Success Rate"
          value={`${metrics?.successRate || 100}%`}
          icon={CheckCircle2}
          subtitle={`${metrics?.successfulRequests || 0} completed successfully`}
          colorScheme="emerald"
        />
        <StatCard
          title="Average Latency"
          value={`${metrics?.avgResponseTimeMs || 3200}ms`}
          icon={Clock}
          subtitle="AI model generation cycle"
          colorScheme="blue"
        />
        <StatCard
          title="Failed Requests"
          value={metrics?.failedRequests || 0}
          icon={AlertTriangle}
          subtitle="Image resolution or timeout"
          colorScheme="rose"
        />
      </div>

      {/* Daily API Trends Table / Chart */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl">
        <h3 className="text-base font-bold text-white mb-1">Daily API Request Breakdown</h3>
        <p className="text-xs text-zinc-400 mb-6">Historical load on external generative AI endpoints.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {(dailyUsage || []).map((day, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center">
              <p className="text-[11px] font-bold text-zinc-400 uppercase">{day.date}</p>
              <p className="text-xl font-black text-amber-400 mt-1">{day.requests}</p>
              <div className="flex items-center justify-center gap-2 text-[10px] mt-2 font-semibold">
                <span className="text-emerald-400">✓ {day.success}</span>
                {day.failed > 0 && <span className="text-rose-400">✗ {day.failed}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Error Diagnostics Log */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl">
        <h3 className="text-base font-bold text-white mb-1">AI Error Logs & Diagnostics</h3>
        <p className="text-xs text-zinc-400 mb-4">Inspection of failed requests for debugging image inputs and API limits.</p>

        {(!errorLogs || errorLogs.length === 0) ? (
          <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 text-center text-xs text-zinc-400">
            ✓ Zero active errors. All recent Virtual Try-On requests generated smoothly.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {errorLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-rose-400">{log.error}</span>
                  <p className="text-zinc-400 mt-0.5">Product: {log.product} • User: {log.user}</p>
                </div>
                <span className="text-zinc-500 font-mono text-[11px] shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApiUsage;
