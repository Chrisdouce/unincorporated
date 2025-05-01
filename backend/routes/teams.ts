import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import { getUserById } from '../repositories/users';
import { createTeam, deleteTeam, getAllTeamsByUserId, getTeamByTeamId, updateTeam } from '../repositories/teams';

const router = express.Router();
const playableMarvelRivalsCharacters = [
    "Adam Warlock",
    "Black Panther",
    "Black Widow",
    "Captain America",
    "Cloak and Dagger",
    "Doctor Strange",
    "Emma Frost",
    "Groot",
    "Hawkeye",
    "Hela",
    "Hulk",
    "Human Torch",
    "Invisible Woman",
    "Iron Fist",
    "Iron Man",
    "Jeff the Land Shark",
    "Loki",
    "Luna Snow",
    "Magik",
    "Magneto",
    "Mantis",
    "Mister Fantastic",
    "Moon Knight",
    "Namor",
    "Peni Parker",
    "Psylocke",
    "The Punisher",
    "The Thing",
    "Rocket Raccoon",
    "Scarlet Witch",
    "Squirrel Girl",
    "Spider Man",
    "Star Lord",
    "Storm",
    "Thor",
    "Venom",
    "Winter Soldier",
    "Wolverine"
];

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

//Gets all playable characters for testing sake
router.get('/characters', async (req, res, next) => {
    try {
        res.status(200).json({ playableMarvelRivalsCharacters });
    } catch (err) {
        next(err);
    }
});

//Gets all teams
router.get('/users/:userId/teams', verifyToken, async (req, res, next) => {
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
        const teams = await getAllTeamsByUserId(req.params.userId);
        res.status(200).json(teams);
    } catch (err) {
        next(err);
    }
});

//Gets a team by ID
router.get('/users/:userId/teams/:teamId', verifyToken, async (req, res, next) => {
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
        if(!isUUID(req.params.teamId)){
            res.status(404).json({ error: 'Invalid UUID' })
            return;
        }
        const team = await getTeamByTeamId(req.params.teamId);
        if (!team) {
            res.status(404).json({ error: 'Team not found' });
            return;
        }
        res.status(200).json(team);
    } catch (err) {
        next(err);
    }
});

//Creates a new team
router.post('/users/:userId/teams', verifyToken, async (req, res, next) => {
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
        const team = req.body;
        if (!team) {
            res.status(400).json({ error: 'team is required' });
            return;
        }
        if (!team.name) {
            res.status(400).json({ error: 'name is required' });
            return;
        }
        if (!team.characters) {
            res.status(400).json({ error: 'characters is required' });
            return;
        }
        if (!Array.isArray(team.characters)) {
            res.status(400).json({ error: 'characters must be an array' });
            return;
        }
        if (team.characters.length !== 6) {
            res.status(400).json({ error: 'characters must contain exactly 6 characters' });
            return;
        }
        if (team.characters.some((character: string) => typeof character !== 'string')) {
            res.status(400).json({ error: 'characters array must contain only strings' });
            return;
        }
        const invalidCharacters = team.characters.filter((character: string) => 
            !playableMarvelRivalsCharacters.some(playableCharacter => playableCharacter.toLowerCase().trim().replace(/\s+/g, '') === character.toLowerCase().trim().replace(/\s+/g, ''))
        );
        if (invalidCharacters.length > 0) {
            res.status(400).json({ error: `${invalidCharacters} ${invalidCharacters.length > 1 ? "are not playable characters": "is not a playable character"}`});
            return;
        }
        const characterSet = new Set(team.characters);
        if (characterSet.size !== team.characters.length) {
            res.status(400).json({ error: 'teams must not contain duplicate characters' });
            return;
        }

        team.userId = req.params.userId;
        const createdTeam = await createTeam(team);
        res.status(201).json(createdTeam);
    } catch (err) {
        next(err);
    }
});

//Updates a team
router.put('/users/:userId/teams/:teamId', verifyToken, async (req, res, next) => {
    try {
        if(!isUUID(req.params.userId)){
            res.status(404).json({ error: 'Invalid UUID' })
        }
        const user = await getUserById(req.params.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if(!isUUID(req.params.teamId)){
            res.status(404).json({ error: 'Invalid UUID' })
        }
        const team = await getTeamByTeamId(req.params.teamId);
        if (!team) {
            res.status(404).json({ error: 'Team not found' });
            return;
        }
        const newTeam = req.body;
        if (!newTeam) {
            res.status(404).json({ error: 'Team not found' });
            return;
        }
        if (!newTeam.name) {
            res.status(400).json({ error: 'name is required' });
            return;
        }
        if (!newTeam.characters) {
            res.status(400).json({ error: 'characters is required' });
            return;
        }
        if (!Array.isArray(newTeam.characters)) {
            res.status(400).json({ error: 'characters must be an array' });
            return;
        }
        if (newTeam.characters.length !== 6) {
            res.status(400).json({ error: 'characters must contain exactly 6 characters' });
            return;
        }
        if (newTeam.characters.some((character: string) => typeof character !== 'string')) {
            res.status(400).json({ error: 'characters array must contain only strings' });
            return;
        }
        const invalidCharacters = newTeam.characters.filter((character: string) => 
            !playableMarvelRivalsCharacters.some(playableCharacter => playableCharacter.toLowerCase().trim().replace(/\s+/g, '') === character.toLowerCase().trim().replace(/\s+/g, ''))
        );
        if (invalidCharacters.length > 0) {
            res.status(400).json({ error: `${invalidCharacters} ${invalidCharacters.length > 1 ? "are not playable characters": "is not a playable character"}`});
            return;
        }
        const characterSet = new Set(newTeam.characters);
        if (characterSet.size !== newTeam.characters.length) {
            res.status(400).json({ error: 'teams must not contain duplicate characters' });
            return;
        }
        newTeam.teamId = req.params.teamId;
        const updatedTeam = await updateTeam(newTeam);
        res.status(200).json(updatedTeam);
    } catch (err) {
        next(err);
    }
});

//Deletes a team
router.delete('/users/:userId/teams/:teamId', verifyToken, async (req, res, next) => {
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
        if(!isUUID(req.params.teamId)){
            res.status(404).json({ error: 'Invalid UUID' })
            return;
        }
        const team = await getTeamByTeamId(req.params.teamId);
        if (!team) {
            res.status(404).json({ error: 'Team not found' });
            return;
        }
        const deletedPost = await deleteTeam(req.params.teamId);
        res.status(200).json(deletedPost);
    } catch (err) {
        next(err);
    }
});

export default router;