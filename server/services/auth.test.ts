import { describe, expect, it } from "vitest";
import { buildSessionToken, hashPassword, hashSessionToken, verifyPassword } from "./auth";

describe("password hashing", () => {
  it("verifies the correct password", async () => {
    const stored = await hashPassword("senha-da-bia");

    await expect(verifyPassword("senha-da-bia", stored)).resolves.toBe(true);
  });

  it("rejects a wrong password", async () => {
    const stored = await hashPassword("senha-da-bia");

    await expect(verifyPassword("outra-senha", stored)).resolves.toBe(false);
  });

  it("salts equal passwords into different hashes", async () => {
    const first = await hashPassword("senha-da-bia");
    const second = await hashPassword("senha-da-bia");

    expect(first).not.toBe(second);
  });

  it("rejects malformed stored hashes", async () => {
    await expect(verifyPassword("senha-da-bia", "texto-aleatorio")).resolves.toBe(false);
  });
});

describe("session tokens", () => {
  it("builds hex tokens of 64 chars", () => {
    const token = buildSessionToken();

    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it("hashes tokens deterministically", async () => {
    const token = buildSessionToken();

    await expect(hashSessionToken(token)).resolves.toBe(await hashSessionToken(token));
  });
});
