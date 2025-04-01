import { Kysely, sql } from "kysely";
export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable("user")
        .addColumn("userId", "uuid", col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("username", "varchar(255)", col => col.notNull().unique())
        .addColumn('hashedPassword', 'varchar(255)', col => col.notNull())
        .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
        .execute();
    await db.schema
        .createTable("friend")
        .addColumn("friendAId", "uuid", col => col.notNull().references('user.userId').onUpdate('cascade').onDelete('cascade'))
        .addColumn('friendBId', 'uuid', col => col.notNull().references('user.userId').onUpdate('cascade').onDelete('cascade'))
        .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
        .execute();
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
        .createTable("post")
        .addColumn("postId", "uuid", col => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
        .addColumn("ownerId", "uuid", col => { return col.notNull().references('user.userId').onUpdate('cascade').onDelete('cascade') })
        .addColumn('parentId', 'uuid' , col => col.references('post.postId').onUpdate('cascade').onDelete('cascade'))
        .addColumn('content', 'text', col => col.notNull())
        .addColumn('createdAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
        .addColumn('updatedAt', 'timestamp', col => col.defaultTo(sql`now()`).notNull())
        .execute();
    await db.schema
        .createTable("reaction")
        .addColumn("postId", "uuid", col => col.notNull().references('post.postId').onUpdate('cascade').onDelete('cascade'))
        .addColumn('userId', 'uuid', col => col.notNull().references('user.userId').onUpdate('cascade').onDelete('cascade'))
        .addColumn('type', 'varchar(255)', col => col.notNull())
        .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable("reaction").execute();
    await db.schema.dropTable("post").execute();
    await db.schema.dropTable("team").execute();
    await db.schema.dropTable("friend").execute();
    await db.schema.dropTable("user").execute();
}