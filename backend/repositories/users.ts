import { db } from "../db/db.js";

export type User = {
    userId: string;
    username: string;
    hashedPassword: string;
    createdAt: Date;
    updatedAt: Date;
    groupId: string | null;
};

export type Friend = {
    friendAId: string;
    friendBId: string;
}

export type Settings = {
    userId: string;
    darkMode: boolean;
    ign: string;
}

export async function getAllUsers(): Promise<Omit<User, 'hashedPassword'>[] | null> {
    const users = await db
        .selectFrom('user')
        .select(['userId', 'username', 'groupId', 'createdAt', 'updatedAt'])
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

export async function createUser(newUser: Omit<User, 'userId' | 'groupId' | 'createdAt' | 'updatedAt'>): Promise<Omit<User, 'hashedPassword' | 'updatedAt'>> {
    const createdUser = await db.transaction().execute(async (trx) => {
        const createdUser = await trx
            .insertInto('user')
            .columns(['username'])
            .values({ 
                username: newUser.username,
                hashedPassword: newUser.hashedPassword,
                groupId: null,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning(['userId', 'username', 'groupId', 'createdAt'])
            .executeTakeFirstOrThrow();
        try{
            
        const settings = await trx
            .insertInto('settings')
            .values({
                userId: createdUser.userId,
                darkMode: false,
                ign: ''
            })
            .executeTakeFirstOrThrow();
        
    }catch (error) {
        console.error('Error creating settings:', error);
    }
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
    const deletedUser = await db.transaction().execute(async (trx) => {
        return await trx
            .deleteFrom('user')
            .where('userId', '=', userId)
            .returning(['userId', 'username'])
            .execute();
    });
    await db.transaction().execute(async (trx) => {
        await trx
            .deleteFrom('friend')
            .where('friendAId', '=', userId)
            .execute();
        await trx
            .deleteFrom('friend')
            .where('friendBId', '=', userId)
            .execute();
    });
    return deletedUser || null;
}

/*
    Friends Table
*/
export async function getAllFriendsByUserId(userId: string): Promise<Omit<User, 'hashedPassword'>[] | null> {
    let friends = await db
        .selectFrom('friend')
        .innerJoin('user', 'friend.friendBId', 'user.userId')
        .select(['user.userId', 'user.username', 'user.groupId', 'user.createdAt', 'user.updatedAt'])
        .where('friend.friendAId', '=', userId)
        .execute();
    friends.push(
            ...(await db
            .selectFrom('friend')
            .innerJoin('user', 'friend.friendAId', 'user.userId')
            .select(['user.userId', 'user.username', 'user.groupId', 'user.createdAt', 'user.updatedAt'])
            .where('friend.friendBId', '=', userId)
            .execute())
        );
    return friends;
}

export async function getFriendByUserId(userId: string, friendId: string): Promise<Omit<User, 'hashedPassword'> | null> {
    let friend = await db
        .selectFrom('friend')
        .innerJoin('user', 'friend.friendBId', 'user.userId')
        .select(['user.userId', 'user.username', 'user.groupId', 'user.createdAt', 'user.updatedAt'])
        .where('friend.friendAId', '=', userId)
        .where('friend.friendBId', '=', friendId)
        .executeTakeFirst();
    if (!friend) {
        friend = await db
            .selectFrom('friend')
            .innerJoin('user', 'friend.friendAId', 'user.userId')
            .select(['user.userId', 'user.username', 'user.groupId', 'user.createdAt', 'user.updatedAt'])
            .where('friend.friendBId', '=', friendId)
            .where('friend.friendAId', '=', userId)
            .executeTakeFirst();
    }
    return friend || null;
}

export async function addFriend(friendAId: string, friendBId: string): Promise<Friend> {
    const friend = await db.transaction().execute(async (trx) => {
        return await trx
            .insertInto('friend')
            .values({
                friendAId: friendAId,
                friendBId: friendBId,
                createdAt: new Date()
            })
            .returning(['friendAId', 'friendBId'])
            .executeTakeFirstOrThrow();
    });
    return friend;
}

export async function removeFriend(userId: string, friendId: string): Promise<Friend> {
    const friend = await db.transaction().execute(async (trx) => {
        let deletedFriend = await trx
            .deleteFrom('friend')
            .where('friendAId', '=', userId)
            .where('friendBId', '=', friendId)
            .returning(['friendAId', 'friendBId'])
            .executeTakeFirstOrThrow();
        if (!deletedFriend) {
            deletedFriend = await trx
                .deleteFrom('friend')
                .where('friendAId', '=', friendId)
                .where('friendBId', '=', userId)
                .returning(['friendAId', 'friendBId'])
                .executeTakeFirstOrThrow();
        }
        return deletedFriend;
    });
    return friend || null;
}

/*
    Settings Table
*/
export async function getUserSettings(userId: string): Promise<Settings | null> {
    const settings = await db
        .selectFrom('settings')
        .selectAll()
        .where('userId', '=', userId)
        .executeTakeFirst();
    return settings || null;
}

export async function updateUserSettings(userSettings: Settings): Promise<Settings> {
    const settings = await db.transaction().execute(async (trx) => {
        return await trx
            .updateTable('settings')
            .set({
                darkMode: userSettings.darkMode,
                ign: userSettings.ign,
            })
            .where('userId', '=', userSettings.userId)
            .returning(['userId', 'ign', 'darkMode'])
            .executeTakeFirstOrThrow();
    });
    return settings;
}