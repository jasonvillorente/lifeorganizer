import db from "../db.ts";

export interface ProductivityStats {
  score: number;
  completedCount: number;
  overdueCount: number;
  peakHour: number;
  suggestion: string;
}

export const calculateProductivity = (userId: number): ProductivityStats => {
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  // Get tasks completed today
  const completedToday = db.prepare(`
    SELECT COUNT(*) as count, strftime('%H', completed_at) as hour
    FROM tasks 
    WHERE user_id = ? AND status = 'completed' AND date(completed_at) = ?
    GROUP BY hour
    ORDER BY count DESC
    LIMIT 1
  `).get(userId, today) as any;

  // Get overdue tasks
  const overdue = db.prepare(`
    SELECT COUNT(*) as count 
    FROM tasks 
    WHERE user_id = ? AND status = 'pending' AND due_date < ?
  `).get(userId, now.toISOString()) as any;

  // Get total tasks for today (created or due today)
  const totalToday = db.prepare(`
    SELECT COUNT(*) as count 
    FROM tasks 
    WHERE user_id = ? AND (date(created_at) = ? OR date(due_date) = ?)
  `).get(userId, today, today) as any;

  const completedCount = completedToday?.count || 0;
  const overdueCount = overdue?.count || 0;
  const totalCount = totalToday?.count || 0;
  const peakHour = completedToday ? parseInt(completedToday.hour) : 9;

  // Score calculation logic
  let score = 0;
  if (totalCount > 0) {
    score = Math.round((completedCount / totalCount) * 100);
  } else if (completedCount > 0) {
    score = 100;
  }
  
  score = Math.max(0, score - (overdueCount * 5)); // Penalty for overdue

  // Suggestions based on patterns
  let suggestion = "Keep up the good work!";
  if (overdueCount > 3) {
    suggestion = "You have several overdue tasks. Try breaking them into smaller steps.";
  } else if (score < 50 && totalCount > 0) {
    suggestion = "Focus on completing one high-priority task to build momentum.";
  } else if (peakHour < 12 && completedCount > 2) {
    suggestion = "You're most productive in the morning! Schedule your hardest tasks before noon.";
  } else if (peakHour >= 12 && completedCount > 2) {
    suggestion = "You seem to hit your stride in the afternoon. Save complex work for then.";
  }

  return {
    score,
    completedCount,
    overdueCount,
    peakHour,
    suggestion
  };
};

export const getAnalyticsHistory = (userId: number) => {
  // Return last 7 days of performance
  return db.prepare(`
    SELECT date, productivity_score, tasks_completed 
    FROM analytics 
    WHERE user_id = ? 
    ORDER BY date DESC 
    LIMIT 7
  `).all(userId);
};
