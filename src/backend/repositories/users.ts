import { randomUUID } from "crypto";
import { db } from "../db/db.js";

export type User = {
    userId: string;
    username: string;
    hashedPassword: string;
    createdAt: Date;
    updatedAt: Date;
};

export async function getAllUsers(): Promise<Omit<User, 'hashedPassword'>[] | null> {
    const users = await db
        .selectFrom('user')
        .select(['userId', 'username', 'createdAt', 'updatedAt'])
        .execute();
    return users;
}

export async function getUserById(userId: string): Promise<User | null> {
    const user = await db
        .selectFrom('user')
        .selectAll()
        .where('userId', '=', userId)
        .executeTakeFirst();
    return user || null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
    const user = await db
        .selectFrom('user')
        .selectAll()
        .where('username', '=', username)
        .executeTakeFirst();
    return user || null;
}

export async function createUser(newUser: Omit<User, 'userId' | 'createdAt' | 'updatedAt'>): Promise<Omit<User, 'hashedPassword' | 'updatedAt'>> {
    const createdUser = await db.transaction().execute(async (trx) => {
        const createdUser = await trx
            .insertInto('user')
            .columns(['username'])
            .values({ 
                username: newUser.username,
                hashedPassword: newUser.hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning(['userId', 'username', 'createdAt'])
            .executeTakeFirstOrThrow();
        return createdUser;
    });
    return createdUser;
}

export async function updateUser(userId: string, newUsername: string, newHashedPassword: string) {
    return await db.transaction().execute(async (trx) => {
        return await trx
            .updateTable('user')
            .set({
                username: newUsername,
                hashedPassword: newHashedPassword,
                updatedAt: new Date()
            })
            .where('userId', '=', userId)
            .returning(['userId', 'username'])
            .executeTakeFirstOrThrow();
    });
}

export async function deleteUser(userId: string) {
    await db.transaction().execute(async (trx) => {
        return await trx
            .deleteFrom('user')
            .where('userId', '=', userId)
            .execute();
    });
    return userId;
}

export async function getAllFriendsByUserId(userId: string): Promise<Omit<User, 'hashedPassword'>[] | null> {
    const friends = await db
        .selectFrom('friend')
        .innerJoin('user', 'friend.friendBId', 'user.userId')
        .select(['user.userId', 'user.username', 'user.createdAt', 'user.updatedAt'])
        .where('friend.friendAId', '=', userId)
        .execute();
    return friends;
}

export async function addFriend(userId: string, friendId: string) {
    const friend = await db.transaction().execute(async (trx) => {
        return await trx
            .insertInto('friend')
            .values({
                friendAId: userId,
                friendBId: friendId,
                createdAt: new Date()
            })
            .returning(['friendAId', 'friendBId'])
            .executeTakeFirstOrThrow();
    });
    return friend;
}

export async function removeFriend(userId: string, friendId: string) {
    const friend = await db.transaction().execute(async (trx) => {
        return await trx
            .deleteFrom('friend')
            .where('friendAId', '=', userId)
            .where('friendBId', '=', friendId)
            .executeTakeFirstOrThrow();
    });
    return friend;
}