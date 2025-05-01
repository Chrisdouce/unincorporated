import { Kysely, sql } from "kysely";
export async function up(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("team").execute();
    await db.schema.createTable("group")
        .addColumn("groupId", "uuid", col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("leaderId", "uuid", col => col.notNull().references('user.userId').onUpdate('cascade').onDelete('cascade'))
        .addColumn('name', 'varchar(255)', col => col.notNull())
        .addColumn('type', 'varchar(255)', col => col.notNull())
        .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
        .execute();
    await db.schema.alterTable("user")
        .addColumn("groupId", "uuid", col => col.references('group.groupId').onUpdate('cascade').onDelete('set null'))
        .execute();

}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema
            .createTable("team")
            .addColumn("teamId", "uuid", col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
            .addColumn("userId", "uuid", col => col.notNull().references('user.userId').onUpdate('cascade').onDelete('cascade'))
            .addColumn('name', 'varchar(255)', col => col.notNull())
            .addColumn('characters', sql`varchar(255)[]`, col => col.notNull())
            .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
            .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
            .execute();
    await db.schema
        .alterTable("user")
        .dropColumn("groupId")
        .execute();
    await db.schema.dropTable("group").execute();
}