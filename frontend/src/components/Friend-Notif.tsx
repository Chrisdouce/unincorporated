import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { IconButton, Badge, Menu, Box, InputBase, Divider, CircularProgress, Typography, List, ListItem, ListItemText } from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";

export default function FriendNotif() {
    const { token, logout } = useUser();
    interface FriendRequest {
        friendAId: string;
        friendAUsername: string;
        createdAt: string;
    }

    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<FriendRequest[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [search, setSearch] = useState("");
    const open = Boolean(anchorEl);
  
    useEffect(() => {
      async function fetchFriendRequests() {
        try {
            console.log("Fetching friend requests...");
            if (!token) {
                logout();
                return;
            }
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const userId = decodedToken.userId;
            setCurrentUserId(userId);
            const res = await fetch(`http://localhost:3000/api/v1/users/${userId}/requests`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (res.status === 401) {
                logout();
                return;
            }
            if (res.status === 200) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setFriendRequests(data);
                    setFilteredRequests(data);
                } else {
                    setFriendRequests([]);
                    setFilteredRequests([]);
                }
            } else {
                setError("Failed to fetch friend requests.");
            }
        } catch (err) {
            console.error(err);
            setError("An error occurred while fetching friend requests.");
        } finally {
            setLoading(false);
        }
      }
      fetchFriendRequests();
    }, [token, logout]);
  
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
      setSearch("");
      setFilteredRequests(friendRequests);
    };
  
    const handleSearch = (e: { target: { value: string; }; }) => {
      const value = e.target.value.toLowerCase();
      setSearch(value);
      setFilteredRequests(
        friendRequests.filter((req) =>
          req.friendAUsername?.toLowerCase().includes(value)
        )
      );
    };

    async function handleAccept (userId: string) {
        try {
            const res = await fetch(`http://localhost:3000/api/v1/users/${currentUserId}/friends/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "status": "friends" }),
            });
            if (res.ok) {
                setFriendRequests(prev => prev.filter(req => req.friendAId !== userId));
                setFilteredRequests(prev => prev.filter(req => req.friendAId !== userId));
            }
        } catch (err) {
          console.error("Error accepting friend request:", err);
        }
    }
    
    async function handleDeny (userId: string) {
        try {
            const res = await fetch(`http://localhost:3000/api/v1/users/${currentUserId}/friends`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "friendId": userId }),
            });
            if (res.ok) {
                setFriendRequests(prev => prev.filter(req => req.friendAId !== userId));
                setFilteredRequests(prev => prev.filter(req => req.friendAId !== userId));
            }
        } catch (err) {
            console.error("Error denying friend request:", err);
        }
    }

    return (
      <>
        <IconButton color="inherit" onClick={handleClick}>
          <Badge badgeContent={friendRequests.length} color="error">
            <PersonAddIcon />
          </Badge>
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: { width: 300, maxHeight: 400, p: 1 },
          }}
        >
          <Box px={1} pb={1}>
            <InputBase
              placeholder="Search friend..."
              value={search}
              onChange={handleSearch}
              fullWidth
              sx={{
                border: "1px solid #ccc",
                borderRadius: 1,
                px: 1,
                py: 0.5,
                fontSize: 14,
              }}
            />
          </Box>
          <Divider />
          {loading ? (
            <Box display="flex" justifyContent="center" py={2}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Typography color="error" sx={{ p: 2 }}>
              {error}
            </Typography>
          ) : filteredRequests.length === 0 ? (
            <Typography sx={{ p: 2 }}>No friend requests found.</Typography>
          ) : (
            <List dense sx={{ maxHeight: 300, overflowY: "auto" }}>
              {filteredRequests.map((req, index) => (
                <ListItem
                key={index}
                secondaryAction={
                    <Box display="flex" gap={0.5}>
                    <IconButton
                        aria-label="accept"
                        onClick={() => handleAccept(req.friendAId)}
                        size="small"
                    >
                        <CheckIcon color="success" />
                    </IconButton>
                    <IconButton
                        aria-label="deny"
                        onClick={() => handleDeny(req.friendAId)}
                        size="small"
                    >
                        <ClearIcon color="error" />
                    </IconButton>
                    </Box>
                }
                >
                <ListItemText
                    primary={req.friendAUsername}
                    secondary={new Date(req.createdAt).toLocaleDateString()}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
}