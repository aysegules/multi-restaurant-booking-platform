import jwt from "jsonwebtoken";
import type { Secret } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET!;

export const generateToken = (id: string) => {
  const token = jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "3d",
    algorithm: "HS512",
  });

  return token;
};
