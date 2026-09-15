import { prisma } from "../../lib/prisma.ts";
import { AppError } from "../utils/errors/AppError.ts";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.ts";

type Register = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

type Login = {
  email: string;
  password: string;
};

const register = async ({ name, email, password, phone }: Register) => {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw new AppError("User already exists", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
    },
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

  return user;
};

const login = async ({ email, password }: Login) => {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (!existing) {
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, existing.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken(existing.id);

  const { password: _, ...user } = existing;

  return { user, token };
};

export { register, login };
