import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createUser, getAllUsers, getUserById, getUserByUsername, updateUser, deleteUser, updateUserSettings, getUserSettings, getAllSettings } from '../repositories/users.js';
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
                    "hashedPassword": hash
                });
                res.status(201).json(user);
            });
        });
    } catch (err) {
        next(err);
    }
});

//Gets a single user by UUID
router.get('/users/:userId', verifyToken, async (req, res, next) => {
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
        const userWithoutPassword = {
            userId: user.userId,
            username: user.username,
            groupId: user.groupId,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        res.status(200).json(userWithoutPassword);
    } catch (err) {
        next(err);
    }
});

//Updates a user
router.put('/users/:userId', verifyToken, async (req, res, next) => {
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
        } else if (await getUserByUsername(req.body.username) && req.body.username !== user.username) {
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
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds, function(_err: any, salt: any) {
            bcrypt.hash(req.body.password, salt, async function(_err: any, hash: any) {
                const user = await updateUser(
                    req.params.userId,
                    req.body.username,
                    hash
                );
                res.status(200).json(user);
            });
        });
    } catch (err) {
        next(err);
    }
});

//Deletes a user 
router.delete('/users/:userId', verifyToken, async (req, res, next) => {
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

router.get('/users/:userId/settings', verifyToken, async (req, res, next) => {
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
    
    const settings = await getUserSettings(user.userId);
    res.status(200).json(settings);
});

router.put('/users/:userId/settings', verifyToken, async (req, res, next) => {
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
    //Validation for darkMode
    if (req.body.darkMode === undefined) {
        res.status(400).json({ error: 'darkMode is required' });
        return;
    }
    if (typeof req.body.darkMode !== 'boolean') {
        res.status(400).json({ error: 'darkMode must be a boolean' });
        return;
    }
    
    //Validation for ign
    if (!req.body.ign) {
        res.status(400).json({ error: 'ign is required' });
        return;
    }
    if (typeof req.body.ign !== 'string') {
        res.status(400).json({ error: 'ign must be a string' });
        return;
    }
    if (req.body.ign.length < 0 || req.body.ign.length > 255) {
        res.status(400).json({ error: 'ign must be between 1 and 255 characters' });
        return;
    } else if (req.body.ign.trim() === '') {
        res.status(400).json({ error: 'ign must not be empty' });
        return;
    }
    let minecraftUUID = null;
    try {
        let api = await fetch(`https://api.mojang.com/users/profiles/minecraft/${req.body.ign}`);
        const data = await api.json();
        api = await fetch(`https://crafatar.com/avatars/${data.id}?size=256&overlay`);
        if (!api.ok) {
            res.status(400).json({ error: 'ign must be a valid Minecraft username' });
            return;
        } else {
            minecraftUUID = data.id;
        }
    } catch (error) {
        res.status(400).json({ error: 'ign must be a valid Minecraft username' });
        return;
    }

    const updatedSettings = await updateUserSettings({
        userId: req.params.userId,
        darkMode: req.body.darkMode,
        ign: req.body.ign,
        minecraftUUID: minecraftUUID
    });
    res.status(200).json(updatedSettings);
});

router.get('/settings', verifyToken, async (req, res, next) => {
    const allSettings = await getAllSettings();
    res.status(200).json(allSettings);
});

export default router;