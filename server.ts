import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import taskRoutes from "./server/routes/tasks.ts";
import analyticsRoutes from "./server/routes/analytics.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure all responses are JSON
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    res.setHeader('Content-Type', 'application/json');
  }
  next();
});

// Request logging
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  }
  next();
});

// API Routes
app.use("/api/tasks", taskRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/api/ping", (req, res) => {
  res.json({ message: "pong", timestamp: new Date().toISOString() });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// API 404 handler
app.all("/api/*", (req, res) => {
  res.status(404).json({ 
    error: "API route not found", 
    method: req.method, 
    path: req.originalUrl 
  });
});

// Vite / Static files
async function setupFrontend() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error:", err);
  res.status(500).json({ 
    error: "Internal server error", 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  setupFrontend().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  });
} else {
  // For Vercel, frontend is handled by vercel.json rewrites or static build
  // But we still need to export the app
}

export default app;
