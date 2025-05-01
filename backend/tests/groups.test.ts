import test, { after, before, describe } from "node:test";
import supertest from 'supertest';
import { app } from "../index.js";
import assert from "node:assert/strict";
import 'dotenv/config';
import { getAllUsers, getUserByUsername } from "../repositories/users.js";

const request = supertest(app);

describe('Group routes', () => {
    let token: string;
    let user: { userId: string; username: string; hashedPassword: string; createdAt: Date; updatedAt: Date };
    let groupId: string;
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

    test('GET /groups returns an empty array', async () => {
        let res = await request.get(`/api/v1/groups`).send();
        assert.strictEqual(res.status, 200);
        assert.deepStrictEqual(res.body, []);
    });

    test('POST /users/:userId/group returns 201 for valid group creation', async () => {
        let res = await request.post(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send({
            name: 'Test Group',
            description: 'Test group description',
            type: 'Diana'
        });
        groupId = res.body.groupId;
        assert.strictEqual(res.status, 201);
        assert.deepStrictEqual(res.body.name, 'Test Group');
    });

    test('POST /users/:userId/groups returns 400 for bad data', async () => {
        let res = await request.post(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send({});
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'name is required');
        
        res = await request.post(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send({
            name: 'Test Group',
            type: 'Diana'
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'description is required');

        res = await request.post(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send({
            name: 'Test Group',
            description: 'Test group descripTest group descriTest group descriTest group descriTest group descriTest group descritionTest group descriptionTest group descriptionTest group descriptionTest group descriptionTest group descriptionTest group descriptionTest group description',
            type: 'Diana'
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'description cannot be longer than 255 characters');

        res = await request.post(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send({
            name: 'Test Group',
            description: 'Test group description',
            type: 'badtype'
        });
        assert.strictEqual(res.status, 400);
        assert.match(res.body.error, /badtype must be one of/);
    });

    test('GET /groups/:groupId returns 200 for valid id', async () => {
        let res = await request.get(`/api/v1/groups/${groupId}`).send();
        assert.strictEqual(res.status, 200);
        assert.deepStrictEqual(res.body.name, 'Test Group');
    });

    test('GET /groups/:groupId returns 404 for not found id', async () => {
        let res = await request.get(`/api/v1/groups/bad`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.error, 'Invalid UUID');

        res = await request.get(`/api/v1/groups/${user.userId}`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.error, 'Group not found');
    });

    test('GET /groups/type/:type returns 200 for valid type', async () => {
        let res = await request.get(`/api/v1/groups/type/Diana`).send();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body[0].type, 'Diana');
    });

    test('GET /groups/type/:type returns 404 for not found type', async () => {
        let res = await request.get(`/api/v1/groups/type/bad`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.error, 'No groups found with the specified type');
    });

    test('GET /groups/name/:name returns 200 for valid name', async () => {
        let res = await request.get(`/api/v1/groups/name/Test Group`).send();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body[0].name, 'Test Group');
    });

    test('GET /groups/name/:name returns 404 for not found name', async () => {
        let res = await request.get(`/api/v1/groups/name/bad`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.error, 'No groups found with the specified name');
    });

    test('GET /users/:userId/group returns 200 for user in group', async () => {
        let res = await request.get(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.length, 2);
        assert.strictEqual(res.body.name, "Test Group");
    });

    test('GET /users/:userId/group returns a group or null', async () => {
        let res = await request.get(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.name, "Test Group");
    });

    test('PUT /users/:userId/group returns 200 for valid group update', async () => {
        let res = await request.put(`/api/v1/users/${user.userId}/groups/${groupId}`).set('Authorization', `Bearer ${token}`).send({
            name: 'Updated Group',
            characters: ['Thor', 'Loki', 'Black Widow', 'Captain America', 'Doctor Strange', 'Scarlet Witch']
        });
        assert.strictEqual(res.status, 200);
        assert.deepStrictEqual(res.body.name, 'Updated Group');
    });

    test('PUT /users/:userId/group returns 400 for bad data', async () => {
        let res = await request.put(`/api/v1/users/${user.userId}/groups/${groupId}`).set('Authorization', `Bearer ${token}`).send({
            name: 'Updated Group',
            description: 'Updated group description',
            type: 'badtype'
        });
        assert.strictEqual(res.status, 400);
        assert.match(res.body.error, /badtype must be one of/);
    });

    test('DELETE /users/:userId/groups/:groupId returns 200 for valid group deletion', async () => {
        let res = await request.delete(`/api/v1/users/${user.userId}/groups/${groupId}`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 200);
        assert.deepStrictEqual(res.body.name, 'Updated Group');
    });

    test('DELETE /users/:userId/groups/:groupId returns 404 for not found id', async () => {
        let res = await request.put(`/api/v1/users/${user.userId}/groups/${groupId}`).set('Authorization', `Bearer badtoken`).send({});
        assert.strictEqual(res.status, 401);

        res = await request.delete(`/api/v1/users/${user.userId}/groups/bad`).set('Authorization', `Bearer ${token}`).send({});
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.error, 'Invalid UUID');

        res = await request.delete(`/api/v1/users/${user.userId}/groups/${user.userId}`).set('Authorization', `Bearer ${token}`).send({});
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.error, 'Group not found');

    });
});