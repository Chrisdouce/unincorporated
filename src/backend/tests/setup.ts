import { NO_MIGRATIONS } from "kysely";
import { migrator } from "../db/migrate.js";
import { db } from "../db/db.js";

await migrator.migrateTo(NO_MIGRATIONS);
await migrator.migrateToLatest();
await db.destroy();
