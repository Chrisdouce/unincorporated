import { Router, Request, Response } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const HYPIXEL_API_KEY = process.env.HYPIXEL_API_KEY;

const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

router.get('/:uuid', async (req: Request, res: Response) => {
  const uuid = req.params.uuid;
  const rawUuid = uuid.replace(/-/g, '');

  try {
    const response = await fetch(
      `https://api.hypixel.net/v2/skyblock/profiles?key=${HYPIXEL_API_KEY}&uuid=${rawUuid}`
    );
    const data = await response.json();
    const selectedProfile = data.profiles.find((profile: any) => profile.selected);
    res.json(selectedProfile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
