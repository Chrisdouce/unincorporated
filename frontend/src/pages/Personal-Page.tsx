import { JSX, useEffect, useState } from "react";
import {
  Box, Paper, Grid, Avatar, Typography, Card, CardContent, Button, Tooltip
} from "@mui/material";
import { useUser } from "../context/UserContext";
import SkyblockProfile from '../components/SkyblockProfile';

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

type Props = {
  openedUserId: string;
}

export default function PersonalPage({ openedUserId }: Props): JSX.Element {
  const { token, logout, isLoading } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [canSendFriendRequest, setCanSendFriendRequest] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [toolTipMessage, setToolTipMessage] = useState("");
  const [loggedInUserId, setLoggedInUserId] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [userRes, settingsRes] = await Promise.all([
          fetch(`http://localhost:3000/api/v1/users/${openedUserId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:3000/api/v1/users/${openedUserId}/settings`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (userRes.status === 401 || settingsRes.status === 401) return logout();
        const [userJson, settingsJson] = [await userRes.json(), await settingsRes.json()];

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

        const thisUserId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;
        setLoggedInUserId(thisUserId);

        // Friend request logic
        if (openedUserId === thisUserId) {
          setCanSendFriendRequest(false);
          setToolTipMessage("You cannot send a friend request to yourself.");
          return;
        }

        const friendRes = await fetch(`http://localhost:3000/api/v1/users/${thisUserId}/friends`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        const friendData = await friendRes.json();
        friendData.forEach((friend: { friendAId: string, friendBId: string, status: string }) => {
          if (friend.friendAId === openedUserId || friend.friendBId === openedUserId) {
            if (friend.status === "friends") {
              setIsFriend(true);
              setCanSendFriendRequest(false);
              setToolTipMessage("You are already friends with this user.");
            } else {
              setCanSendFriendRequest(false);
              setToolTipMessage("Friend request pending.");
            }
          }
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };

    fetchData();
  }, [token, logout, openedUserId]);

  async function handleFriendRequest() {
    try {
      if (!token) {
        logout();
        return;
      }

      const res = await fetch(`http://localhost:3000/api/v1/users/${loggedInUserId}/friends`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ "friendId": openedUserId }),
      });

      const data = await res.json();
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

      const res = await fetch(`http://localhost:3000/api/v1/users/${loggedInUserId}/friends`, {
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

  if (isLoading || !userData) return <></>;

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
                <Typography color="text.secondary">IGN: {userData.ign || "Not set"}</Typography>
                <Typography color="text.secondary">In a group? {userData.groupId ? "Yes" : "No"}</Typography>
              </Grid>
            </Grid>
          </Grid>

          {isFriend ? (
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
          ) : (
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
          )}
        </Grid>
      {/*
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
        </Box>*/}
      </Paper>

      <SkyblockProfile uuid={userData.minecraftUUID} />
    </Box>
  );
}