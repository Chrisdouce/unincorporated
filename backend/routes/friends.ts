import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getUserById } from '../repositories/users.js';
import { getAllFriendsByUserId, addFriend, removeFriend, getFriendByUserId, updateFriend, getAllPendingFriendsForUser } from '../repositories/friends.js';
import 'dotenv/config';

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

router.get('/users/:userId/friends', verifyToken, async (req, res, next) => {
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
    
    const friends = await getAllFriendsByUserId(user.userId)
    res.status(200).json(friends);
});

router.get('/users/:userId/requests', verifyToken, async (req, res, next) => {
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
    
    const friends = await getAllPendingFriendsForUser(user.userId)
    res.status(200).json(friends);
});

router.post('/users/:userId/friends', verifyToken, async (req, res, next) => {
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

    const friendId = req.body.friendId;
    if (!friendId) {
        res.status(400).json({ error: 'friendId is required' });
        return;
    }
    if (typeof friendId !== 'string') {
        res.status(400).json({ error: 'friendId must be a string' });
        return;
    }
    if (!isUUID(friendId)) {
        res.status(400).json({ error: 'friendId must be a valid UUID' });
        return;
    }
    const friend = await getUserById(friendId);
    if (!friend) {
        res.status(404).json({ error: 'Friend not found' });
        return;
    }
    if (user.userId === friend.userId) {
        res.status(400).json({ error: 'You cannot add yourself as a friend' });
        return;
    }
    if (await getFriendByUserId(user.userId, friend.userId)) {
        res.status(400).json({ error: 'You are already friends' });
        return;
    }
    //FriendA is the sender of the request, FriendB is the receiver of the request
    const newFriend = await addFriend(user.userId, friend.userId);
    res.status(201).json(newFriend);
});

router.get('/users/:userId/friends/:friendId', verifyToken, async (req, res, next) => {
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
    //Check if friendId is a valid UUID
    if (!isUUID(req.params.friendId)) {
        res.status(400).json({ error: 'Invalid UUID' });
        return;
    }
    const friend = await getUserById(req.params.friendId);
    if (!friend) {
        res.status(404).json({ error: 'Friend not found' });
        return;
    }
    const friendRelation = await getFriendByUserId(user.userId, friend.userId);
    if (!friendRelation) {
        res.status(404).json({ error: 'Friend not found' });
        return;
    }
    res.status(200).json(friendRelation);
});

router.put('/users/:userId/friends/:friendId', verifyToken, async (req, res, next) => {
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
    //Check if friendId is a valid UUID
    if (!isUUID(req.params.friendId)) {
        res.status(400).json({ error: 'Invalid UUID' });
        return;
    }
    const friend = await getUserById(req.params.friendId);
    if (!friend) {
        res.status(404).json({ error: 'Friend not found' });
        return;
    }
    const friendRelation = await getFriendByUserId(user.userId, friend.userId);
    if (!friendRelation) {
        res.status(404).json({ error: 'Friend not found' });
        return;
    }
    if (friendRelation.friendAId === user.userId){
        res.status(400).json({ error: 'You cannot update a friend request you sent' });
        return;
    }

    //Validation for status
    if (!req.body.status) {
        res.status(400).json({ error: 'status is required' });
        return;
    }
    if (typeof req.body.status !== 'string') {
        res.status(400).json({ error: 'status must be a string' });
        return;
    }
    if (req.body.status !== 'friends' && req.body.status !== 'good friends' && req.body.status !== 'best friends') {
        res.status(400).json({ error: 'status must be friends, good friends, or best friends' });
        return;
    }

    const updatedFriend = await updateFriend(req.params.userId, friend.userId, req.body.status);
    res.status(200).json(updatedFriend);
});


router.delete('/users/:userId/friends', verifyToken, async (req, res, next) => {
    
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

    //Validation for friendId
    if (!req.body.friendId) {
        res.status(400).json({ error: 'friendId is required' });
        return;
    }
    if (typeof req.body.friendId !== 'string') {
        res.status(400).json({ error: 'friendId must be a string' });
        return;
    }

    if (!isUUID(req.body.friendId)) {
        res.status(400).json({ error: 'Invalid UUID' });
        return;
    }

    const friendId = req.body.friendId;
    const friend = await getUserById(friendId);
    if (!friend) {
        res.status(404).json({ error: 'Friend not found' });
        return;
    }

    const friendRelation = await getFriendByUserId(user.userId, friend.userId);
    if (!friendRelation) {
        res.status(404).json({ error: 'Friend not found' });
        return;
    }
    
    const deletedFriend = await removeFriend(user.userId, friend.userId);
    res.status(200).json(deletedFriend);
});

export default router;