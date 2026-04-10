"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;

export async function signup(
  _state: FormState,
  formData: FormData
): Promise<Exclude<FormState, undefined>> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { name, username, email, password } = parsed.data;

  const existing = await db.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    if (existing.email === email) {
      return { errors: { email: ["Email already in use"] } };
    }
    return { errors: { username: ["Username already taken"] } };
  }

  const hashed = await bcrypt.hash(password, 12);

  await db.user.create({
    data: { name, username, email, password: hashed },
  });

  await signIn("credentials", { email, password, redirectTo: "/" });
  return {};
}

export async function login(
  _state: FormState,
  formData: FormData
): Promise<Exclude<FormState, undefined>> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch {
    return { message: "Invalid email or password" };
  }
  return {};
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
