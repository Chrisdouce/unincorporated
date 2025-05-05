import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { Box, Button, Paper, Grid, Avatar, Typography, Card, CardContent } from "@mui/material";

export default function PersonalPage(openedUserId: string) {
    const { token, logout, isLoading } = useUser();
    const [userData, setUserData] = useState({
        username: "",
        userId: "",
        ign: "",
        pictureUrl: "",
        stats: {
            skyblockLevel: 0,
            skillAverage: 0,
        },
    });

    useEffect(() => {
        async function fetchUserData() {
            try {
                const res = await fetch(`http://localhost:3000/api/v1/users/${openedUserId}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (res.status === 200) {
                    const data = await res.json();
                    setUserData({
                        username: data.username,
                        userId: data.userId,
                        ign: data.ign,
                        pictureUrl: data.pictureUrl,
                        stats: {
                            skyblockLevel: data.skyblockLevel,
                            skillAverage: data.skillAverage,
                        },
                    });
                    console.log(data);
                } else {
                    console.error('Failed to fetch user data:', res.statusText);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        }
        fetchUserData();
    }, [token, logout]);

    if (isLoading) return null;

    return (
        <Box sx={{ p: 4, position: "relative" }}>
          {/* Friend Request Button */}
          <Box sx={{ position: "absolute", top: 16, right: 16 }}>
            <Button variant="contained" color="success">
              Send Friend Request
            </Button>
          </Box>
    
          <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid>
                <Avatar
                  alt={userData.username}
                  src={userData.pictureUrl}
                  sx={{ width: 120, height: 120 }}
                />
              </Grid>
    
              <Grid>
                <Typography variant="h4">{userData.username}</Typography>
                <Typography color="text.secondary">UserID: {userData.userId}</Typography>
                <Typography color="text.secondary">IGN: {userData.ign}</Typography>
              </Grid>
            </Grid>
    
            <Box mt={4}>
              <Typography variant="h5" gutterBottom>
                General Stats
              </Typography>
    
              <Grid container spacing={2}>
                {Object.entries(userData.stats).map(([key, value]) => (
                  <Grid>
                    <Card sx={{ borderRadius: 3 }}>
                      <CardContent>
                        <Typography color="text.secondary" gutterBottom>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </Typography>
                        <Typography variant="h6">{value}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Box>
    );
}