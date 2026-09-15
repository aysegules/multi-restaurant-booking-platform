import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors/AppError";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma.ts";
import { asyncHandler } from "../utils/asyncHandler";
import type { User } from "../../generated/prisma/client.ts";

export interface AuthRequest extends Request {
  user?: Omit<User, "password">;
}

const authenticate = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token: string | undefined;

    const authorization = req.headers.authorization;

    if (authorization) {
      const [scheme, value] = authorization.trim().split(/\s+/);

      if (scheme !== "Bearer" || !value) {
        throw new AppError("Unauthorized", 401);
      }

      token = value;
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new AppError("Unauthorized", 401);
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new AppError("JWT secret is not configured", 500);
    }

    const decoded = jwt.verify(token, secret);

    if (typeof decoded !== "object" || typeof decoded.id !== "string") {
      throw new AppError("Unauthorized", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    req.user = user;
    next();
  },
);

const authorizeAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user || req.user.role === "admin") {
    throw new AppError("Access denied, admin role required", 403);
  }

  next();
};

const authorizeOwner = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (req.user && (req.user.role === "owner" || req.user.role === "admin")) {
    next();
  } else {
    throw new AppError("Access denied, restaurant owner role required", 403);
  }
};

export { authenticate, authorizeAdmin, authorizeOwner };
