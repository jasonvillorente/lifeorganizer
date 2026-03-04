import express from "express";
import db from "../db.ts";
import { authenticateToken, AuthRequest } from "../auth.ts";

const router = express.Router();

router.get("/", authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const tasks = db.prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC").all(userId);
  res.json(tasks);
});

router.post("/", authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const { title, description, category, priority, due_date } = req.body;

  if (!title) return res.status(400).json({ error: "Title is required" });

  const result = db.prepare(
    "INSERT INTO tasks (user_id, title, description, category, priority, due_date) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(userId, title, description, category, priority || 'medium', due_date);

  const newTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(newTask);
});

router.patch("/:id", authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const { status, title, description, priority, due_date } = req.body;

  const task = db.prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?").get(id, userId) as any;
  if (!task) return res.status(404).json({ error: "Task not found" });

  const completedAt = status === 'completed' ? new Date().toISOString() : null;

  db.prepare(`
    UPDATE tasks 
    SET status = COALESCE(?, status), 
        title = COALESCE(?, title), 
        description = COALESCE(?, description),
        priority = COALESCE(?, priority),
        due_date = COALESCE(?, due_date),
        completed_at = COALESCE(?, completed_at)
    WHERE id = ? AND user_id = ?
  `).run(status, title, description, priority, due_date, completedAt, id, userId);

  const updatedTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  res.json(updatedTask);
});

router.delete("/:id", authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  const result = db.prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?").run(id, userId);
  if (result.changes === 0) return res.status(404).json({ error: "Task not found" });

  res.status(204).send();
});

export default router;
