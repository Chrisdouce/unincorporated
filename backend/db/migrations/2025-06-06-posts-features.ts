import { Kysely, sql } from "kysely";
export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("post")
        .addColumn("title", "varchar(255)", col => col.defaultTo("New Title"))
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("post")
        .dropColumn("title")
        .execute();
}