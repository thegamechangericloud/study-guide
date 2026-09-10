import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "@prisma/client";

const secretKey = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-me"
);

const ADULT_COOKIE = "sg_session";
const STUDENT_COOKIE = "sg_student";
const ADULT_MAX_AGE = 60 * 60 * 24 * 14; // 14 days
const STUDENT_MAX_AGE = 60 * 60 * 8; // 8 hours — shorter-lived, kiosk-friendly

export type AdultSessionPayload = {
  sub: string; // User.id
  role: UserRole;
  schoolId: string | null;
  name: string;
};

export type StudentSessionPayload = {
  sub: string; // StudentProfile.id
  activatedByUserId: string;
  displayName: string;
};

async function sign(payload: Record<string, unknown>, maxAgeSeconds: number) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + maxAgeSeconds)
    .sign(secretKey);
}

async function verify<T>(token: string | undefined): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as T;
  } catch {
    return null;
  }
}

// -- Adult (parent / teacher / school admin / platform admin) session -------

export async function createAdultSession(payload: AdultSessionPayload) {
  const token = await sign(payload, ADULT_MAX_AGE);
  const store = await cookies();
  store.set(ADULT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADULT_MAX_AGE,
  });
}

export async function getAdultSession(): Promise<AdultSessionPayload | null> {
  const store = await cookies();
  return verify<AdultSessionPayload>(store.get(ADULT_COOKIE)?.value);
}

export async function destroyAdultSession() {
  const store = await cookies();
  store.delete(ADULT_COOKIE);
  store.delete(STUDENT_COOKIE); // exiting the adult session also exits student mode
}

// -- Student (child) session, activated via PIN after an adult signs in ----

export async function createStudentSession(payload: StudentSessionPayload) {
  const token = await sign(payload, STUDENT_MAX_AGE);
  const store = await cookies();
  store.set(STUDENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: STUDENT_MAX_AGE,
  });
}

export async function getStudentSession(): Promise<StudentSessionPayload | null> {
  const store = await cookies();
  return verify<StudentSessionPayload>(store.get(STUDENT_COOKIE)?.value);
}

export async function destroyStudentSession() {
  const store = await cookies();
  store.delete(STUDENT_COOKIE);
}
