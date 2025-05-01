import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { getUserById } from '../repositories/users';
import { createGroup, deleteGroup, getGroupByLeaderId, getGroupByGroupId, updateGroup, getAllGroupsByName, getAllGroups } from '../repositories/groups';
import { getAllGroupsByType } from '../repositories/groups';

const router = express.Router();
const allowedTypes = ['Diana', 'Kuudra', 'Dungeons', 'Fishing', 'Other'];

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
        res.sendStatus(401);
    }
}

function isUUID(uuid: string) {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(uuid);
}

//Gets all groups
router.get('/groups', async (req, res, next) => {
    try {
        const groups = await getAllGroups();
        res.status(200).json(groups);
    } catch (err) {
        next(err);
    }
});

//Gets a group by ID
router.get('/groups/:groupId', async (req, res, next) => {
    try {
        if(!isUUID(req.params.groupId)){
            res.status(404).json({ error: 'Invalid UUID' })
            return;
        }
        const group = await getGroupByGroupId(req.params.groupId);
        if (!group) {
            res.status(404).json({ error: 'Group not found' });
            return;
        }
        res.status(200).json(group);
    } catch (err) {
        next(err);
    }
});

//Gets all groups with a certain type
router.get('/groups/type/:type', async (req, res, next) => {
    try {
        const groupType = req.params.type;
        if (!groupType) {
            res.status(400).json({ error: 'Type is required' });
            return;
        }
        const groups = await getAllGroupsByType(groupType);
        if (!groups || groups.length === 0) {
            res.status(404).json({ error: 'No groups found with the specified type' });
            return;
        }
        res.status(200).json(groups);
    } catch (err) {
        next(err);
    }
});

//Gets all groups by name
router.get('/groups/name/:name', async (req, res, next) => {
    try {
        const groupName = req.params.name;
        if (!groupName) {
            res.status(400).json({ error: 'Name is required' });
            return;
        }
        const groups = await getAllGroupsByName(groupName);
        if (!groups || groups.length === 0) {
            res.status(404).json({ error: 'No groups found with the specified name' });
            return;
        }
        res.status(200).json(groups);
    } catch (err) {
        next(err);
    }
});

/*
    Leader group Routes
*/

//Gets group for a user if they are in a group
router.get('/users/:userId/group', verifyToken, async (req, res, next) => {
    try {
        if(!isUUID(req.params.userId)){
            res.status(404).json({ error: 'Invalid UUID' })
            return;
        }
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const group = await getGroupByLeaderId(req.params.userId);
        res.status(200).json(group);
    } catch (err) {
        next(err);
    }
});

//Creates a new group
router.post('/users/:userId/group', verifyToken, async (req, res, next) => {
    try {
        if(!isUUID(req.params.userId)){
            res.status(404).json({ error: 'Invalid UUID' })
            return;
        }
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const group = req.body;
        if (!group.name) {
            res.status(400).json({ error: 'name is required' });
            return;
        }
        if (!group.type) {
            res.status(400).json({ error: 'type is required' });
            return;
        }
        if(!group.description){
            res.status(400).json({ error: 'description is required' });
            return;
        }
        if (group.description.length > 255) {
            res.status(400).json({ error: 'description cannot be longer than 255 characters' });
            return;
        }
        if (!allowedTypes.includes(group.type)) {
            res.status(400).json({ error: `${group.type} must be one of ${allowedTypes.join(', ')}` });
            return;
        }

        group.leaderId = req.params.userId;
        const createdGroup = await createGroup(group);
        res.status(201).json(createdGroup);
        } catch (err){
        next(err);
    }
});

//Updates a group
router.put('/users/:userId/group', verifyToken, async (req, res, next) => {
    try {
        if(!isUUID(req.params.userId)){
            res.status(404).json({ error: 'Invalid UUID' })
        }
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if(!isUUID(req.params.groupId)){
            res.status(404).json({ error: 'Invalid UUID' })
        }
        const group = await getGroupByGroupId(req.params.groupId);
        if (!group) {
            res.status(404).json({ error: 'Group not found' });
            return;
        }
        const newGroup = req.body;
        if (!newGroup.name) {
            res.status(400).json({ error: 'name is required' });
            return;
        }
        if (!newGroup.type) {
            res.status(400).json({ error: 'type is required' });
            return;
        }
        if (newGroup.type.length !== 6) {
            res.status(400).json({ error: 'type must contain exactly 6 type' });
            return;
        }
        if (newGroup.type.some((character: string) => typeof character !== 'string')) {
            res.status(400).json({ error: 'type array must contain only strings' });
            return;
        }

        const characterSet = new Set(newGroup.type);
        if (characterSet.size !== newGroup.type.length) {
            res.status(400).json({ error: 'group must not contain duplicate type' });
            return;
        }
        newGroup.groupId = req.params.groupId;
        const updatedGroup = await updateGroup(newGroup);
        res.status(200).json(updatedGroup);
    } catch (err) {
        next(err);
    }
});

//Deletes a group
router.delete('/users/:userId/group', verifyToken, async (req, res, next) => {
    try {
        if(!isUUID(req.params.userId)){
            res.status(404).json({ error: 'Invalid UUID' })
            return;
        }
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if(!isUUID(req.params.groupId)){
            res.status(404).json({ error: 'Invalid UUID' })
            return;
        }
        const group = await getGroupByGroupId(req.params.groupId);
        if (!group) {
            res.status(404).json({ error: 'Group not found' });
            return;
        }
        const deletedPost = await deleteGroup(req.params.groupId);
        res.status(200).json(deletedPost);
    } catch (err) {
        next(err);
    }
});

export default router;