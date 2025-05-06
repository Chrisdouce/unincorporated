import { Kysely } from "kysely";
export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("settings")
        .addColumn("userId", "uuid", col => col.notNull().references("user.userId").onDelete("cascade"))
        .addColumn("ign", "varchar(255)", col => col.notNull().defaultTo(""))
        .addColumn("darkMode", "boolean", col => col.notNull().defaultTo(false))
        .addColumn("minecraftUUID", "uuid", col => col.defaultTo(null))
        .execute();
    
    await db.schema
        .alterTable("group")
        .addColumn("size", "integer", col => col.notNull().defaultTo(2))
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
        .alterTable("group")
        .dropColumn("size")
        .execute();
    await db.schema
        .dropTable("settings")
        .execute();
}