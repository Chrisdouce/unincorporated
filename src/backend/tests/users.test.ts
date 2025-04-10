import test, { describe } from "node:test";
import supertest from 'supertest';
import { app } from "../index.js";
import assert from "node:assert/strict";
import 'dotenv/config';
import { getUserByUsername } from "../repositories/users.js";
import jwt from 'jsonwebtoken';

const request = supertest(app);

describe('User routes', () => {
    test('GET /users returns an empty array', async () => {
        const res = await request.get('/api/v1/users').send();
        assert.strictEqual(res.status, 200);
        assert.deepStrictEqual(res.body, []);
    });

    test('POST /users creates a new user', async () => {
        const res = await request.post('/api/v1/users').send({
            username: 'testuser',
            password: 'password123'
        });
        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.username, 'testuser');
    });

    test('POST /users returns 400 for bad data', async () => {
        let res = await request.post('/api/v1/users').send({});
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'username is required');

        res = await request.post('/api/v1/users').send({
            username: 'new',
            password: 123
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'password must be a string');

        res = await request.post('/api/v1/users').send({
            username: 'testuser',
            password: 'password123'
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'username already exists');

        res = await request.post('/api/v1/users').send({
            username: 'newuser1',
            password: '321'.repeat(256)
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'password must be between 1 and 255 characters');
    });

    test('GET /users/:userId returns the created user', async () => {
        const newUser = await request.post('/api/v1/users').send({
            username: 'testuser2',
            password: 'password123'
        });
        const res = await request.get(`/api/v1/users/${newUser.body.userId}`).send();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.username, 'testuser2');
    });

    test('GET /users returns two users', async () => {
        const res = await request.get('/api/v1/users').send();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.length, 2);
        assert.strictEqual(res.body[0].username, 'testuser');
        assert.strictEqual(res.body[1].username, 'testuser2');
    });

    test('GET /users/:userId returns 404 for non-existent user', async () => {
        const res = await request.get('/api/v1/users/nonexistent').send();
        assert.strictEqual(res.status, 404);
    });

    test('PUT /users/:userId updates the user', async () => {
        const user = await getUserByUsername('testuser2');
        if (!user) {
            assert.fail('User not found');
        }
        const res = await request.put(`/api/v1/users/${user.userId}`).send({
            username: 'updateduser2',
            password: 'newpassword123'
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.username, 'updateduser2');
    });

    test(`PUT /users/:userId returns 404/400 for bad data`, async () => {
        let res = await request.put('/api/v1/users/nonexistent').send({});
        assert.strictEqual(res.status, 404);

        const user = await getUserByUsername('testuser');
        if (!user) {
            assert.fail('User not found');
        }
        res = await request.put(`/api/v1/users/${user.userId}`).send({
            username: 'updateduser2'
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'username already exists');
        
        res = await request.put(`/api/v1/users/${user.userId}`).send({
            password: 'newpassword123'
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'username is required');

        res = await request.put(`/api/v1/users/${user.userId}`).send({
            username: 'newuser1',
            password: 123
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'password must be a string');

        res = await request.put(`/api/v1/users/${user.userId}`).send({
            username: 'newuser1'
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'password is required');
        
        res = await request.put(`/api/v1/users/${user.userId}`).send({
            username: 'newuser1'.repeat(256),
            password: '321'
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'username must be between 1 and 255 characters');

    });

    test('DELETE /users/:userId deletes the user', async () => {
        const user = await getUserByUsername('updateduser2');
        if (!user) {
            throw new Error('User not found');
        }
        const res = await request.delete(`/api/v1/users/${user.userId}`)
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.username, 'updateduser2');
    });

    test(`DELETE /users/:userId returns 404 for bad data`, async () => {
        const res = await request.delete('/api/v1/users/nonexistent').send();
        assert.strictEqual(res.status, 404);
    });

    test('POST /users/login returns 200 for valid credentials', async () => {
        const res = await request.post('/api/v1/users/login').send({
            username: 'testuser',
            password: 'password123'
        });
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in .env file');
        }
        try {
            jwt.verify(res.body.token, secret);
            assert.strictEqual(res.status, 200);
        } catch (err) {
            assert.fail('Token verification failed');
        }
    });

    test('POST /users/login returns 401 for invalid credentials or if token fails', async () => {
        let res = await request.post('/api/v1/users/login').send({
            username: 'testuser',
            password: 'wrongpassword'
        });
        assert.strictEqual(res.status, 401);

        res = await request.post('/api/v1/users/login').send({
            username: 'testuser',
            password: 'password123'
        });
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined in .env file');
        }
        try {
            jwt.verify("Bad token", secret);
            assert.fail('Token verification failed');
        } catch (err) {
            assert.ok(err instanceof jwt.JsonWebTokenError, 'Token verification failed as expected');
        }

        try{
            jwt.verify(res.body.token, "Bad token");
            assert.fail('Token verification failed');
        } catch (err) {
            assert.ok(err instanceof jwt.JsonWebTokenError, 'Token verification failed as expected');
        }
    });

});