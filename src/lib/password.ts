import bcrypt from "bcryptjs";

export async function hashSecret(plain: string) {
  return bcrypt.hash(plain, 12);
}

export async function verifySecret(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}
