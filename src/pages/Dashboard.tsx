import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Calendar as CalendarIcon,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          fetch("/api/analytics/summary", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch("/api/tasks", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const checkRes = async (res: Response) => {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            return res.json();
          } else {
            const text = await res.text();
            console.error(`Non-JSON response from ${res.url}:`, text);
            throw new Error(`Server error: ${res.status}`);
          }
        };

        const statsData = await checkRes(statsRes);
        const tasksData = await checkRes(tasksRes);

        setStats(statsData);
        setRecentTasks(tasksData.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <div className="flex items-center justify-center h-[60vh]">Loading dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-stone-900 tracking-tight">Hello, {user?.name}</h1>
          <p className="text-stone-500 mt-1">Here's how your day is looking.</p>
        </div>
        <button 
          onClick={() => navigate("/tasks")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm shadow-emerald-200"
        >
          <Plus size={18} />
          Add New Task
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Productivity Score" 
          value={`${stats?.score || 0}%`} 
          icon={TrendingUp} 
          color="text-emerald-600"
          bg="bg-emerald-50"
          onClick={() => navigate("/analytics")}
        />
        <StatCard 
          title="Tasks Completed" 
          value={stats?.completedCount || 0} 
          icon={CheckCircle2} 
          color="text-blue-600"
          bg="bg-blue-50"
          onClick={() => navigate("/tasks")}
        />
        <StatCard 
          title="Overdue Tasks" 
          value={stats?.overdueCount || 0} 
          icon={AlertCircle} 
          color="text-red-600"
          bg="bg-red-50"
          onClick={() => navigate("/tasks")}
        />
        <StatCard 
          title="Peak Hour" 
          value={`${stats?.peakHour || 9}:00`} 
          icon={Clock} 
          color="text-amber-600"
          bg="bg-amber-50"
          onClick={() => navigate("/insights")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-stone-900">Recent Tasks</h2>
            <Link to="/tasks" className="text-emerald-600 text-sm font-medium flex items-center gap-1 hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
            {recentTasks.length > 0 ? (
              <div className="divide-y divide-stone-100">
                {recentTasks.map((task) => (
                  <div key={task.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                      <div>
                        <p className={`font-medium ${task.status === 'completed' ? 'text-stone-400 line-through' : 'text-stone-900'}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {task.category || 'No category'} • Due {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Today'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                      task.priority === 'high' ? 'bg-red-50 text-red-600' : 
                      task.priority === 'medium' ? 'bg-amber-50 text-amber-600' : 
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <p className="text-stone-500">No tasks yet. Start by adding one!</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-stone-900">AI Insight</h2>
          <div className="bg-stone-900 text-white rounded-2xl p-6 shadow-lg shadow-stone-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles size={80} />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mb-4">
                <Sparkles size={20} />
              </div>
              <h3 className="text-lg font-medium mb-2">Smart Suggestion</h3>
              <p className="text-stone-400 text-sm leading-relaxed mb-6">
                {stats?.suggestion || "Complete your profile to get personalized productivity insights."}
              </p>
              <button 
                onClick={() => navigate("/insights")}
                className="w-full bg-white/10 hover:bg-white/20 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                View Full Analysis
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-600">
                <CalendarIcon size={20} />
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wider font-bold">Today's Focus</p>
                <p className="text-sm font-medium text-stone-900">Deep Work Session</p>
              </div>
            </div>
            <p className="text-xs text-stone-500 leading-relaxed">
              Based on your habits, you are most focused between 9 AM and 11 AM. Use this time for complex tasks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, bg, onClick }: any) => (
  <motion.button
    whileHover={{ y: -4 }}
    onClick={onClick}
    className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col gap-4 text-left group transition-all hover:border-emerald-200"
  >
    <div className={`w-12 h-12 ${bg} ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-stone-500 font-medium">{title}</p>
      <p className="text-2xl font-semibold text-stone-900 mt-1">{value}</p>
    </div>
  </motion.button>
);

export default Dashboard;
