import React, { useState, useEffect } from 'react';
import {
  Box, AppBar, Toolbar, Typography, Tabs, Tab, Button, IconButton,
  Menu, MenuItem, TextField, Paper
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import { Route, Routes, Navigate } from "react-router";
import LoginPage from './components/Login-Form';
import { useUser } from "./context/UserContext";
import SignUpPage from './components/Signup-Form';
import { useNavigate } from "react-router";

interface CardData {
  name: string;
  size: number;
  type: string;
  capacity: number;
  description: string;
}

export default function App() {
  const [tabValue, setTabValue] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newType, setNewType] = useState('Diana');
  const [newDescription, setNewDescription] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [groupToLeave, setGroupToLeave] = useState<string | null>(null);
  const [userGroup, setUserGroup] = useState<{ groupId: string } | null>(null);
  const tabLabels = ["Party Finder", "Guides", "Friends"];
  const { token, userId, isLoading, login, logout } = useUser();
  const navigate = useNavigate();

  const partySizeOptions: Record<string, { default: number; min: number; max: number }> = {
    Kuddra: { default: 4, min: 2, max: 4 },
    Dungeons: { default: 5, min: 2, max: 5 },
    Diana: { default: 6, min: 2, max: 10 },
    Fishing: { default: 6, min: 2, max: 10 },
    Other: { default: 6, min: 2, max: 10 },
  };
  const [partySize, setPartySize] = useState(partySizeOptions['Diana'].default);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = (groupName: string) => {
    setGroupToDelete(groupName);
    setDeleteDialogOpen(true);
  };

  useEffect(() => {
    fetchGroups();
    fetchUserGroup();
  }, []);

  async function fetchGroups() {
    try {
      const res = await fetch('http://localhost:3000/api/v1/groups', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        console.log(data);
        setCards(data);
      } else if (res.status === 401) {
        logout();
      }
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  }

  async function handleCreateCard() {
    const newCard: CardData = {
      name: newType,
      type: newType,
      size: 1,
      capacity: partySize,
      description: newDescription || 'No description',
    };
    console.log(JSON.stringify(newCard));

    const res = await fetch(`http://localhost:3000/api/v1/users/${userId}/group`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newCard),
    });
    if (res.status === 401) {
      logout();
    }
    navigate('/');
    setDialogOpen(false);
    await fetchGroups();
  };

  const handleJoin = async (index: number, groupId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/users/${userId}/group/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        setCards(prevCards =>
          prevCards.map((card, i) =>
            i === index ? { ...card, size: card.size + 1 } : card
          )
        );
        await fetchUserGroup();
      } else {
        const error = await res.json();
        console.error("Error joining group:", error.error);
      }
    } catch (err) {
      console.error("Error joining group:", err);
    }
  };

  const fetchUserGroup = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/users/${userId}/group`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const group = await res.json();
        setUserGroup(group);
      } else if (res.status === 404) {
        setUserGroup(null);
      }
    } catch (err) {
      console.error("Failed to fetch user group:", err);
    }
  };

  const handleLeave = (groupId: string) => {
    setGroupToLeave(groupId);
    setLeaveDialogOpen(true);
  };
  
  const handleConfirmLeave = async () => {
    if (!groupToLeave) return;
  
    try {
      const res = await fetch(`http://localhost:3000/api/v1/users/${userId}/group/${groupToLeave}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        setCards(prevCards =>
          prevCards.map(card =>
            card.groupId === groupToLeave ? { ...card, size: card.size - 1 } : card
          )
        );
        await fetchUserGroup();
      } else {
        const error = await res.json();
        console.error("Error leaving group:", error.error);
      }
    } catch (err) {
      console.error("Error leaving group:", err);
    } finally {
      setLeaveDialogOpen(false);
      setGroupToLeave(null);
      navigate('/');
    }
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
  
    try {
      const res = await fetch(`http://localhost:3000/api/v1/users/${userId}/group`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        await fetchGroups();
      } else {
        const error = await res.json();
        console.error("Error deleting group:", error.error);
      }
    } catch (err) {
      console.error("Error deleting group:", err);
    } finally {
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
    }
  };

  if (!token) {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage onLogin={login} />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
    );
  }

  return (
    <Box>
      <AppBar position="static" color="default">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>Logo</Typography>
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <Tabs value={tabValue} onChange={handleTabChange}>
                {tabLabels.map((label, index) => (
                    <Tab key={index} label={label} />
                ))}
                </Tabs>
            </Box>
            <IconButton onClick={handleMenuOpen}><MoreVertIcon /></IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                <MenuItem onClick={logout}>Logout</MenuItem>
            </Menu>
        </Toolbar>
      </AppBar>

      <Paper sx={{ margin: 2, padding: 5 }}>
        <Typography variant="h5" align="center">
          {tabLabels[tabValue]}
        </Typography>
      </Paper>

      <Box sx={{ padding: 2, px: 5, pt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2 }}>
        <Button variant="outlined" onClick={() => setDialogOpen(true)}>Create</Button>
          <Box sx={{ flexGrow: 1 }}>
            <TextField fullWidth label="Search" variant="outlined" />
          </Box>
          <Button variant="outlined">Filter</Button>
        </Box>

        {cards.map((card, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
              p: 2,
              border: '2px solid',
              borderColor: 'black',
              borderRadius: 2,
              mb: 2,
            }}
          >
            <Typography>{card.type}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {[...Array(card.capacity)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 40,
                    height: 40,
                    border: '2px solid',
                    borderColor: i < card.size ? 'yellow' : 'black'
                  }}
                />
              ))}
            </Box>
            <Typography>{card.description}</Typography>
            <Typography>{card.size}/{card.capacity}</Typography>

            {card.leaderId === userId ? (
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleDeleteClick(card.name)}
              >
                Delete
              </Button>
            ) : userGroup?.groupId === card.groupId ? (
              <Button variant="outlined" color="error" onClick={() => handleLeave(card.groupId)}>
                Leave
              </Button>
            ) : !userGroup && card.size < card.capacity ? (
              <Button variant="outlined" onClick={() => handleJoin(index, card.groupId)}>
                Join
              </Button>
            ) : (
              null
            )}
          </Box>
        ))}
      </Box>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <form onSubmit={(e) => { e.preventDefault(); handleCreateCard(); }}>
          <DialogTitle>Create Party</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Select
              value={newType}
              onChange={(e) => {
                const selected = e.target.value;
                setNewType(selected);
                setPartySize(partySizeOptions[selected].default);
              }}
              fullWidth
            >
              {Object.entries(partySizeOptions).map(([name, { default: size }]) => (
                <MenuItem key={name} value={name}>
                  {`${name} (${size})`}
                </MenuItem>
              ))}
            </Select>

            <Select
              value={partySize}
              onChange={(e) => setPartySize(Number(e.target.value))}
              fullWidth
            >
              {Array.from(
                { length: partySizeOptions[newType].max - partySizeOptions[newType].min + 1 },
                (_, i) => partySizeOptions[newType].min + i
              ).map((size) => (
                <MenuItem key={size} value={size}>
                  Party Size: {size}
                </MenuItem>
              ))}
            </Select>

            <TextField
              label="Description"
              fullWidth
              multiline
              minRows={2}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{groupToDelete}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={leaveDialogOpen} onClose={() => setLeaveDialogOpen(false)}>
        <DialogTitle>Confirm Leave</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to leave this group?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialogOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleConfirmLeave}>Leave</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
