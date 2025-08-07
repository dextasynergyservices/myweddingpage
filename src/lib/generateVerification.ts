import { nanoid } from "nanoid";

export function generateVerificationDetails() {
  const token = nanoid(32);
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return { token, code };
}
