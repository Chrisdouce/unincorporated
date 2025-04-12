import { Kysely, sql } from "kysely";
export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("user")
        .addColumn("points", "integer", col => col.notNull().defaultTo(0))
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("user")
        .dropColumn("points")
        .execute();
}