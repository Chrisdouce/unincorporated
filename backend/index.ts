import express, { NextFunction, Request, Response } from 'express';
import VError from 'verror';
import cors from 'cors';
import { migrateToLatest } from "./db/migrate.js";
import usersRouter from './routes/users.js';
import postsRouter from './routes/posts.js';
import groupsRouter from './routes/groups.js';
import friendsRouter from './routes/friends.js';
import skyblockRouter from './routes/skyblock';

await migrateToLatest();

export const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/v1', usersRouter);
app.use('/api/v1', postsRouter);
app.use('/api/v1', groupsRouter);
app.use('/api/v1', friendsRouter);
app.use('/api/v1/skyblock', skyblockRouter);

// Error handling middleware (stolen from assignment 2)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    const info = VError.info(err);
    res.status(info?.statusCode ?? 500).json({ error: info?.response ?? 'Internal Server Error' });
});

if (process.env.APP_ENV !== 'test') {
    app.listen(3000, () => console.log('Listening on port 3000'));
}