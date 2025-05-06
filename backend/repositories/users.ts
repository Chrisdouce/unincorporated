import { db } from "../db/db.js";

export type User = {
    userId: string;
    username: string;
    hashedPassword: string;
    createdAt: Date;
    updatedAt: Date;
    groupId: string | null;
};

export type Settings = {
    userId: string;
    darkMode: boolean;
    ign: string;
    minecraftUUID: string | null;
};

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
                ign: '',
                minecraftUUID: null
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
                minecraftUUID: userSettings.minecraftUUID
            })
            .where('userId', '=', userSettings.userId)
            .returning(['userId', 'ign', 'darkMode', 'minecraftUUID'])
            .executeTakeFirstOrThrow();
    });
    return settings;
}