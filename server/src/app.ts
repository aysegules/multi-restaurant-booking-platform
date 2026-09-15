import express from "express";
import type { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";

import { errorHandler } from "./middlewares/error.middleware";

import authRouter from "./routes/auth.routes";

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins?.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Server is running..." });
});

app.use("/auth", authRouter);

app.use(errorHandler);

export default app;
