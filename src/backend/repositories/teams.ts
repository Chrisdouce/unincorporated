import { db } from "../db/db.js";

export type Team = {
    teamId: string;
    userId: string;
    name: string;
    characters: string[];
    createdAt: Date;
    updatedAt: Date;
};

export async function getAllTeams(): Promise<Team[]> {
    return await db
        .selectFrom('team')
        .selectAll()
        .execute();
}

export async function getTeamByTeamId(teamId: string): Promise<Team | null> {
    const team = await db
        .selectFrom('team')
        .selectAll()
        .where('team.teamId', '=', teamId)
        .executeTakeFirst();
    return team || null;
}

export async function getAllTeamsByUserId(userId: string): Promise<Team[] | null> {
    const teams = await db
        .selectFrom('team')
        .selectAll()
        .where('team.userId', '=', userId)
        .execute()
    return teams || null;
}

export async function createTeam(team: Omit<Team, 'teamId' | 'createdAt' | 'updatedAt'>): Promise<Team>{
    const createdTeam = await db.transaction().execute(async (trx) => {
        const createdTeam = await trx
            .insertInto('team')
            .values({ 
                userId: team.userId,
                name: team.name,
                characters: team.characters,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning(['teamId', 'userId', 'name', 'characters', 'createdAt', 'updatedAt'])
            .executeTakeFirstOrThrow();
        return createdTeam;
    });
    return createdTeam;
}

export async function updateTeam(team: Omit<Team, 'userId' | 'teamId' | 'createdAt' | 'updatedAt'>): Promise<Team>{
    const updatedTeam = await db.transaction().execute(async (trx) => {
        const updatedTeam = await trx
            .updateTable('team')
            .where('teamId', '=', 'team.teamId')
            .set({
                name: team.name,
                characters: team.characters,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning(['teamId', 'userId', 'name', 'characters', 'createdAt', 'updatedAt'])
            .executeTakeFirstOrThrow();
        return updatedTeam;
    })
    return updatedTeam;
}

export async function deleteTeam(teamId: string): Promise<Team> {
    const deletedTeam = await db.transaction().execute(async (trx) => {
        const deletedTeam = await trx
            .deleteFrom('team')
            .where('teamId', '=', teamId)
            .returning(['teamId', 'userId', 'name', 'characters', 'createdAt', 'updatedAt'])
            .executeTakeFirstOrThrow();
        return deletedTeam;
    })
    return deletedTeam;
}