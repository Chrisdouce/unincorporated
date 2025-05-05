import { Kysely, sql } from "kysely";
export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("friend")
        .addColumn("status", "varchar(255)", col => col.notNull().defaultTo("pending"))
        .addColumn("updatedAt", "timestamp", col => col.defaultTo(sql`now()`).notNull())
        .execute();

}

export async function down(db: Kysely<any>): Promise<void> {
    
}