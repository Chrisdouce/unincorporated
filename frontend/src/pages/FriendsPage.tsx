import { JSX, useState, useEffect } from "react";
import PersonalPage from "../pages/Personal-Page";
import { useUser } from "../context/UserContext";
import {
    Paper,
    Typography,
    Box,
    Button,
    TextField,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
} from "@mui/material";
import { Link } from "react-router-dom";
import { baseUrl } from "../services/BaseUrl";

export default function FriendsPage(): JSX.Element {
    const { token, logout } = useUser();
    const [friends, setFriends] = useState<{ friendAId: string, username: string }[]>([]);
    const [allUsers, setAllUsers] = useState<{ userId: string; name: string, username: string }[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        if (!token) {
            logout();
            return;
        }

        const fetchUserData = async () => {
            try {
                const userId = JSON.parse(atob(token.split('.')[1])).userId;
                const res = await fetch(`${baseUrl}/api/v1/users/${userId}/friends`, {
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

    const fetchAllUsers = async () => {
        try {
            const res = await fetch(`${baseUrl}/api/v1/users`, {
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
            console.log(data);
            setAllUsers(data);
        } catch (error) {
            console.error('Error fetching all users:', error);
        }
    }

    const handleAddFriendClick = () => {
        setIsDialogOpen(true);
        fetchAllUsers();
    };

    return (
        <>
            <Paper sx={{ margin: 2, padding: 5 }}>
                <Typography variant="h5" align="center">
                    {"Friends"}
                </Typography>
            </Paper>
            <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2 }}>
                <Button variant="outlined" onClick={handleAddFriendClick}>
                    Add Friend
                </Button>
            </Box>
            <Divider sx={{ marginY: 2 }} />
            {friends.length > 0 ? (
                <Box>
                    {friends.map((friend) => (
                            <PersonalPage key={friend.friendAId} openedUserId={friend.friendAId} />
                        ))}
                </Box>
            ) : (
                <Typography align="center" sx={{ paddingTop: 4 }}>
                    No friends found :(
                </Typography>
            )}


            <Dialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Add a Friend</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Search by username"
                        variant="outlined"
                        margin="dense"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <List sx={{ maxHeight: 300, overflowY: 'auto', mt: 1 }}>
                        {allUsers
                            .filter((user) =>
                                user.username.toLowerCase().includes(searchQuery.toLowerCase()) // Case insensitive filter
                            )
                            .map((user) => (
                                <ListItem key={user.userId} divider>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1" fontWeight="medium">
                                                {user.name}
                                            </Typography>
                                        }
                                        secondary={
                                            <Link to={`/users/${user.userId}`} style={{ textDecoration: 'none' }}>
                                                <Typography variant="body2" color="primary">
                                                    @{user.username}
                                                </Typography>
                                            </Link>
                                        }
                                    />
                                </ListItem>
                            ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
