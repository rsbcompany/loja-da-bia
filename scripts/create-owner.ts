import { countUsers, insertUser } from "../server/data/users";
import { hashPassword } from "../server/services/auth";
import { getDb } from "../server/data/db";

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: bun scripts/create-owner.ts <email> <password>");
  process.exit(1);
}

const db = getDb();
if ((await countUsers(db)) > 0) {
  console.error("An owner already exists — registration is closed.");
  process.exit(1);
}

const passwordHash = await hashPassword(password);
await insertUser(db, email, passwordHash);
console.log(`Owner created: ${email}`);
