import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { getUserById } from '../repositories/users.js';
import { createGroup, deleteGroup, getGroupByLeaderId, getGroupByGroupId, updateGroup, getAllGroupsByName, getAllGroups, getGroupByUserId, removeUserFromGroup, addUserToGroup } from '../repositories/groups.js';
import { getAllGroupsByType } from '../repositories/groups.js';

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
        const group = await getGroupByUserId(req.params.userId);
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
        const existingGroup = await getGroupByLeaderId(req.params.userId);
        if (existingGroup) {
            res.status(400).json({ error: 'User already has a group' });
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
        if (!group.size) {
            res.status(400).json({ error: 'size is required' });
            return;
        }
        if (!group.capacity) {
            res.status(400).json({ error: 'capacity is required' });
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
        const group = await getGroupByUserId(req.params.userId);
        if (!group) {
            res.status(404).json({ error: 'Group not found' });
            return;
        }
        if (group.leaderId !== req.params.userId) {
            res.status(403).json({ error: 'User is not the leader of the group' });
            return;
        }
        const newGroup = req.body;
        if (!group.name) {
            res.status(400).json({ error: 'name is required' });
            return;
        }
        if (!newGroup.type) {
            res.status(400).json({ error: 'type is required' });
            return;
        }
        if (!newGroup.size) {
            res.status(400).json({ error: 'size is required' });
            return;
        }
        if (!newGroup.capacity) {
            res.status(400).json({ error: 'capacity is required' });
            return;
        }
        if(!newGroup.description){
            res.status(400).json({ error: 'description is required' });
            return;
        }
        if(!newGroup.leaderId){
            newGroup.leaderId = req.params.userId;
        }
        if (newGroup.description.length > 255) {
            res.status(400).json({ error: 'description cannot be longer than 255 characters' });
            return;
        }
        if (!allowedTypes.includes(newGroup.type)) {
            res.status(400).json({ error: `${newGroup.type} must be one of ${allowedTypes.join(', ')}` });
            return;
        }
        newGroup.groupId = group.groupId;

        const updatedGroup = await updateGroup(newGroup);
        res.status(200).json(updatedGroup);
    } catch (err) {
        next(err);
    }
});

//Join a group by ID
router.put('/users/:userId/group/:groupId', verifyToken, async (req, res, next) => {
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
        const group = await getGroupByGroupId(req.params.groupId);
        if (!group) {
            res.status(404).json({ error: 'Group not found' });
            return;
        }
        if (await getGroupByUserId(req.params.userId)) {
            res.status(400).json({ error: 'User already has a group' });
            return;
        }
        const groupId = await addUserToGroup(user.userId, group.groupId);

        res.status(200).json(({ groupId: groupId }));
    } catch (err) {
        next(err);
    }
});

//Leave a group by ID
router.delete('/users/:userId/group/:groupId', verifyToken, async (req, res, next) => {
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
        const group = await getGroupByGroupId(req.params.groupId);
        if (!group) {
            res.status(404).json({ error: 'Group not found' });
            return;
        }
        if (group.leaderId === req.params.userId) {
            res.status(400).json({ error: 'User is the leader of the group, must delete group itself or set new leader' });
            return;
        }
        const groupId = await removeUserFromGroup(user.userId, group.groupId);
        res.status(200).json(({ groupId: groupId }));
    } catch (err) {
        next(err);
    }
});

//Deletes a group if leader
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
        const group = await getGroupByUserId(req.params.userId);
        if (!group) {
            res.status(404).json({ error: 'Group not found' });
            return;
        }
        if (group.leaderId !== req.params.userId) {
            res.status(403).json({ error: 'User is not the leader of the group' });
            return;
        }

        const deletedGroup = await deleteGroup(group.groupId);
        res.status(200).json(deletedGroup);
    } catch (err) {
        next(err);
    }
});

export default router;