import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Sparkles, 
  Clock, 
  Target, 
  Zap, 
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lightbulb
} from "lucide-react";
import { motion } from "motion/react";
import { checkRes } from "../utils/api";

const AIInsights: React.FC = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/analytics/summary", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await checkRes(res);
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch insights", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) return <div className="flex items-center justify-center h-[60vh]">Loading AI insights...</div>;

  const insights = [
    {
      title: "Peak Productivity Window",
      desc: `You are most efficient around ${stats?.peakHour || 9}:00 AM. Schedule your most demanding tasks during this window for maximum output.`,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Task Completion Pattern",
      desc: stats?.score > 70 
        ? "Your completion rate is high! You're effectively managing your workload." 
        : "You tend to leave tasks pending. Try the '2-minute rule' for small tasks to clear your list.",
      icon: Target,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Overdue Alert",
      desc: stats?.overdueCount > 0 
        ? `You have ${stats.overdueCount} overdue tasks. These are creating mental clutter. Tackle the smallest one first.` 
        : "Great job! You have no overdue tasks currently. Your schedule is clean.",
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-stone-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-stone-200">
          <Sparkles size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-stone-900 tracking-tight">AI Insights</h1>
          <p className="text-stone-500 mt-1">Personalized productivity analysis based on your behavior.</p>
        </div>
      </div>

      {/* Main Insight Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Sparkles size={200} />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            <Zap size={14} />
            Daily Strategy
          </div>
          <h2 className="text-2xl font-semibold text-stone-900 mb-4">Optimize Your Tomorrow</h2>
          <p className="text-stone-600 text-lg leading-relaxed mb-8">
            {stats?.suggestion || "We're still learning your patterns. Keep tracking your tasks to get smarter suggestions."}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center shrink-0 text-stone-600">
                <CalendarIcon size={20} />
              </div>
              <div>
                <p className="font-medium text-stone-900">Morning Focus</p>
                <p className="text-sm text-stone-500 mt-1">Deep work session recommended at 9:00 AM.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center shrink-0 text-stone-600">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="font-medium text-stone-900">Task Batching</p>
                <p className="text-sm text-stone-500 mt-1">Group your 3 'Personal' tasks together at 4:00 PM.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Insight Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={insight.title} 
            className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col h-full"
          >
            <div className={`w-12 h-12 ${insight.bg} ${insight.color} rounded-xl flex items-center justify-center mb-6`}>
              <insight.icon size={24} />
            </div>
            <h3 className="text-lg font-semibold text-stone-900 mb-3">{insight.title}</h3>
            <p className="text-stone-500 text-sm leading-relaxed flex-1">
              {insight.desc}
            </p>
            <button className="mt-6 text-stone-900 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Learn more <ArrowRight size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Tip of the Day */}
      <div className="bg-emerald-600 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-lg shadow-emerald-100">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
          <Lightbulb size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg font-semibold mb-1">Productivity Tip</h3>
          <p className="text-emerald-50 opacity-90">
            The "Eat the Frog" technique suggests doing your most difficult task first thing in the morning. Try it tomorrow!
          </p>
        </div>
        <button className="bg-white text-emerald-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-emerald-50 transition-colors shrink-0">
          Try Technique
        </button>
      </div>
    </div>
  );
};

export default AIInsights;
