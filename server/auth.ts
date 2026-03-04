import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // For a no-auth experience, we'll use a default user ID (1)
  // This allows the app to function without login/signup
  req.user = { id: 1, email: "guest@example.com" };
  next();
};
