import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createUser, getAllUsers, getUserById, getUserByUsername, updateUser, deleteUser, getAllFriendsByUserId, addFriend, removeFriend } from '../repositories/users.js';
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


//Gets all users
router.get('/users', async (req, res, next) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err) {
        next(err);
    }
});

//Crates a new user
router.post('/users', async (req, res, next) => {
    try {
        if(!req.body.username) {
            res.status(400).json({ error: 'username is required' });
            return;
        } else if (typeof req.body.username !== 'string') {
            res.status(400).json({ error: 'username must be a string' });
            return;
        } else if(req.body.username.length < 0 || req.body.username.length > 255) {
            res.status(400).json({ error: 'username must be between 1 and 255 characters' });
            return;
        } else if(req.body.username.trim() === '') {
            res.status(400).json({ error: 'username must not be empty' });
            return;
        }
        if(await getUserByUsername(req.body.username)) {
            res.status(400).json({ error: 'username already exists' });
            return;
        }
        
        if(!req.body.password) {
            res.status(400).json({ error: 'password is required' });
            return;
        } else if (typeof req.body.password !== 'string') {
            res.status(400).json({ error: 'password must be a string' });
            return;
        } else if(req.body.password.length < 0 || req.body.password.length > 255) {
            res.status(400).json({ error: 'password must be between 1 and 255 characters' });
            return;
        } else if(req.body.password.trim() === '') {
            res.status(400).json({ error: 'password must not be empty' });
            return;
        }

        // Hashing password with bcrypt
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, function(_err: any, salt: any) {
            bcrypt.hash(req.body.password, salt, async function(_err: any, hash: any) {
                const user = await createUser({
                    "username": req.body.username,
                    "hashedPassword": hash,
                });
                res.status(201).json(user);
            });
        });
    } catch (err) {
        next(err);
    }
});

//Gets a single user by UUID
router.get('/users/:userId', async (req, res, next) => {
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
        const userWithoutPassword = {
            userId: user.userId,
            username: user.username,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        res.status(200).json(userWithoutPassword);
    } catch (err) {
        next(err);
    }
});

//Updates a user
router.put('/users/:userId', async (req, res, next) => {
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
        
        if(!req.body.username) {
            res.status(400).json({ error: 'username is required' });
            return;
        } else if (typeof req.body.username !== 'string') {
            res.status(400).json({ error: 'username must be a string' });
            return;
        } else if(req.body.username.length < 0 || req.body.username.length > 255) {
            res.status(400).json({ error: 'username must be between 1 and 255 characters' });
            return;
        } else if(req.body.username.trim() === '') {
            res.status(400).json({ error: 'username must not be empty' });
            return;
        } else if (await getUserByUsername(req.body.username)) {
            res.status(400).json({ error: 'username already exists' });
            return;
        }

        if(!req.body.password) {
            res.status(400).json({ error: 'password is required' });
            return;
        } else if (typeof req.body.password !== 'string') {
            res.status(400).json({ error: 'password must be a string' });
            return;
        } else if(req.body.password.length < 0 || req.body.password.length > 255) {
            res.status(400).json({ error: 'password must be between 1 and 255 characters' });
            return;
        } else if(req.body.password.trim() === '') {
            res.status(400).json({ error: 'password must not be empty' });
            return;
        }
        const existingUser = await getUserByUsername(req.body.username);
        if (existingUser && existingUser.userId !== req.params.userId) {
            res.status(400).json({ error: 'username already exists' });
            return;
        }

        const updatedUser = await updateUser(req.params.userId, req.body.username, req.body.password);
        res.status(200).json(updatedUser);
    } catch (err) {
        next(err);
    }
});

//Deletes a user and all associated test and results
router.delete('/users/:userId', async (req, res, next) => {
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
        await deleteUser(req.params.userId);
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
});

router.post('/users/login', async (req, res, next) => {
    const [username, password] = [req.body.username, req.body.password];
    if (!username || !password) {
        res.status(400).json({ error: 'username and password are required' });
        return;
    }
    if (typeof username !== 'string' || typeof password !== 'string') {
        res.status(400).json({ error: 'username and password must be strings' });
        return;
    }
    const matchingUser = await getUserByUsername(username);
    if (!matchingUser) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
    }
    bcrypt.compare(password, matchingUser.hashedPassword, function(err, result) {
        if(err) {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }
        if(result){
            if (!process.env.JWT_SECRET) {
                throw new Error('JWT_SECRET is not defined in the environment variables');
            }
            const token = jwt.sign({ userId: matchingUser.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.status(200).json({ token });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
            return;
        }
    });
});

router.get('/users/:userId/friends', verifyToken, async (req, res, next) => {
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
    
    const friends = await getAllFriendsByUserId(user.userId)
    res.status(200).json(friends);
});

router.post('/users/:userId/friends', verifyToken, async (req, res, next) => {
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

    const friendId = req.body.friendId;
    if (!friendId) {
        res.status(400).json({ error: 'friendId is required' });
        return;
    }
    if (typeof friendId !== 'string') {
        res.status(400).json({ error: 'friendId must be a string' });
        return;
    }

    if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(friendId)) {
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

    const newFriend = await addFriend(user.userId, friend.userId);
    res.status(201).json(newFriend);
});

router.delete('/users/:userId/friends/:friendId', verifyToken, async (req, res, next) => {
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
    //Check if friendId is a valid UUID
    if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(req.params.friendId)) {
        res.status(400).json({ error: 'Invalid UUID' });
        return;
    }
    const friend = await getUserById(req.params.friendId);
    if (!friend) {
        res.status(404).json({ error: 'Friend not found' });
        return;
    }

    //Delete the friend from the database
    const deletedFriend = await removeFriend(user.userId, friend.userId);
    res.status(200).json(deletedFriend);
});

export default router;