import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Calendar as CalendarIcon,
  ChevronRight
} from "lucide-react";
import { motion } from "motion/react";

const Analytics: React.FC = () => {
  const { token } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, summaryRes] = await Promise.all([
          fetch("/api/analytics/history", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("/api/analytics/summary", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        const historyData = await historyRes.json();
        const summaryData = await summaryRes.json();
        
        // Mock some history if empty for visualization
        if (historyData.length === 0) {
          const mockData = Array.from({ length: 7 }).map((_, i) => ({
            date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            productivity_score: Math.floor(Math.random() * 40) + 60,
            tasks_completed: Math.floor(Math.random() * 5) + 2
          }));
          setHistory(mockData);
        } else {
          setHistory(historyData.reverse());
        }
        
        setSummary(summaryData);
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <div className="flex items-center justify-center h-[60vh]">Loading analytics...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-stone-900 tracking-tight">Analytics</h1>
        <p className="text-stone-500 mt-1">Visualize your productivity patterns and performance.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+12% vs last week</span>
          </div>
          <p className="text-sm text-stone-500 font-medium">Productivity Score</p>
          <p className="text-3xl font-semibold text-stone-900 mt-1">{summary?.score || 0}%</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p className="text-sm text-stone-500 font-medium">Tasks Completed (Today)</p>
          <p className="text-3xl font-semibold text-stone-900 mt-1">{summary?.completedCount || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
          </div>
          <p className="text-sm text-stone-500 font-medium">Overdue Tasks</p>
          <p className="text-3xl font-semibold text-stone-900 mt-1">{summary?.overdueCount || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="text-lg font-semibold text-stone-900 mb-6">Productivity Score (Last 7 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString()}
                />
                <Area 
                  type="monotone" 
                  dataKey="productivity_score" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="text-lg font-semibold text-stone-900 mb-6">Tasks Completed</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { weekday: 'short' })}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="tasks_completed" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100">
          <h3 className="text-lg font-semibold text-stone-900">Performance Insights</h3>
        </div>
        <div className="divide-y divide-stone-100">
          <InsightRow 
            title="Consistency" 
            desc="You've completed tasks 5 days in a row. Great momentum!" 
            type="success"
          />
          <InsightRow 
            title="Time Management" 
            desc="Most tasks are being completed 2 hours after their due time." 
            type="warning"
          />
          <InsightRow 
            title="Peak Performance" 
            desc="Your productivity peaks on Tuesdays. Plan heavy work then." 
            type="info"
          />
        </div>
      </div>
    </div>
  );
};

const InsightRow = ({ title, desc, type }: any) => {
  const colors = {
    success: "bg-emerald-50 text-emerald-600",
    warning: "bg-amber-50 text-amber-600",
    info: "bg-blue-50 text-blue-600"
  };
  return (
    <div className="p-4 flex items-start gap-4 hover:bg-stone-50 transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colors[type as keyof typeof colors]}`}>
        <TrendingUp size={20} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-stone-900">{title}</p>
        <p className="text-sm text-stone-500 mt-0.5">{desc}</p>
      </div>
      <ChevronRight className="text-stone-300" size={18} />
    </div>
  );
};

export default Analytics;
