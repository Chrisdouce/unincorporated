import test, { describe } from "node:test";
import supertest from 'supertest';
import { app } from "../index.js";
import assert from "node:assert/strict";
import 'dotenv/config';
import { getUserByUsername } from "../repositories/users.js";

const request = supertest(app);

describe('User routes', () => {
    //ENV secret
    const secret = process.env.SUPER_USER_SECRET;
    if (!secret) {
        throw new Error('SUPER_USER_SECRET is not defined in .env file');
    }

    test('GET /users returns an empty array', async () => {
        const res = await request.get('/admin/v1/users').send();
        assert.strictEqual(res.status, 200);
        assert.deepStrictEqual(res.body, []);
    });

    test('POST /users creates a new user', async () => {
        const res = await request.post('/admin/v1/users').send({
            username: 'testuser',
            password: 'password123'
        });
        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.username, 'testuser');
    });

    test('GET /users/:userId returns the created user', async () => {
        const newUser = await request.post('/admin/v1/users').send({
            username: 'testuser2',
            password: 'password123'
        });
        const res = await request.get(`/admin/v1/users/${newUser.body.userId}`).send();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.username, 'testuser2');
    });

    test('GET /users returns two users', async () => {
        const res = await request.get('/admin/v1/users').send();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.length, 2);
        assert.strictEqual(res.body[0].username, 'testuser');
        assert.strictEqual(res.body[1].username, 'testuser2');
    });

    test('GET /users/:userId returns 404 for non-existent user', async () => {
        const res = await request.get('/admin/v1/users/nonexistent').send();
        assert.strictEqual(res.status, 404);
    });

    test('PUT /users/:userId updates the user', async () => {
        const res = await request.put('/admin/v1/users/testuser').send({
            username: 'updateduser',
            password: 'newpassword123',
            superUserSecret: secret
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.username, 'updateduser');
    });

    test('DELETE /users/:userId deletes the user', async () => {
        const res = await request.delete('/admin/v1/users/testuser').send({
            superUserSecret: secret
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.username, 'updateduser');
    });

    test('GET /users returns an empty array after deletion', async () => {
        const res = await request.get('/admin/v1/users').send();
        assert.strictEqual(res.status, 200);
        assert.deepStrictEqual(res.body, []);
    });

    test('POST /users/login returns 401 for invalid credentials', async () => {
        const res = await request.post('/admin/v1/users/login').send({
            username: 'invaliduser',
            password: 'wrongpassword'
        });
        assert.strictEqual(res.status, 401);
    });

    test('POST /users/login returns 200 for valid credentials', async () => {
        const res = await request.post('/admin/v1/users/login').send({
            username: 'updateduser',
            password: 'newpassword123'
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.username, 'updateduser');
    });




});