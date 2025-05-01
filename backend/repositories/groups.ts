import { db } from "../db/db.js";
import { up } from "../db/migrations/2025-03-20-initial-schema.js";

export type Group = {
    groupId: string;
    leaderId: string;
    name: string;
    description: string;
    type: string;
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

export async function getGroupByGroupId(groupId: string): Promise<Group | null> {
    const group = await db
        .selectFrom('group')
        .selectAll()
        .where('group.groupId', '=', groupId)
        .executeTakeFirst();
    return group || null;
}

export async function getGroupByLeaderId(leaderId: string): Promise<Group[] | null> {
    const groups = await db
        .selectFrom('group')
        .selectAll()
        .where('group.leaderId', '=', leaderId)
        .execute()
    return groups || null;
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
                leaderId: group.leaderId,
                name: group.name,
                description: group.description,
                type: group.type,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning(['groupId', 'leaderId', 'name', 'description', 'type', 'createdAt', 'updatedAt'])
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
    }
    return createdGroup;
}

export async function updateGroup(group: Omit<Group, 'leaderId' | 'createdAt' | 'updatedAt'>): Promise<Group>{
    const updatedGroup = await db.transaction().execute(async (trx) => {
        const updatedGroup = await trx
            .updateTable('group')
            .set({
                name: group.name,
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