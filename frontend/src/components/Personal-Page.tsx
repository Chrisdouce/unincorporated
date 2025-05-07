import { useEffect, useState } from "react";
import {
  Box, Paper, Grid, Avatar, Typography, Card, CardContent, Button, Tooltip
} from "@mui/material";
import { useUser } from "../context/UserContext";
import SkyblockProfile from './SkyblockProfile';

type UserStats = {
  skyblockLevel: number;
  skillAverage: number;
};

type UserData = {
  username: string;
  userId: string;
  ign: string;
  pictureUrl: string;
  groupId: string;
  stats: UserStats;
  minecraftUUID: string;
};

const getCurrentUserId = (token: string): string => {
  const decoded = JSON.parse(atob(token.split(".")[1]));
  return decoded.userId;
};

export default function PersonalPage() {
  const { token, logout, isLoading } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const userId = getCurrentUserId(token);

        const [userRes, settingsRes] = await Promise.all([
          fetch(`http://localhost:3000/api/v1/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:3000/api/v1/users/${userId}/settings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (userRes.status === 401 || settingsRes.status === 401) return logout();
        const [userJson, settingsJson] = [await userRes.json(), await settingsRes.json()];
        console.log(userJson, settingsJson);

        setUserData({
          username: userJson.username,
          userId: userJson.userId,
          ign: settingsJson.ign,
          groupId: userJson.groupId,
          pictureUrl: `https://crafatar.com/avatars/${settingsJson.minecraftUUID}?size=256&default=MHF_Steve&overlay`,
          stats: {
            skyblockLevel: userJson.skyblockLevel,
            skillAverage: userJson.skillAverage,
          },
          minecraftUUID: settingsJson.minecraftUUID
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    fetchData();
  }, [token, logout]);

  if (isLoading || !userData) return null;

  return (
    <Box sx={{ p: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar
              alt={userData.username}
              src={userData.pictureUrl}
              sx={{ width: 120, height: 120 }}
            />
          </Grid>
          <Grid item>
            <Typography variant="h4">{userData.username}</Typography>
            <Typography color="text.secondary">UserID: {userData.userId}</Typography>
            <Typography color="text.secondary">IGN: {userData.ign || "Not set"}</Typography>
            <Typography color="text.secondary">In a group? {userData.groupId ? "Yes" : "No"}</Typography>
          </Grid>
        </Grid>

        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            Skyblock Stats
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(userData.stats).map(([key, value]) => (
              <Grid item key={key}>
                <Card sx={{ borderRadius: 3, minWidth: 180 }}>
                  <CardContent>
                    <Typography color="text.secondary" gutterBottom>
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                    </Typography>
                    <Typography variant="h6">{value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

      <SkyblockProfile uuid={userData.minecraftUUID} />
    </Box>
  );
}
