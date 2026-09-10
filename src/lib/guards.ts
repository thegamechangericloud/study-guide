import "server-only";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { getAdultSession, getStudentSession } from "@/lib/session";

/// Use in server components / route handlers to require a signed-in adult,
/// optionally restricted to specific roles (role-based access control).
export async function requireAdult(allowedRoles?: UserRole[]) {
  const session = await getAdultSession();
  if (!session) redirect("/login");
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect("/unauthorized");
  }
  return session;
}

export async function requireStudent() {
  const session = await getStudentSession();
  if (!session) redirect("/profiles");
  return session;
}
