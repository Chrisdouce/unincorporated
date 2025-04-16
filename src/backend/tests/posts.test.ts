import test, { after, before, describe } from "node:test";
import supertest from 'supertest';
import { app } from "../index.js";
import assert from "node:assert/strict";
import 'dotenv/config';
import { deleteUser, getUserByUsername } from "../repositories/users.js";
import { deleteAllPostsByUserId, getAllPostsByUserId } from "../repositories/posts.js";

const request = supertest(app);

describe('Post routes', () => {
    let token: string;
    let user: { userId: string; username: string; hashedPassword: string; createdAt: Date; updatedAt: Date };
    let postId: string;
    before(async () => {
        // Create a test user
        let res = await request.post('/api/v1/users').send({
            username: 'testpostuser',
            password: 'password123'
        });
        assert.strictEqual(res.status, 201);
        const fetchedUser = await getUserByUsername('testpostuser');
        if (!fetchedUser) {
            assert.fail('User not found');
        }
        user = fetchedUser;
        res = await request.post('/api/v1/users/login').send({
            username: 'testpostuser',
            password: 'password123'
        });
        token = res.body.token;
    });

    after(async () => {
        // Delete the test user
        await deleteUser(user.userId);

        // Delete all posts by the test user
        await deleteAllPostsByUserId(user.userId);
    });

    test('GET /users/:userId/posts returns an empty array', async () => {
        const res = await request.get(`/api/v1/users/${user.userId}/posts`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 200);
        assert.deepStrictEqual(res.body, []);
    });

    test('POST /users/:userId/posts returns 201 for valid post', async () => {
        const res = await request.post(`/api/v1/users/${user.userId}/posts`).set('Authorization', `Bearer ${token}`).send({
            content: 'This is a test post'
        });
        postId = res.body.postId;
        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.ownerId, user.userId);
        assert.strictEqual(res.body.content, 'This is a test post');
    });

    test('POST /users/:userId/posts/:postId returns 201 for valid reply', async () => {
        const res = await request.post(`/api/v1/users/${user.userId}/posts/${postId}`).set('Authorization', `Bearer ${token}`).send({
            content: 'This is a test reply'
        });
        assert.strictEqual(res.status, 201);
        assert.strictEqual(res.body.ownerId, user.userId);
        assert.strictEqual(res.body.parentId, postId);
        assert.strictEqual(res.body.content, 'This is a test reply');
    });

    test('GET /users/:userId/posts returns all posts for a user', async () => {
        const res = await request.get(`/api/v1/users/${user.userId}/posts`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.length, 2);
        assert.strictEqual(res.body[0].ownerId, user.userId);
        assert.strictEqual(res.body[0].content, 'This is a test post');
    });

    test('GET /users/:userId/posts/:postId returns a post by a user', async () => {
        const res = await request.get(`/api/v1/users/${user.userId}/posts/${postId}`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.ownerId, user.userId);
        assert.strictEqual(res.body.content, 'This is a test post');
    });

    test('PUT /users/:userId/posts/:postId returns 200 for valid post update', async () => {
        const res = await request.put(`/api/v1/users/${user.userId}/posts/${postId}`).set('Authorization', `Bearer ${token}`).send({
            content: 'This is an updated test post'
        });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.content, 'This is an updated test post');
    });

    test('GET /users/:userId/posts/:postId returns 400 for bad data', async () => {
        let res = await request.get(`/api/v1/users/${user.userId}/posts/invalidPostId`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.error, 'Invalid UUID');

        res = await request.get(`/api/v1/users/invalidUserId/posts/${postId}`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.error, 'Invalid UUID');
    });

    test('POST /users/:userId/posts returns 400 for bad data', async () => {
        let res = await request.post(`/api/v1/users/${user.userId}/posts`).set('Authorization', `Bearer ${token}`).send({});
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'Content is required');

        res = await request.post(`/api/v1/users/invalidUserId/posts`).set('Authorization', `Bearer ${token}`).send({
            content: 'This is a test post'
        });
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.error, 'Invalid UUID');

        res = await request.post(`/api/v1/users/${user.userId}/posts`).set('Authorization', `Bearer ${token}`).send({
            content: ''
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'Content is required');

    });

    test('PUT /users/:userId/posts/:postId returns 400 for bad data', async () => {
        let res = await request.put(`/api/v1/users/${user.userId}/posts/${postId}`).set('Authorization', `Bearer ${token}`).send({
            content: ''
        });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error, 'Content is required');

        res = await request.put(`/api/v1/users/${user.userId}/posts/invalidPostId`).set('Authorization', `Bearer ${token}`).send({
            content: 'This is an updated test post'
        });
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.error, 'Invalid UUID');

        res = await request.put(`/api/v1/users/invalidUserId/posts/${postId}`).set('Authorization', `Bearer ${token}`).send({
            content: 'This is an updated test post'
        });
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.error, 'Invalid UUID');
    });

    test('DELETE /users/:userId/posts/:postId returns 404 for invalid post deletion', async () => {
        let res = await request.delete(`/api/v1/users/${user.userId}/posts/invalidPostId`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.error, 'Invalid UUID');

        res = await request.delete(`/api/v1/users/invalidUserId/posts/${postId}`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 404);
        assert.strictEqual(res.body.error, 'Invalid UUID');
    });

    test('DELETE /users/:userId/posts/:postId returns 200 for valid post deletion', async () => {
        const res = await request.delete(`/api/v1/users/${user.userId}/posts/${postId}`).set('Authorization', `Bearer ${token}`).send();
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.content, 'This is an updated test post');
    });

    

});