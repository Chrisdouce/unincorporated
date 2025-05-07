import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { checkIfUserAlreadyReacted, createPost, createReactionOnPost, deletePost, deleteReactionOnPost, getAllPosts, getAllPostsByUserId, getPostByPostId, getUserReactionsOnPost, updatePost, updateReactionOnPost, getAllReactionsByPostId } from '../repositories/posts';
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

function isUUID(uuid: string) {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid);
}

//Gets all posts
router.get('/posts', verifyToken, async (req, res, next) => {
    try {
        const posts = await getAllPosts();
        res.status(200).json(posts);
    } catch (err) {
        next(err);
    }
});
//Gets a post by postId
router.get('/posts/:postId', verifyToken, async (req, res, next) => {
    try {
        //Check if postId is a valid UUID
        if (!isUUID(req.params.postId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        } 
        const post = await getPostByPostId(req.params.postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        res.status(200).json(post);
    } catch (err) {
        next(err);
    }
});

//Gets all posts from user
router.get('/users/:userId/posts', verifyToken, async (req, res, next) => {
    try {
        //Check if userId is a valid UUID
        if (!isUUID(req.params.userId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        } 
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const users = await getAllPostsByUserId(user.userId);
        res.status(200).json(users);
    } catch (err) {
        next(err);
    }
});

//Gets a post from a user
router.get('/users/:userId/posts/:postId', verifyToken, async (req, res, next) => {
    try {
        //Check if userId is a valid UUID
        if (!isUUID(req.params.userId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        } 
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        //Check if postId is a valid UUID
        if (!isUUID(req.params.postId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        }
        const post = await getPostByPostId(req.params.postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        
        res.status(200).json(post);
    } catch (err) {
        next(err);
    }
});

//Creates an original post
router.post('/users/:userId/posts', verifyToken, async (req, res, next) => {
    try {
        //Check if userId is a valid UUID
        if (!isUUID(req.params.userId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        } 
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if(!req.body.title){
            res.status(400).json({ error: 'Title is required' });
            return;
        }
        if(req.body.title.length <= 0){
            res.status(400).json({ error: 'Title is required' });
            return;
        }
        if (typeof req.body.title !== 'string'){
            res.status(400).json({ error: 'Title must be a string' });
            return;
        }
        if (req.body.title.length > 255){
            res.status(400).json({ error: 'Title must be less than 255 characters' });
            return;
        }

        if(!req.body.content){
            res.status(400).json({ error: 'Content is required' });
            return;
        }
        if(req.body.content.length <= 0){
            res.status(400).json({ error: 'Content is required' });
            return;
        }
        if (typeof req.body.content !== 'string'){
            res.status(400).json({ error: 'Content must be a string' });
            return;
        }
        
        const newPost = await createPost({'ownerId': user.userId, 'parentId': null, 'title': req.body.title, 'content': req.body.content});
        if (!newPost) {
            res.status(400).json({ error: 'Failed to create post' });
            return;
        }

        res.status(201).json(newPost);
    } catch (err) {
        next(err);
    }
});

//Creates a reply to a post
router.post('/users/:userId/posts/:postId', verifyToken, async (req, res, next) => {
    try {
        //Check if userId is a valid UUID
        if (!isUUID(req.params.userId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        } 
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        //Check if postId is a valid UUID
        if (!isUUID(req.params.postId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        }
        const post = await getPostByPostId(req.params.postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        if(!req.body.content){
            res.status(400).json({ error: 'Content is required' });
            return;
        }
        if(req.body.content.length <= 0){
            res.status(400).json({ error: 'Content is required' });
            return;
        }
        if (typeof req.body.content !== 'string'){
            res.status(400).json({ error: 'Content must be a string' });
            return;
        }
        
        const newPost = await createPost({'ownerId': user.userId, 'parentId': req.params.postId, 'title': null, 'content': req.body.content});
        if (!newPost) {
            res.status(400).json({ error: 'Failed to create post' });
            return;
        }

        res.status(201).json(newPost);
    } catch (err) {
        next(err);
    }
});

//Update a post for a user
router.put('/users/:userId/posts/:postId', verifyToken, async (req, res, next) => {
    try {
        //Check if userId is a valid UUID
        if (!isUUID(req.params.userId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        } 
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        //Check if postId is a valid UUID
        if (!isUUID(req.params.postId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        }
        const post = await getPostByPostId(req.params.postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        
        if(!req.body.content){
            res.status(400).json({ error: 'Content is required' });
            return;
        }
        if(req.body.content.length <= 0){
            res.status(400).json({ error: 'Content is required' });
            return;
        }
        if (typeof req.body.content !== 'string'){
            res.status(400).json({ error: 'Content must be a string' });
            return;
        }
        
        const updatedPost = await updatePost(req.params.postId, req.body.content, req.body.title);
        res.status(200).json(updatedPost);
    } catch (err) {
        next(err);
    }
});

//Delete a post
router.delete('/users/:userId/posts/:postId', verifyToken, async (req, res, next) => {
    try {
        //Check if userId is a valid UUID
        if (!isUUID(req.params.userId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        } 
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        //Check if postId is a valid UUID
        if (!isUUID(req.params.postId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        }
        const post = await getPostByPostId(req.params.postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        
        const deletedPost = await deletePost(req.params.postId);
        res.status(200).json(deletedPost);
    } catch (err) {
        next(err);
    }
});

//Gets all reactions in a post
router.get('/users/:userId/posts/:postId/reactions', verifyToken, async (req, res, next) => {
    try {
        //Check if userId is a valid UUID
        if (!isUUID(req.params.userId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        } 
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        //Check if postId is a valid UUID
        if (!isUUID(req.params.postId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        }
        const post = await getPostByPostId(req.params.postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        
        const reactions = await getUserReactionsOnPost(user.userId, req.params.postId);
        res.status(200).json(reactions);
    } catch (err) {
        next(err);
    }
});

//Adds a reaction to a post
router.post('/users/:userId/posts/:postId/reactions', verifyToken, async (req, res, next) => {
    try {
        //Check if userId is a valid UUID
        if (!isUUID(req.params.userId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        } 
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        
        //Check if postId is a valid UUID
        if (!isUUID(req.params.postId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        }
        const post = await getPostByPostId(req.params.postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        if(!req.body.type){
            res.status(400).json({ error: 'Type is required' });
            return;
        }
        //Can be changed when we need more reaction types
        if (req.body.type !== 'like' && req.body.type !== 'dislike'){
            res.status(400).json({ error: 'Type must be either like or dislike' });
            return;
        }

        if(await checkIfUserAlreadyReacted(user.userId, req.params.postId)){
            res.status(400).json({ error: 'User already reacted to this post' });
            return;
        }
        const reactions = await createReactionOnPost(user.userId, req.params.postId, req.body.type);
        res.status(201).json(reactions);
    } catch (err) {
        next(err);
    }
});

router.put('/users/:userId/posts/:postId/reactions', verifyToken, async (req, res, next) => {
    try {
        //Check if userId is a valid UUID
        if (!isUUID(req.params.userId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        } 
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        //Check if postId is a valid UUID
        if (!isUUID(req.params.postId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        }
        const post = await getPostByPostId(req.params.postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        if(!req.body.type){
            res.status(400).json({ error: 'Type is required' });
            return;
        }
        //Can be changed when we need more reaction types
        if (req.body.type !== 'like' && req.body.type !== 'dislike'){
            res.status(400).json({ error: 'Type must be either like or dislike' });
            return;
        }
        
        const reactions = await updateReactionOnPost(user.userId, req.params.postId, req.body.type);
        res.status(200).json(reactions);
    }
    catch (err) {
        next(err);
    }
});

//Deletes a reaction to a post
router.delete('/users/:userId/posts/:postId/reactions', verifyToken, async (req, res, next) => {
    try {
        //Check if userId is a valid UUID
        if (!isUUID(req.params.userId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        } 
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        //Check if postId is a valid UUID
        if (!isUUID(req.params.postId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        }
        const post = await getPostByPostId(req.params.postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        
        const reaction = await getUserReactionsOnPost(user.userId, req.params.postId);
        if (!reaction) {
            res.status(404).json({ error: 'Reaction not found' });
            return;
        }
        const deletedReaction = await deleteReactionOnPost(user.userId, req.params.postId);
        
        res.status(200).json(deletedReaction);
    } catch (err) {
        next(err);
    }
});

router.get('/posts/:postId/reactions', verifyToken, async (req, res, next) => {
    try {
        //Check if postId is a valid UUID
        if (!isUUID(req.params.postId)) {
            res.status(404).json({ error: 'Invalid UUID' });
            return;
        } 
        const post = await getPostByPostId(req.params.postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        
        const reactions = await getAllReactionsByPostId(req.params.postId);
        res.status(200).json(reactions);
    } catch (err) {
        next(err);
    }
});

export default router;