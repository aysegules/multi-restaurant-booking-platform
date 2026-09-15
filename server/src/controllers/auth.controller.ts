import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";

const register = asyncHandler(async (req: Request, res: Response) => {});

const login = asyncHandler(async (req: Request, res: Response) => {});


export { register, login };
