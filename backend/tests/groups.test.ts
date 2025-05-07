import test, { after, before, describe } from "node:test";
import supertest from 'supertest';
import { app } from "../index.js";
import assert from "node:assert/strict";
import 'dotenv/config';
import { getAllUsers, getUserByUsername } from "../repositories/users.js";

const request = supertest(app);

describe('Group routes', () => {
    let token: string;
    let token2: string;
    let user: { userId: string; username: string; hashedPassword: string; createdAt: Date; updatedAt: Date };
    let user2: { userId: string; username: string; hashedPassword: string; createdAt: Date; updatedAt: Date };
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

        res = await request.post('/api/v1/users').send({
            username: 'testuser2',
            password: 'password123'
        });
        assert.strictEqual(res.status, 201);
        const fetchedUser2 = await getUserByUsername('testuser2');
        if (!fetchedUser2) {
            assert.fail('User not found');
        }
        user2 = fetchedUser2;
        res = await request.post('/api/v1/users/login').send({
            username: 'testuser2',
            password: 'password123'
        });
        token2 = res.body.token;
    });
    
    after(async () => {
        const user = await getUserByUsername('testuser');
        if (!user) {
            assert.fail('User not found');
        }
        await request.delete(`/api/v1/users/${user.userId}`).send();
        const user2 = await getUserByUsername('testuser2');
        if (!user2) {
            assert.fail('User not found');
        }
        await request.delete(`/api/v1/users/${user2.userId}`).send();
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

    test('POST /users/:userId/groups returns 400 for bad data', async () => {
        let res = await request.post(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send({});
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'name is required');
        
        res = await request.post(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send({
            name: 'Test Group',
            type: 'Diana'
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'size is required');

        res = await request.post(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send({
            name: 'Test Group',
            size: 5,
            capacity: 5,
            description: 'Test group descripTest group descriTest group descriTest group descriTest group descriTest group descritionTest group descriptionTest group descriptionTest group descriptionTest group descriptionTest group descriptionTest group descriptionTest group description',
            type: 'Diana'
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'description cannot be longer than 255 characters');

        res = await request.post(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send({
            name: 'Test Group',
            description: 'Test group description',
            type: 'badtype',
            size: 5,
            capacity: 5,
        });
        assert.strictEqual(res.status, 400);
        assert.match(res.body.error, /badtype must be one of/);
    });

    test('POST /users/:userId/group returns 201 for valid group creation', async () => {
        let res = await request.post(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send({
            name: 'Test Group',
            description: 'Test group description',
            type: 'Diana',
            size: 5,
            capacity: 5,
        });
        groupId = res.body.groupId;
        assert.strictEqual(res.status, 201);
        assert.deepStrictEqual(res.body.name, 'Test Group');
    });

    test('POST /users/:userId/group returns 400 for user already in a group', async () => {
        let res = await request.post(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send({
            name: 'Test Group',
            description: 'Test group description',
            type: 'Diana',
            size: 5,
            capacity: 5,
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'User already has a group');
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

    test('GET /users/:userId/group returns 200 for a group or null', async () => {
        let res = await request.get(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.name, "Test Group");
    });

    test('PUT /users/:userId/group returns 200 for valid group update', async () => {
        let res = await request.put(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send({
            name: 'Updated Group',
            description: 'new description',
            type: 'Kuudra',
            size: 5,
            capacity: 5,
        });
        assert.strictEqual(res.status, 200);
        assert.deepStrictEqual(res.body.name, 'Updated Group');
    });

    test('PUT /users/:userId/group returns 400/404 for bad data', async () => {
        let res = await request.put(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send({
            name: 'Updated Group',
            description: 'Updated group description',
            type: 'badtype',
            size: 5,
            capacity: 5,
        });
        assert.strictEqual(res.status, 400);
        assert.match(res.body.error, /badtype must be one of/);

        res = await request.put(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send({
            description: 'Updated group description',
            type: 'Kuudra',
            capacity: 5,
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'size is required');

        res = await request.put(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send({
            name: 'Updated Group',
            type: 'Kuudra',
            size: 5,
            capacity: 5,
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'description is required');

        res = await request.put(`/api/v1/users/${user2.userId}/group`).set('Authorization', `Bearer ${token2}`).send({
            name: 'Updated Group',
            description: 'Updated group description',
            type: 'Kuudra',
            size: 5,
            capacity: 5,
        });
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.error, 'Group not found');
    });
    
    test('PUT /users/:userId/group/:groupId returns 200 for valid group join', async () => {
        let res = await request.put(`/api/v1/users/${user2.userId}/group/${groupId}`).set('Authorization', `Bearer ${token2}`).send({});
        assert.strictEqual(res.status, 200);
        assert.deepStrictEqual(res.body.groupId, groupId);
    });

    test('PUT /users/:userId/group/:groupId returns 400 for user already in a group', async () => {
        let res = await request.put(`/api/v1/users/${user2.userId}/group/${groupId}`).set('Authorization', `Bearer ${token2}`).send({});
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'User already has a group');
    });

    test('PUT /users/:userId/group returns 403 for not leader', async () => {
        let res = await request.put(`/api/v1/users/${user2.userId}/group`).set('Authorization', `Bearer ${token2}`).send({
            name: 'Updated Group',
            description: 'Updated group description',
            type: 'Kuudra',
            size: 5,
            capacity: 5,
        });
        assert.strictEqual(res.status, 403);
        assert.strictEqual(res.body.error, 'User is not the leader of the group');
    });

    test('DELETE /users/:userId/group/:groupId returns 200 for valid group leave', async () => {
        let res = await request.delete(`/api/v1/users/${user2.userId}/group/${groupId}`).set('Authorization', `Bearer ${token2}`).send({});
        assert.strictEqual(res.status, 200);
        assert.deepStrictEqual(res.body.groupId, groupId);
    });

    test('DELETE /users/:userId/groups/:groupId returns 200 for valid group deletion', async () => {
        let res = await request.delete(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 200);
        assert.deepStrictEqual(res.body.name, 'Updated Group');
    });

    test('DELETE /users/:userId/groups/:groupId returns 404 for not found id', async () => {
        let res = await request.put(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer badtoken`).send({});
        assert.strictEqual(res.status, 401);

        res = await request.delete(`/api/v1/users/423/group`).set('Authorization', `Bearer ${token}`).send({});
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.error, 'Invalid UUID');

        res = await request.delete(`/api/v1/users/${user.userId}/group`).set('Authorization', `Bearer ${token}`).send({});
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.error, 'Group not found');

    });
});