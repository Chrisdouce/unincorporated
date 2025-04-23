import test, { after, before, describe } from "node:test";
import supertest from 'supertest';
import { app } from "../index.js";
import assert from "node:assert/strict";
import 'dotenv/config';
import { getAllUsers, getUserByUsername } from "../repositories/users.js";

const request = supertest(app);

describe('Team routes', () => {
    let token: string;
    let user: { userId: string; username: string; hashedPassword: string; createdAt: Date; updatedAt: Date };
    let teamId: string;
    before(async () => {
        // Create a test user
        let res = await request.post('/api/v1/users').send({
            username: 'testuser',
            password: 'password123'
        });
        assert.strictEqual(res.status, 201);
        const fetchedUser = await getUserByUsername('testuser');
        if (!fetchedUser) {
            assert.fail('User not found');
        }
        user = fetchedUser;
        res = await request.post('/api/v1/users/login').send({
            username: 'testuser',
            password: 'password123'
        });
        token = res.body.token;
    });
    
    after(async () => {
        const user = await getUserByUsername('testuser');
        if (!user) {
            assert.fail('User not found');
        }
        await request.delete(`/api/v1/users/${user.userId}`).send();
        const users = await getAllUsers();
        if(users && users.length > 0){
            assert.fail('Users still exist in the database');
        }
    });

    test('GET /characters returns all characters allowed in teams', async () => {
        let res = await request.get(`/api/v1/characters`).send();
        assert.strictEqual(res.status, 200);
        assert.ok(res.body.length > 0);
    });

    test('GET /users/:userId/teams returns an empty array', async () => {
        let res = await request.get(`/api/v1/users/${user.userId}/teams`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 200);
        assert.deepStrictEqual(res.body, []);
    });

    test('POST /users/:userId/teams returns 201 for valid team creation', async () => {
        let res = await request.post(`/api/v1/users/${user.userId}/teams`).set('Authorization', `Bearer ${token}`).send({
            name: 'Test Team',
            characters: ['Ironman', 'Hela', 'Hulk', 'Hawkeye', 'Groot', 'Emma Frost']
        });
        teamId = res.body.teamId;
        assert.strictEqual(res.status, 201);
        assert.deepStrictEqual(res.body.name, 'Test Team');
    });

    test('POST /users/:userId/teams returns 400 for bad data', async () => {
        let res = await request.post(`/api/v1/users/${user.userId}/teams`).set('Authorization', `Bearer ${token}`).send({});
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'name is required');

        res = await request.post(`/api/v1/users/${user.userId}/teams`).set('Authorization', `Bearer ${token}`).send({
            name: 'Test Team',
            characters: 'Ironman'
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'characters must be an array');

        res = await request.post(`/api/v1/users/${user.userId}/teams`).set('Authorization', `Bearer ${token}`).send({
            name: 'Test Team',
            characters: ['Ironman']
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'characters must contain exactly 6 characters');

        res = await request.post(`/api/v1/users/${user.userId}/teams`).set('Authorization', `Bearer ${token}`).send({
            name: 'Test Team',
            characters: ['Ironman', 'Hela', 'Hulk', 'Hawkeye', 'Groot', 'batman']
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'batman is not a playable character');
    });

    test('GET /users/:userId/teams returns 200 for multiple teams', async () => {
        await request.post(`/api/v1/users/${user.userId}/teams`).set('Authorization', `Bearer ${token}`).send({
            name: 'Test Team 2',
            characters: ['Thor', 'Loki', 'Black Widow', 'Captain America', 'Doctor Strange', 'Scarlet Witch']
        });
        let res = await request.get(`/api/v1/users/${user.userId}/teams`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.length, 2);
        assert.strictEqual(res.body[0].name, "Test Team");
        assert.strictEqual(res.body[1].name, "Test Team 2");
    });

    test('GET /users/:userId/teams/:teamId returns 200 for a team', async () => {
        let res = await request.get(`/api/v1/users/${user.userId}/teams/${teamId}`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.name, "Test Team");
    });

    test('PUT /users/:userId/teams/:teamId returns 200 for valid team update', async () => {
        let res = await request.put(`/api/v1/users/${user.userId}/teams/${teamId}`).set('Authorization', `Bearer ${token}`).send({
            name: 'Updated Team',
            characters: ['Thor', 'Loki', 'Black Widow', 'Captain America', 'Doctor Strange', 'Scarlet Witch']
        });
        assert.strictEqual(res.status, 200);
        assert.deepStrictEqual(res.body.name, 'Updated Team');
    });

    test('PUT /users/:userId/teams/:teamId returns 400 for bad data', async () => {
        let res = await request.put(`/api/v1/users/${user.userId}/teams/${teamId}`).set('Authorization', `Bearer badtoken`).send({
            name: 'Updated Team',
            characters: ['Thor', 'Loki', 'Black Widow', 'Captain America', 'Doctor Strange']
        });
        assert.strictEqual(res.status, 401);

        res = await request.put(`/api/v1/users/${user.userId}/teams/${teamId}`).set('Authorization', `Bearer ${token}`).send({});
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'name is required');

        res = await request.put(`/api/v1/users/${user.userId}/teams/${teamId}`).set('Authorization', `Bearer ${token}`).send({
            name: 'Updated Team',
            characters: 'Ironman'
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'characters must be an array');

        res = await request.put(`/api/v1/users/${user.userId}/teams/${teamId}`).set('Authorization', `Bearer ${token}`).send({
            name: 'Updated Team',
            characters: ['Ironman']
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'characters must contain exactly 6 characters');

        res = await request.put(`/api/v1/users/${user.userId}/teams/${teamId}`).set('Authorization', `Bearer ${token}`).send({
            name: 'Updated Team',
            characters: ['Ironman', 'Hela', 'Hulk', 'Hawkeye', 'Groot', 'batman']
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'batman is not a playable character');
    });

    test('DELETE /users/:userId/teams/:teamId returns 200 for valid team deletion', async () => {
        let res = await request.delete(`/api/v1/users/${user.userId}/teams/${teamId}`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 200);
        assert.deepStrictEqual(res.body.name, 'Updated Team');
    });

    test('DELETE /users/:userId/teams/:teamId returns 404 for not found id', async () => {
        let res = await request.put(`/api/v1/users/${user.userId}/teams/${teamId}`).set('Authorization', `Bearer badtoken`).send({});
        assert.strictEqual(res.status, 401);

        res = await request.delete(`/api/v1/users/${user.userId}/teams/bad`).set('Authorization', `Bearer ${token}`).send({});
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.error, 'Invalid UUID');

        res = await request.delete(`/api/v1/users/${user.userId}/teams/${user.userId}`).set('Authorization', `Bearer ${token}`).send({});
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.error, 'Team not found');

    });
});