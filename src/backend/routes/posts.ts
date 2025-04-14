import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { createPost, deletePost, getAllPostsByUserId, getUserReactionsOnPost, updatePost } from '../repositories/posts';
import { getUserById } from '../repositories/users';

const router = express.Router();

//Verify the JWT token for a user
function verifyToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.get('Authorization');
    if(!authHeader) {
        res.sendStatus(401);
        return;
    }
    const authSegments = authHeader.split(' ');
    if(authSegments.length !== 2 || authSegments[0] !== 'Bearer') {
        res.sendStatus(401);
        return;
    }
    const token = authSegments[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in .env file');
    }
    try {
        jwt.verify(token, secret);
        next();
    } catch (err) {
        console.log(err)
        res.sendStatus(401);
    }
}

//Gets all posts from user
router.get('/users/:userId/posts', verifyToken, async (req, res, next) => {
    try {
        //Check if userId is a valid UUID
        if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(req.params.userId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        } 
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        
        const users = await getAllPostsByUserId(user.userId);
        res.json(users);
    } catch (err) {
        next(err);
    }
});

//Creates a original post for a user
router.post('/users/:userId/posts', verifyToken, async (req, res, next) => {
    try {
        //Check if userId is a valid UUID
        if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(req.params.userId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        } 
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        
        const newPost = await createPost({'ownerId': user.userId, 'parentId': null, 'content': req.body.content});
        if (!newPost) {
            res.status(400).json({ error: 'Failed to create post' });
            return;
        }

        res.json(newPost);
    } catch (err) {
        next(err);
    }
});

//Creates a reply to a post for a user
router.post('/users/:userId/posts/:postId', verifyToken, async (req, res, next) => {
    try {
        //Check if userId is a valid UUID
        if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(req.params.userId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        } 
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        
        const newPost = await createPost({'ownerId': user.userId, 'parentId': req.params.postId, 'content': req.body.content});
        if (!newPost) {
            res.status(400).json({ error: 'Failed to create post' });
            return;
        }

        res.json(newPost);
    } catch (err) {
        next(err);
    }
});

//Update a post for a user
router.put('/users/:userId/posts/:postId', verifyToken, async (req, res, next) => {
    try {
        //Check if userId is a valid UUID
        if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(req.params.userId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        } 
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        
        const updatedPost = await updatePost(req.params.postId, req.body.content);
        res.json(updatedPost);
    } catch (err) {
        next(err);
    }
});

//Delete a post for a user
router.delete('/users/:userId/posts/:postId', verifyToken, async (req, res, next) => {
    try {
        //Check if userId is a valid UUID
        if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(req.params.userId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        } 
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        
        const deletedPost = await deletePost(req.params.postId);
        res.json(deletedPost);
    } catch (err) {
        next(err);
    }
});

//Gets the reactions for a post
router.get('/users/:userId/posts/:postId/reactions', verifyToken, async (req, res, next) => {
    try {
        //Check if userId is a valid UUID
        if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(req.params.userId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        } 
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        
        const reactions = await getUserReactionsOnPost(user.userId, req.params.postId);
        res.json(reactions);
    } catch (err) {
        next(err);
    }
});