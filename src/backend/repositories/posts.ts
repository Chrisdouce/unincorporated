import { db } from "../db/db.js";

export type Post = {
    postId: string;
    ownerId: string;
    parentId: string | null;
    content: string;
    createdAt: Date;
    updatedAt: Date;
};

export async function getAllPosts(): Promise<Post[]> {
    return await db
        .selectFrom('post')
        .selectAll()
        .execute();
}

export async function getAllPostsByUserId(userId: string): Promise<Post[]> {
    return await db
        .selectFrom('post')
        .selectAll()
        .where('ownerId', '=', userId)
        .execute();
}

export async function getPostByPostId(postId: string): Promise<Post | null> {
    const result = await db
        .selectFrom('post')
        .selectAll()
        .where('postId', '=', postId)
        .executeTakeFirst();
    return result || null;
}

export async function getAllOriginalPostsByUserId(userId: string): Promise<Post[]> {
    return await db
        .selectFrom('post')
        .selectAll()
        .where('ownerId', '=', userId)
        .where('parentId', '=', null)
        .execute();
}

export async function getAllRepliesByPostId(postId: string): Promise<Post[]> {
    return await db
        .selectFrom('post')
        .selectAll()
        .where('parentId', '=', postId)
        .execute();
}

export async function getAllRepliesByUserId(userId: string): Promise<Post[]> {
    return await db
        .selectFrom('post')
        .selectAll()
        .where('ownerId', '=', userId)
        .where('parentId', '!=', null)
        .execute();
}

export async function createPost(newPost: Omit<Post, 'postId' | 'createdAt' | 'updatedAt'>): Promise<Omit<Post, 'updatedAt'>> {
    const createdPost = await db.transaction().execute(async (trx) => {
        const createdPost = await trx
            .insertInto('post')
            .columns(['ownerId', 'parentId', 'content'])
            .values({ 
                ownerId: newPost.ownerId,
                parentId: newPost.parentId || null as any,
                content: newPost.content,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning(['postId', 'ownerId', 'parentId', 'content', 'createdAt'])
            .executeTakeFirstOrThrow();
        return createdPost;
    });
    return createdPost;
}

export async function updatePost(postId: string, newContent: string) {
    return await db.transaction().execute(async (trx) => {
        return await trx
            .updateTable('post')
            .set({
                content: newContent,
                updatedAt: new Date()
            })
            .where('postId', '=', postId)
            .returning(['postId', 'ownerId', 'parentId', 'content'])
            .executeTakeFirstOrThrow();
    });
}

export async function deletePost(postId: string) {
    const deletedPost = await db.transaction().execute(async (trx) => {
        return await trx
            .deleteFrom('post')
            .where('postId', '=', postId)
            .returning(['postId', 'ownerId', 'parentId', 'content'])
            .execute();
    });
    return deletedPost;
}

export async function deleteAllPostsByUserId(userId: string) {
    const deletedPosts = await db.transaction().execute(async (trx) => {
        return await trx
            .deleteFrom('post')
            .where('ownerId', '=', userId)
            .returning(['postId', 'ownerId', 'parentId', 'content'])
            .execute();
    });
    return deletedPosts;
}

