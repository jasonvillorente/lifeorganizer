import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Calendar as CalendarIcon,
  Tag,
  Flag,
  X,
  CheckSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const TaskManager: React.FC = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");

  // New Task Form State
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category: "Work",
    priority: "medium",
    due_date: ""
  });

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(newTask)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setNewTask({ title: "", description: "", category: "Work", priority: "medium", due_date: "" });
        fetchTasks();
      }
    } catch (err) {
      console.error("Failed to add task", err);
    }
  };

  const toggleTaskStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchTasks();
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'completed' && task.status === 'completed') ||
                         (filter === 'pending' && task.status === 'pending');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold text-stone-900 tracking-tight">Tasks</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm shadow-emerald-200"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'pending', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${
                filter === f ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-stone-500">Loading tasks...</div>
        ) : filteredTasks.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {filteredTasks.map((task) => (
              <motion.div 
                layout
                key={task.id} 
                className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <button 
                    onClick={() => toggleTaskStatus(task.id, task.status)}
                    className={`transition-colors ${task.status === 'completed' ? 'text-emerald-500' : 'text-stone-300 hover:text-stone-400'}`}
                  >
                    {task.status === 'completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>
                  <div className="flex-1">
                    <p className={`font-medium ${task.status === 'completed' ? 'text-stone-400 line-through' : 'text-stone-900'}`}>
                      {task.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-stone-500">
                      <span className="flex items-center gap-1"><Tag size={12} /> {task.category || 'General'}</span>
                      {task.due_date && <span className="flex items-center gap-1"><CalendarIcon size={12} /> {new Date(task.due_date).toLocaleDateString()}</span>}
                      <span className={`flex items-center gap-1 font-bold uppercase tracking-wider ${
                        task.priority === 'high' ? 'text-red-500' : 
                        task.priority === 'medium' ? 'text-amber-500' : 
                        'text-blue-500'
                      }`}>
                        <Flag size={12} /> {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => deleteTask(task.id)}
                  className="p-2 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
              <CheckSquare size={32} />
            </div>
            <p className="text-stone-500">No tasks found. Time to relax or add a new one!</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-stone-900">New Task</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddTask} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-stone-700">Title</label>
                  <input 
                    required
                    type="text" 
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="What needs to be done?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-stone-700">Category</label>
                    <select 
                      value={newTask.category}
                      onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                      className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option>Work</option>
                      <option>Personal</option>
                      <option>Health</option>
                      <option>Finance</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-stone-700">Priority</label>
                    <select 
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                      className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-stone-700">Due Date</label>
                  <input 
                    type="date" 
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-stone-700">Description (Optional)</label>
                  <textarea 
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                    placeholder="Add more details..."
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl transition-all mt-4"
                >
                  Create Task
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskManager;
