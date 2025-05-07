import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import { Grid } from '@mui/material';

interface SkyblockProfileData {
  cute_name: string;
  members: {
    [uuid: string]: {
      currencies: {
        coin_purse: number;
      };
      player_data: {
        experience: { [skill: string]: number };
      };
    };
  };
}

interface LevelRequirement {
  level: number;
  totalXP: number;
}

interface LevelCap {
  level: number;
  skill: String;
}

const xpRequirements: LevelRequirement[] = [
  { level: 1, totalXP: 50 },
  { level: 2, totalXP: 175 },
  { level: 3, totalXP: 375 },
  { level: 4, totalXP: 625 },
  { level: 5, totalXP: 1175 },
  { level: 6, totalXP: 1925 },
  { level: 7, totalXP: 2925 },
  { level: 8, totalXP: 4425 },
  { level: 9, totalXP: 6425 },
  { level: 10, totalXP: 9925 },
  { level: 11, totalXP: 14925 },
  { level: 12, totalXP: 22425 },
  { level: 13, totalXP: 32425 },
  { level: 14, totalXP: 47425 },
  { level: 15, totalXP: 67425 },
  { level: 16, totalXP: 97425 },
  { level: 17, totalXP: 147425 },
  { level: 18, totalXP: 222425 },
  { level: 19, totalXP: 322425 },
  { level: 20, totalXP: 522425 },
  { level: 21, totalXP: 822425 },
  { level: 22, totalXP: 1222425 },
  { level: 23, totalXP: 1722425 },
  { level: 24, totalXP: 2322425 },
  { level: 25, totalXP: 3022425 },
  { level: 26, totalXP: 3822425 },
  { level: 27, totalXP: 4722425 },
  { level: 28, totalXP: 5722425 },
  { level: 29, totalXP: 6822425 },
  { level: 30, totalXP: 8022425 },
  { level: 31, totalXP: 9322425 },
  { level: 32, totalXP: 10722425 },
  { level: 33, totalXP: 12222425 },
  { level: 34, totalXP: 13822425 },
  { level: 35, totalXP: 15522425 },
  { level: 36, totalXP: 17322425 },
  { level: 37, totalXP: 19222425 },
  { level: 38, totalXP: 21222425 },
  { level: 39, totalXP: 23322425 },
  { level: 40, totalXP: 25522425 },
  { level: 41, totalXP: 27822425 },
  { level: 42, totalXP: 30222425 },
  { level: 43, totalXP: 32722425 },
  { level: 44, totalXP: 35322425 },
  { level: 45, totalXP: 38072425 },
  { level: 46, totalXP: 40972425 },
  { level: 47, totalXP: 44072425 },
  { level: 48, totalXP: 47472425 },
  { level: 49, totalXP: 51172425 },
  { level: 50, totalXP: 55172425 },
  { level: 51, totalXP: 59472425 },
  { level: 52, totalXP: 64072425 },
  { level: 53, totalXP: 68972425 },
  { level: 54, totalXP: 74172425 },
  { level: 55, totalXP: 79672425 },
  { level: 56, totalXP: 85472425 },
  { level: 57, totalXP: 91572425 },
  { level: 58, totalXP: 97972425 },
  { level: 59, totalXP: 104672425 },
  { level: 60, totalXP: 111672425 },
];

const runecraftingXpRequirements: LevelRequirement[] = [
  { level: 1, totalXP: 50 },
  { level: 2, totalXP: 150 },
  { level: 3, totalXP: 275 },
  { level: 4, totalXP: 435 },
  { level: 5, totalXP: 635 },
  { level: 6, totalXP: 885 },
  { level: 7, totalXP: 1200 },
  { level: 8, totalXP: 1600 },
  { level: 9, totalXP: 2100 },
  { level: 10, totalXP: 2725 },
  { level: 11, totalXP: 3150 },
  { level: 12, totalXP: 4510 },
  { level: 13, totalXP: 5760 },
  { level: 14, totalXP: 7325 },
  { level: 15, totalXP: 9325 },
  { level: 16, totalXP: 11825 },
  { level: 17, totalXP: 14950 },
  { level: 18, totalXP: 18950 },
  { level: 19, totalXP: 23950 },
  { level: 20, totalXP: 30200 },
  { level: 21, totalXP: 38050 },
  { level: 22, totalXP: 47850 },
  { level: 23, totalXP: 60100 },
  { level: 24, totalXP: 75400 },
  { level: 25, totalXP: 94500 },
];

const socialXpRequirements: LevelRequirement[] = [
  { level: 1, totalXP: 50 },
  { level: 2, totalXP: 150 },
  { level: 3, totalXP: 300 },
  { level: 4, totalXP: 550 },
  { level: 5, totalXP: 1050 },
  { level: 6, totalXP: 1800 },
  { level: 7, totalXP: 2800 },
  { level: 8, totalXP: 4050 },
  { level: 9, totalXP: 5550 },
  { level: 10, totalXP: 7550 },
  { level: 11, totalXP: 10050 },
  { level: 12, totalXP: 13050 },
  { level: 13, totalXP: 16800 },
  { level: 14, totalXP: 21300 },
  { level: 15, totalXP: 27300 },
  { level: 16, totalXP: 35300 },
  { level: 17, totalXP: 45300 },
  { level: 18, totalXP: 57800 },
  { level: 19, totalXP: 72800 },
  { level: 20, totalXP: 92800 },
  { level: 21, totalXP: 117800 },
  { level: 22, totalXP: 147800 },
  { level: 23, totalXP: 182800 },
  { level: 24, totalXP: 222800 },
  { level: 25, totalXP: 272800 },
];

const dungeonLevel: LevelRequirement[] = [
  {level: 1, totalXP: 50},
  { level: 2, totalXP: 125 },
  { level: 3, totalXP: 235 },
  { level: 4, totalXP: 395 },
  { level: 5, totalXP: 625 },
  { level: 6, totalXP: 955 },
  { level: 7, totalXP: 1425 },
  { level: 8, totalXP: 2095 },
  { level: 9, totalXP: 3045 },
  { level: 10, totalXP: 4385 },
  { level: 11, totalXP: 6275 },
  { level: 12, totalXP: 8940 },
  { level: 13, totalXP: 12700 },
  { level: 14, totalXP: 17960 },
  { level: 15, totalXP: 25340 },
  { level: 16, totalXP: 35640 },
  { level: 17, totalXP: 50040 },
  { level: 18, totalXP: 70040 },
  { level: 19, totalXP: 97640 },
  { level: 20, totalXP: 135640 },
  { level: 21, totalXP: 188140 },
  { level: 22, totalXP: 259640 },
  { level: 23, totalXP: 356640 },
  { level: 24, totalXP: 488640 },
  { level: 25, totalXP: 668640 },
  { level: 26, totalXP: 911640 },
  { level: 27, totalXP: 1239640 },
  { level: 28, totalXP: 1684640 },
  { level: 29, totalXP: 2284640 },
  { level: 30, totalXP: 3084640 },
  { level: 31, totalXP: 4149640 },
  { level: 32, totalXP: 5559640 },
  { level: 33, totalXP: 7459640 },
  { level: 34, totalXP: 9959640 },
  { level: 35, totalXP: 13259640 },
  { level: 36, totalXP: 17559640 },
  { level: 37, totalXP: 23519640 },
  { level: 38, totalXP: 30359640 },
  { level: 39, totalXP: 39559640 },
  { level: 40, totalXP: 51559640 },
  { level: 41, totalXP: 66559640 },
  { level: 42, totalXP: 85559640 },
  { level: 43, totalXP: 109559640 },
  { level: 44, totalXP: 139559640 },
  { level: 45, totalXP: 177559640 },
  { level: 46, totalXP: 225559640 },
  { level: 47, totalXP: 285559640},
  { level: 48, totalXP: 360559640 },
  { level: 49, totalXP: 453559640 },
  { level: 50, totalXP: 569809640 },
]

const levelCap: LevelCap[] = [
  { level: 25, skill: "Runecrafting" },
  { level: 25, skill: "Social" },
  { level: 50, skill: "Fishing" },
  { level: 50, skill: "Alchemy" },
  { level: 50, skill: "Carpentry" },
  { level: 50, skill: "Foraging" },
  { level: 60, skill: "Mining" },
  { level: 60, skill: "Combat" },
  { level: 60, skill: "Farming" },
  { level: 60, skill: "Enchanting" },
  { level: 60, skill: "Taming" },
]

const dianaMobs = [
  { key: 'minotaur', label: 'Minotaur' },
  { key: 'minos_champion', label: 'Minos Champion' },
  { key: 'minos_inquisitor', label: 'Minos Inquisitor' },
  { key: 'minos_hunter', label: 'Minos Hunter' },
];

const seaCreatures = [
  { key: 'sea_walker', label: 'Sea Walker' },
  { key: 'sea_guardian', label: 'Sea Guardian' },
  { key: 'night_squid', label: 'Night Squid' },
  { key: 'rider_of_the_deep', label: 'Rider of the Deep' },
  { key: 'skeleton_fish', label: 'Skeleton Fish' },
  { key: 'guardian_defender', label: 'Guardian Defender' },
  { key: 'deep_sea_protector', label: 'Deep Sea Protector' },
  { key: 'catfish', label: 'Catfish' },
  { key: 'carrot_king', label: 'Carrot King' },
  { key: 'sea_leech', label: 'Sea Leech' },
  { key: 'water_hydra', label: 'Water Hydra' },
  { key: 'nightmare', label: 'Nightmare' },
  { key: 'phantom_fisher', label: 'Phantom Fisher' },
  { key: 'grim_reaper', label: 'Grim Reaper' },
  { key: 'scarecrow', label: 'Scarecrow' },
  { key: 'flying_fish', label: 'Flying Fish' },
  { key: 'yeti', label: 'Yeti' },
  { key: 'great_white_shark', label: 'Great White Shark' },
  { key: 'tiger_shark', label: 'Tiger Shark' },
  { key: 'blue_shark', label: 'Blue Shark' },
  { key: 'lava_blaze', label: 'Lava Blaze' },
  { key: 'lava_pigman', label: 'Lava Pigman' },
  { key: 'thunder', label: 'Thunder' },
  { key: 'taurus', label: 'Taurus' },
  { key: 'hydra', label: 'Hydra' },
];


const SkyblockProfile = ({ uuid }: { uuid: string }) => {
  const [profile, setProfile] = useState<SkyblockProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/v1/skyblock/${uuid}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Unknown error');
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load profile');
      }
    };

    fetchProfile();
  }, [uuid]);

  const convertXPToLevel = (xp: number, skill: string): number => {
    let requirements: LevelRequirement[];

    switch (skill.toLowerCase()) {
      case 'social':
        requirements = socialXpRequirements;
        break;
      case 'runecrafting':
        requirements = runecraftingXpRequirements;
        break;
      default:
        requirements = xpRequirements;
    }

    let level = 0;
    for (let i = requirements.length - 1; i >= 0; i--) {
      if (xp >= requirements[i].totalXP) {
        level = requirements[i].level;
        break;
      }
    }

    const cap = levelCap.find((lc) => lc.skill.toLowerCase() === skill.toLowerCase());
    return cap && level > cap.level ? cap.level : level;
  };

  const renderSkillXP = (experience: any) => {
    if (!experience)
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No experience data available.
        </Alert>
      );
  
    return (
      <Paper elevation={3} sx={{ p: 2}}>
        <Typography variant="h6" gutterBottom>
          Skills
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)'}}>
            {Object.keys(experience).map((skillKey) => {
              const skillNameRaw = skillKey.replace('SKILL_', '').toLowerCase();
              const skillName = skillNameRaw.charAt(0).toUpperCase() + skillNameRaw.slice(1);
              const xp = experience[skillKey];
              return (
                <ListItem key={skillKey} disableGutters>
                  <ListItemText
                    primary={skillName}
                    secondary={`Level ${convertXPToLevel(xp, skillName)}`}
                  />
                </ListItem>
              );
            })}
        </Box>
      </Paper>
    );
  };

  const calcDungeonsLevel = (xp: number) => {
    const requirements = dungeonLevel;
    let level = 0;
    for (let i = requirements.length - 1; i >= 0; i--) {
      if (xp >= requirements[i].totalXP) {
        level = requirements[i].level;
        break;
      }
    }
    return level;
  };

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const rawUuid = uuid.replace(/-/g, '');
  const member = profile.members[rawUuid];
  const coinPurse = member.currencies.coin_purse;
  const dungeonsLevel = member.dungeons.dungeon_types.catacombs.experience;
  const kuudraStats = member.nether_island_player_data.kuudra_completed_tiers;
  const normalDungeons = member.dungeons.dungeon_types.catacombs.tier_completions;
  const masterModeDungeons = member.dungeons.dungeon_types.master_catacombs.tier_completions;
  console.log(profile);

  return (
    <Container sx={{ mt: 4 }} maxWidth="100%">
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box >
          <Typography variant="h4" gutterBottom>
            Skyblock Stats
          </Typography>
          <Typography variant="h5" gutterBottom>
            SkyBlock Profile: {profile.cute_name}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Coins in Purse: {coinPurse?.toLocaleString() ?? 'N/A'}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Catacombs Level: { calcDungeonsLevel(dungeonsLevel) ?? 'N/A'}
          </Typography>
        </Box>
        <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2} mt={3}>
          <Box>{renderSkillXP(member.player_data.experience)}</Box>
          <Box>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Diana Mobs Killed
              </Typography>
              <List>
                {dianaMobs.map(({ key, label }) => (
                  <ListItem key={key} disableGutters>
                    <ListItemText
                      primary={label}
                      secondary={`Kills: ${member.player_stats!.kills[key] ?? 0}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
          <Box gridColumn="span 2">
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Fishing Sea Creatures Killed: { member.player_stats.sea_creature_kills}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)'}}>
                  {seaCreatures.map(({ key, label }) => (
                    <ListItem key={key} disableGutters>
                      <ListItemText
                        primary={label}
                        secondary={`Kills: ${member.player_stats!.kills[key] ?? 0}`}
                      />
                    </ListItem>
                  ))}
              </Box>
            </Paper>
          </Box>
          <Box gridColumn="span 1">
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
               Kuudra Completions
              </Typography>
                <ListItem>
                  <ListItemText>Basic: { kuudraStats.none }</ListItemText>
                  <ListItemText>Hot: { kuudraStats.hot }</ListItemText>
                  <ListItemText>Burning: { kuudraStats.burning }</ListItemText>
                  <ListItemText>Fiery: { kuudraStats.fiery }</ListItemText>
                  <ListItemText>Infernal: { kuudraStats.infernal }</ListItemText>
                </ListItem>
            </Paper>
          </Box>
          <Box gridColumn="span 1">
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Dungeons Stats
              </Typography>
              <ListItem>
                <ListItemText> Catacombs Level: { calcDungeonsLevel(dungeonsLevel) ?? 'N/A'}</ListItemText>
                <ListItemText>
                  Selected Dungeons Class:{' '}
                  {member.dungeons.selected_dungeon_class
                    ? member.dungeons.selected_dungeon_class.charAt(0).toUpperCase() +
                      member.dungeons.selected_dungeon_class.slice(1)
                    : 'N/A'}
                </ListItemText>
              </ListItem>
            </Paper>
          </Box>
          <Box gridColumn="span 1">
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
              Normal Dungeons Completions
              </Typography>
              <List>
                {Object.entries(normalDungeons).map(([tier, count]) => (
                  <ListItem key={tier} disableGutters>
                    <ListItemText primary={`Tier ${tier}`} secondary={`Completions: ${count}`} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
          <Box gridColumn="span 1">
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
               Master Mode Completions
              </Typography>
              <List>
                {Object.entries(masterModeDungeons).map(([tier, count]) => (
                  <ListItem key={tier} disableGutters>
                    <ListItemText primary={`Tier ${tier}`} secondary={`Completions: ${count}`} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SkyblockProfile;
