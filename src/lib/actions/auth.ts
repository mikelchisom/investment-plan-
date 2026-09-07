"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validation/auth";
import { ROLE_ADMIN, ROLE_USER, STARTING_DEMO_BALANCE } from "@/lib/constants";

export type FormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function signUpAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const userRole = await prisma.role.findUnique({ where: { name: ROLE_USER } });
  if (!userRole) {
    return { error: "Platform is not fully set up yet. Please contact support." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      roleId: userRole.id,
      portfolio: {
        create: {
          cashBalance: STARTING_DEMO_BALANCE,
          totalDeposited: STARTING_DEMO_BALANCE,
        },
      },
      notifications: {
        create: {
          type: "SUCCESS",
          title: "Welcome to your simulation account",
          message: `Your demo account was created with a starting simulated balance of $${STARTING_DEMO_BALANCE.toLocaleString()}. No real money is involved.`,
        },
      },
    },
  });

  try {
    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Account created, but automatic sign-in failed. Please log in." };
    }
    throw err;
  }

  redirect("/dashboard");
}

export async function loginAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const email = formData.get("email");
  const password = formData.get("password");

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw err;
  }

  // Note: auth() would not reliably see the session cookie signIn() just set
  // within this same server action invocation, so look the role up directly
  // instead of depending on session-cookie readback timing.
  const user = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase() },
    include: { role: true },
  });

  redirect(user?.role.name === ROLE_ADMIN ? "/admin" : "/dashboard");
}
