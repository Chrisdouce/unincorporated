import { sql } from "kysely";
import { db } from "../db/db.js";

export type Group = {
    groupId: string;
    leaderId: string;
    name: string;
    description: string;
    type: string;
    size: number;
    capacity: number;
    createdAt: Date;
    updatedAt: Date;
};

export async function getAllGroups(): Promise<Group[]> {
    const groups = await db
        .selectFrom('group')
        .selectAll()
        .execute();
    return groups;
}

export async function getGroupByUserId(userId: string): Promise<Group | null> {
    const group = await db
        .selectFrom('user')
        .select('user.groupId')
        .where('user.userId', '=', userId)
        .executeTakeFirst();
    if (!group) {
        return null;
    }
    const groupId = group.groupId;
    const groupDetails = await db
        .selectFrom('group')
        .selectAll()
        .where('group.groupId', '=', groupId)
        .executeTakeFirst();
    if (!groupDetails) {
        return null;
    }
    return groupDetails as Group;
}

export async function getGroupByGroupId(groupId: string): Promise<Group | null> {
    const group = await db
        .selectFrom('group')
        .selectAll()
        .where('group.groupId', '=', groupId)
        .executeTakeFirst();
    return group || null;
}

export async function getGroupByLeaderId(leaderId: string): Promise<Group | null> {
    const group = await db
        .selectFrom('group')
        .selectAll()
        .where('group.leaderId', '=', leaderId)
        .executeTakeFirst();
    return group || null;
}

export async function getAllGroupsByType(type: string): Promise<Group[] | null> {
    const group = await db
        .selectFrom('group')
        .selectAll()
        .where('group.type', '=', type)
        .execute();
    return group || null;
}

export async function getAllGroupsByName(name: string): Promise<Group[] | null> {
    const group = await db
        .selectFrom('group')
        .selectAll()
        .where('group.name', '=', name)
        .execute();
    return group || null;
}

export async function createGroup(group: Omit<Group, 'groupId' | 'createdAt' | 'updatedAt'>): Promise<Group>{
    const createdGroup = await db.transaction().execute(async (trx) => {
        const createdGroup = await trx
            .insertInto('group')
            .values({ 
                leaderId: group.leaderId as any,
                name: group.name,
                description: group.description,
                type: group.type,
                size: group.size,
                capacity: group.capacity,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning(['groupId', 'leaderId', 'name', 'description', 'type', 'size', 'capacity', 'createdAt', 'updatedAt'])
            .executeTakeFirstOrThrow();

        await trx
            .updateTable('user')
            .set({ 
                groupId: createdGroup.groupId
            })
            .where('userId', '=', group.leaderId)
            .executeTakeFirstOrThrow();
        return createdGroup as Group;
    });

    await db.transaction().execute(async (trx) => {
        await trx
            .updateTable('user')
            .set({ 
                groupId: createdGroup.groupId
            })
            .where('userId', '=', createdGroup.leaderId)
            .executeTakeFirstOrThrow();
    });
    return createdGroup;
}

export async function updateGroup(group: Omit<Group, 'createdAt' | 'updatedAt'>): Promise<Group>{
    const updatedGroup = await db.transaction().execute(async (trx) => {
        const updatedGroup = await trx
            .updateTable('group')
            .set({
                leaderId: group.leaderId as any,
                name: group.name,
                description: group.description,
                type: group.type,
                updatedAt: new Date()
            })
            .where('groupId', '=', group.groupId)
            .returningAll()
            .executeTakeFirstOrThrow();
        return updatedGroup;
    })
    return updatedGroup;
}

export async function deleteGroup(groupId: string): Promise<Group> {
    const deletedGroup = await db.transaction().execute(async (trx) => {
        const deletedGroup = await trx
            .deleteFrom('group')
            .where('groupId', '=', groupId)
            .returningAll()
            .executeTakeFirstOrThrow();
        return deletedGroup;
    })
    return deletedGroup;
}

export async function addUserToGroup(userId: string, groupId: string): Promise<string> {
    await db.transaction().execute(async (trx) => {
        await trx
            .updateTable('user')
            .set({ 
                groupId: groupId
            })
            .where('userId', '=', userId)
            .execute();

        await trx
            .updateTable('group')
            .set({ size: sql`size + 1` })
            .where('groupId', '=', groupId)
            .execute();
    });
    return groupId;
}

export async function removeUserFromGroup(userId: string, groupId: string): Promise<string> {
    await db.transaction().execute(async (trx) => {
        await trx
            .updateTable('user')
            .set({ 
                groupId: null as unknown as string
            })
            .where('userId', '=', userId)
            .where('groupId', '=', groupId)
            .execute();
    });
    return groupId;
}