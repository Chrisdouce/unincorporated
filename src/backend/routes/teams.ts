import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { createPost, createReactionOnPost, deletePost, deleteReactionOnPost, getAllPostsByUserId, getPostByPostId, getUserReactionsOnPost, updatePost, updateReactionOnPost } from '../repositories/posts';
import { getUserById } from '../repositories/users';
import { getAllTeamsByUserId } from '../repositories/teams';

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

//Gets all teams
router.get('/users/:userId/teams', async (req, res, next) => {
    try {
        if(!isUUID(req.params.userId)){
            res.send(404).json('Invalid UUID')
        }
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const teams = await getAllTeamsByUserId(req.params.userId);
        res.json(teams);
    } catch (err) {
        next(err);
    }
});