import { JSX, useState } from "react";
import PersonalPage from "../pages/Personal-Page";
import { useUser } from "../context/UserContext";
import { useEffect } from "react";
import { Paper, Typography, Box, Button, TextField, Divider } from "@mui/material";

export default function FriendsPage(): JSX.Element {
    const { token, logout } = useUser();
    const [friends, setFriends] = useState<{ friendAId: string }[]>([]);

    useEffect(() => {
        if (!token) {
            logout();
            return;
        }
    
        const fetchUserData = async () => {
            try {
                const userId = JSON.parse(atob(token.split('.')[1])).userId;
    
                const res = await fetch(`http://localhost:3000/api/v1/users/${userId}/friends`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
    
                if (res.status === 401) {
                    logout();
                    return;
                }
    
                const data = await res.json();
                data.forEach((friendship: { friendAId: string, friendBId: string }) => {
                    if (friendship.friendAId === userId) {
                        friendship.friendAId = friendship.friendBId;
                    } else {
                        friendship.friendBId = friendship.friendAId;
                    }
                });
                setFriends(data);
            } catch (error) {
                console.error('Error fetching user data:', error);
                logout();
            }
        };
    
        fetchUserData();
    }, [token, logout]);
    

    return (
        <>
        <Paper sx={{ margin: 2, padding: 5 }}>
            <Typography variant="h5" align="center">
                {"Friends"}
            </Typography>
        </Paper>
        <Box sx={{ padding: 2, px: 5, pt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2 }}>
                <Button
                variant="outlined"
                onClick={() => {
                }}
                >
                    Add Friend
                </Button>

                <Box sx={{ flexGrow: 1 }}>
                    <TextField fullWidth label="Search for Friends" variant="outlined" />
                </Box>
                <Button variant="outlined">Filter</Button>
            </Box>
        </Box>
        <Divider sx={{ marginY: 2 }} />
        {friends.length > 0 ? (
            <Box>
                {friends.map((friend) => (
                    <PersonalPage key={friend.friendAId} openedUserId={friend.friendAId} />
                ))}
            </Box>
        ) : (
            <Typography align="center" sx={{ paddingTop: 2 }}>
                No friends found :(
            </Typography>
        )}
        </>
    );
}