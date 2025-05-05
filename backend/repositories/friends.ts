import { db } from "../db/db.js";

//FriendA is the sender of the request, FriendB is the receiver of the request
export type Friend = {
    friendAId: string;
    friendBId: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
};

/*
    Friends Table
*/
export async function getAllFriendsByUserId(userId: string): Promise<Friend[] | null> {
    let friends = await db
        .selectFrom('friend')
        .selectAll()
        .where('friend.friendAId', '=', userId)
        .execute();
    friends.push(
            ...(await db
            .selectFrom('friend')
            .selectAll()
            .where('friend.friendBId', '=', userId)
            .execute())
        );
    return friends;
}

export async function getFriendByUserId(userId: string, friendId: string): Promise<Friend | null> {
    let friend = await db
        .selectFrom('friend')
        .selectAll()
        .where('friend.friendAId', '=', userId)
        .where('friend.friendBId', '=', friendId)
        .executeTakeFirst();
    if (!friend) {
        friend = await db
            .selectFrom('friend')
            .selectAll()
            .where('friend.friendAId', '=', friendId)
            .where('friend.friendBId', '=', userId)
            .executeTakeFirst();
    }
    return friend as Friend || null;
}

export async function getAllPendingFriendsForUser(userId: string): Promise<Friend[] | null> {
    const pendingFriends = await db
        .selectFrom('friend')
        .selectAll()
        .where('friendBId', '=', userId)
        .where('status', '=', 'pending')
        .execute();
        
    return pendingFriends || null;
}

export async function addFriend(senderId: string, receiverId: string): Promise<Friend> {
    const friend = await db.transaction().execute(async (trx) => {
        return await trx
            .insertInto('friend')
            .values({
                friendAId: senderId,
                friendBId: receiverId,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning(['friendAId', 'friendBId', 'status', 'createdAt', 'updatedAt'])
            .executeTakeFirstOrThrow();
    });
    return friend;
}

export async function updateFriend(receiverId: string, senderId: string, status: string): Promise<Friend> {
    const friend = await db.transaction().execute(async (trx) => {
        return await trx
            .updateTable('friend')
            .set({
                status: status,
                updatedAt: new Date()
            })
            .where('friendAId', '=', senderId)
            .where('friendBId', '=', receiverId)
            .returning(['friendAId', 'friendBId', 'status', 'createdAt', 'updatedAt'])
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
            .returning(['friendAId', 'friendBId', 'status', 'createdAt', 'updatedAt'])
            .executeTakeFirst();
        if (!deletedFriend) {
            deletedFriend = await trx
                .deleteFrom('friend')
                .where('friendAId', '=', friendId)
                .where('friendBId', '=', userId)
                .returning(['friendAId', 'friendBId', 'status', 'createdAt', 'updatedAt'])
                .executeTakeFirstOrThrow();
        }
        return deletedFriend;
    });
    return friend || null;
}
