import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { Box, Paper, Grid, Avatar, Typography, Card, CardContent, Button, Tooltip } from "@mui/material";

export default function PersonalPage({ openedUserId }: { openedUserId: string }) {
    const { token, logout, isLoading } = useUser();
    const [canSendFriendRequest, setCanSendFriendRequest] = useState(true);
    const [isFriend, setIsFriend] = useState(false);
    const [toolTipMessage, setToolTipMessage] = useState("");
    const [currentUserId, setCurrentUserId] = useState("");
    const [userData, setUserData] = useState({
        username: "",
        userId: "",
        ign: "",
        pictureUrl: "",
        groupId: "",
        stats: {
            skyblockLevel: 0,
            skillAverage: 0,
        },
    });

    useEffect(() => {
        async function fetchUserData() {
            try {
                if (!token) {
                    logout();
                    return;
                }
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                const userId = decodedToken.userId;
                setCurrentUserId(decodedToken.userId);
                const res = await fetch(`http://localhost:3000/api/v1/users/${openedUserId}`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (res.status === 200) {
                    const data = await res.json();
                    const ignRes = await fetch(`http://localhost:3000/api/v1/users/${openedUserId}/settings`, {
                      method: 'GET',
                      headers: { 'Authorization': `Bearer ${token}` },
                    });
                    const settingsData = await ignRes.json();
                    data.ign = settingsData.ign;
                    data.pictureUrl = `https://crafatar.com/avatars/${settingsData.minecraftUUID}?size=256&default=MHF_Steve&overlay`;
                    
                    // const hypixelRes = await fetch(`https://api.hypixel.net/skyblock/profiles?key=${process.}&uuid=${settingsData.minecraftUUID}`);
                    // const hypixelData = await hypixelRes.json();
                    setUserData({
                        username: data.username,
                        userId: data.userId,
                        ign: data.ign,
                        groupId: data.groupId,
                        pictureUrl: data.pictureUrl,
                        stats: {
                            skyblockLevel: data.skyblockLevel,
                            skillAverage: data.skillAverage,
                        },
                    });
                    //Friend request logic
                    if(openedUserId === userId) {
                        setCanSendFriendRequest(false);
                        setToolTipMessage("You cannot send a friend request to yourself.");
                        return;
                    }
                    const friendRes = await fetch(`http://localhost:3000/api/v1/users/${userId}/friends`, {
                      method: 'GET',
                      headers: { 'Authorization': `Bearer ${token}` },
                    });
                    const friendData = await friendRes.json();
                    friendData.forEach((friend: { friendAId: string, friendBId: string, status: string }) => {
                        if (friend.friendAId === openedUserId || friend.friendBId === openedUserId) {
                            if(friend.status === "friends") {
                                setIsFriend(true);
                                setCanSendFriendRequest(false);
                                setToolTipMessage("You are already friends with this user.");
                            } else {
                                setCanSendFriendRequest(false);
                                setToolTipMessage("Friend request pending.");
                            }
                        }
                    });
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

    async function handleFriendRequest() {
        try {
            if (!token) {
                logout();
                return;
            }
            const res = await fetch(`http://localhost:3000/api/v1/users/${currentUserId}/friends`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json', 
                  'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ "friendId": openedUserId }),
            });
            if (res.status === 201) {
                console.log('Friend request sent successfully!');
                setCanSendFriendRequest(false);
                setToolTipMessage("Friend request pending.");
            } else {
                console.error('Failed to send friend request:', res.statusText);
                setCanSendFriendRequest(false);
                setToolTipMessage("Internal Server Error. Please try again later.");
            }
        } catch (error) {
            console.error('Error sending friend request:', error);
        }
    }

    async function handleRemoveFriend() {
        try {
            if (!token) {
                logout();
                return;
            }
            const res = await fetch(`http://localhost:3000/api/v1/users/${currentUserId}/friends`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "friendId": openedUserId }),
            });
            const data = await res.json();
            console.log(data.error);
            if (res.status === 200) {
                console.log('Friend removed successfully!');
                setIsFriend(false);
                setCanSendFriendRequest(true);
            } else {
                console.error('Failed to remove friend:', res.statusText);
            }
        } catch (error) {
            console.error('Error removing friend:', error);
        }
    }

    return (
      <Box sx={{ p: 4, position: "relative" }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Grid container alignItems="center">
          <Grid>
            <Grid container spacing={2} alignItems="center">
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
                <Typography color="text.secondary">IGN: {userData.ign ? userData.ign : "Not set"}</Typography>
                <Typography color="text.secondary">In a group? {userData.groupId ? "Yes" : "No"}</Typography>
              </Grid>
            </Grid>
          </Grid>
          { isFriend ? (
            <Box sx={{ ml: "auto", pb: 10 }}>
              <Button 
                variant="contained" 
                color="error" 
                size="large" 
                onClick={handleRemoveFriend} 
                sx={{ borderRadius: 3, ml: 2 }}
              >
                Unfriend
              </Button>
            </Box>
          ) :
          <Box sx={{ ml: "auto", pb: 10 }}>
            <Tooltip
              title={!canSendFriendRequest ? toolTipMessage : ""}
              arrow
              placement="top"
            >
              <span>
                <Button 
                  variant="contained" 
                  color="success" 
                  size="large" 
                  onClick={handleFriendRequest} 
                  disabled={!canSendFriendRequest}
                  sx={{ borderRadius: 3 }}
                >
                  Send Friend Request
                </Button>
              </span>
            </Tooltip>
          </Box>
          }
        </Grid>
    
        <Box mt={4}>
          <Typography variant="h5" gutterBottom>
            Skyblock Stats
          </Typography>
    
          <Grid container spacing={2}>
            {Object.entries(userData.stats).map(([key, value]) => (
              <Grid key={key}>
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