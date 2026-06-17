import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const keyLength = 64;

export async function hashearPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, keyLength)) as Buffer;

  return `scrypt:${salt}:${hash.toString("hex")}`;
}

export async function verificarPassword(password: string, passwordHash: string) {
  const [algoritmo, salt, hashGuardado] = passwordHash.split(":");

  if (algoritmo !== "scrypt" || !salt || !hashGuardado) {
    return false;
  }

  const hash = (await scrypt(password, salt, keyLength)) as Buffer;
  const hashBuffer = Buffer.from(hashGuardado, "hex");

  return hashBuffer.length === hash.length && timingSafeEqual(hashBuffer, hash);
}
