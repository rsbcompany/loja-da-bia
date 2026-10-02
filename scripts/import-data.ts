import { readFileSync } from "node:fs";
import { findUserByEmail } from "../server/data/users";
import { importAppData } from "../server/services/data";
import { getDb } from "../server/data/db";
import type { AppData } from "../src/lib/bia/types";

const [seedPath, email] = process.argv.slice(2);
if (!seedPath || !email) {
  console.error("Usage: bun scripts/import-data.ts <seed.json path> <owner email>");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(seedPath, "utf8")) as Omit<AppData, "meta">;
const incoming: AppData = {
  ...raw,
  meta: {
    importedAt: new Date().toISOString(),
    lastBackupAt: new Date().toISOString(),
    changesSinceBackup: 0,
    importTotal: raw.orders.length,
  },
};

const db = getDb();
const user = await findUserByEmail(db, email);
if (!user) {
  console.error(`User not found: ${email}`);
  process.exit(1);
}

const snapshot = await importAppData(db, user.id, incoming);
console.log(
  `Imported ${snapshot.orders.length} orders and ${snapshot.clients.length} clients for ${email}`,
);
