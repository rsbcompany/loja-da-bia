const PBKDF2_ITERATIONS = 210_000;
const SALT_BYTES = 16;
const HASH_BITS = 256;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const hash = await derivePbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const hash = await derivePbkdf2(password, fromBase64(parts[2] ?? ""), Number(parts[1]));
  return toBase64(hash) === parts[3];
}

export function buildSessionToken(): string {
  return toHex(randomBytes(32));
}

export async function hashSessionToken(token: string): Promise<string> {
  const bits = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return toHex(new Uint8Array(bits));
}

function derivePbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const keyMaterial = new TextEncoder().encode(password);
  const params = { name: "PBKDF2", hash: "SHA-256", salt, iterations };
  const bits = crypto.subtle
    .importKey("raw", keyMaterial, "PBKDF2", false, ["deriveBits"])
    .then((key) => crypto.subtle.deriveBits(params, key, HASH_BITS));
  return bits.then((derived) => new Uint8Array(derived));
}

function randomBytes(size: number): Uint8Array {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return bytes;
}

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
