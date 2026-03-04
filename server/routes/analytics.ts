import express from "express";
import { authenticateToken, AuthRequest } from "../auth.ts";
import { calculateProductivity, getAnalyticsHistory } from "../logic/productivity.ts";

const router = express.Router();

router.get("/summary", authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const stats = calculateProductivity(userId);
  res.json(stats);
});

router.get("/history", authenticateToken, (req: AuthRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const history = getAnalyticsHistory(userId);
  res.json(history);
});

export default router;
