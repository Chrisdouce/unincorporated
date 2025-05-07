import React, { JSX, use, useEffect, useState } from 'react';
import {
  Box, AppBar, Toolbar, Typography, Tabs, Tab, Button, IconButton,
  Menu, MenuItem, TextField, Paper,
  Tooltip, Icon
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import { Route, Routes, Navigate } from "react-router";
import LoginPage from '../../pages/Login-Form';
import { useUser } from "../../context/UserContext";
import SignUpPage from '../../pages/Signup-Form';

interface CardData {
  name: string;
  size: number;
  type: string;
  capacity: number;
  description: string;
}

function PartyFinderPage(): JSX.Element {
  const [cards, setCards] = useState<CardData[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newType, setNewType] = useState('Diana');
  const [newDescription, setNewDescription] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [groupToLeave, setGroupToLeave] = useState<string | null>(null);
  const [userGroup, setUserGroup] = useState<{ groupId: string } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<CardData | null>(null);
  const { token, isLoading, login, logout } = useUser();
  const [exampleUsers, setExampleUsers] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const partySizeOptions: Record<string, { default: number; min: number; max: number }> = {
    Kuudra: { default: 4, min: 2, max: 4 },
    Dungeons: { default: 5, min: 2, max: 5 },
    Diana: { default: 6, min: 2, max: 10 },
    Fishing: { default: 6, min: 2, max: 10 },
    Other: { default: 6, min: 2, max: 10 },
  };

  useEffect(() => {
    async function fetchUsers() {
    try {
        if (isLoading) return;
        if (!token) {
            logout();
            return;
        }
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken.userId;
        const users = await fetch(`http://localhost:3000/api/v1/users`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await users.json();
        const userIds = data.map((user: { userId: string }) => user.userId);
        setExampleUsers(userIds);
        setCurrentUser(userId);
    } catch (error) {
        console.error('Error fetching settings:', error);
    }
  }
  fetchUsers();
  fetchGroups();
}, [token, logout]);

useEffect(() => {
  if (!currentUser) return;

  const fetchUserGroup = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/users/${currentUser}/group`, {
        headers: { Authorization: `Bearer ${token}` },
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
  fetchUserGroup();
}, [currentUser, token]);
  const [partySize, setPartySize] = useState(partySizeOptions['Diana'].default);

  const handleDeleteClick = (groupName: string) => {
    setGroupToDelete(groupName);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (group: CardData) => {
    setEditGroup(group);
    setEditDialogOpen(true);
  };

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

    const res = await fetch(`http://localhost:3000/api/v1/users/${currentUser}/group`, {
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
      setDialogOpen(false);
    await fetchGroups();
    await fetchUserGroup();
  };

  const handleJoin = async (index: number, groupId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/api/v1/users/${currentUser}/group/${groupId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        setCards(prevCards =>
          prevCards.map((card) =>
            card.groupId === groupId ? { ...card, size: card.size + 1 } : card
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
      const res = await fetch(`http://localhost:3000/api/v1/users/${currentUser}/group`, {
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
      const res = await fetch(`http://localhost:3000/api/v1/users/${currentUser}/group/${groupToLeave}`, {
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
    }
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
  
    try {
      const res = await fetch(`http://localhost:3000/api/v1/users/${currentUser}/group`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        await fetchGroups();
        await fetchUserGroup();
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

  const handleConfirmEdit = async () => {
    if (!editGroup) return;
    
    if (editGroup.description === '') {
      editGroup.description = 'No description';
    }
  
    if (editGroup.capacity < editGroup.size) {
      alert("Capacity cannot be less than the current group size.");
      return;
    }
  
    try {
      const res = await fetch(`http://localhost:3000/api/v1/users/${currentUser}/group`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editGroup),
      });
  
      if (res.ok) {
        await fetchGroups();
      } else {
        const error = await res.json();
        console.error("Error updating group:", error.error);
      }
    } catch (err) {
      console.error("Error updating group:", err);
    } finally {
      setEditDialogOpen(false);
      setEditGroup(null);
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
      <Box sx={{ padding: 2, px: 5, pt: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2 }}>
        <Button variant="outlined" onClick={() => setDialogOpen(true)} disabled={ userGroup?.groupId !== undefined }>Create</Button>
          <Box sx={{ flexGrow: 1 }}>
            <TextField fullWidth label="Search" variant="outlined" />
          </Box>
        <Button variant="outlined">Filter</Button>
      </Box>

        {cards.map((card, index) => (
          <Box
          key={index}
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: 'gray',
            borderRadius: 3,
            mb: 3,
            display: 'grid',
            gridAutoFlow: 'row',
            gridTemplateColumns: 'repeat(10, 1fr)',
            gap: 2,
          }}
        >
          {/* LEFT SIDE: Name + Count + Avatars */}
          <Box sx={{ order: 1, gridColumn: 'span 1', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {card.name}
            </Typography>
          </Box>

          {/* MIDDLE: Count */}
          <Box sx={{ order: 2, gridColumn: 'span 1', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {card.size}/{card.capacity}
            </Typography>
          </Box>

          {/* RIGHT SIDE: Avatars */}
          <Box sx={{ order: 3, gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[...Array(card.capacity)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 35,
                    height: 35,
                    border: '2px solid',
                    borderColor: i < card.size ? 'yellow' : 'gray',
                    borderRadius: 1,
                  }}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ order: 4, gridColumn: 'span 4', display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <Tooltip title={card.description}>
              <Typography
                variant="body1"
                noWrap
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '95%',
                  cursor: 'pointer'
                }}
              >
                {card.description}
              </Typography>
            </Tooltip>
          </Box>
        
          {/* RIGHT SIDE: Buttons */}
          <Box sx={{ order: 5, gridColumn: 'span 1', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {card.leaderId === currentUser ? (
                <>
                  <Button variant="outlined" size="medium" sx={{ fontSize: '1rem' }} onClick={() => handleEditClick(card)}>
                    Edit
                  </Button>
                  <Button variant="outlined" size="medium" color="error" sx={{ fontSize: '1rem' }} onClick={() => handleDeleteClick(card.name)}>
                    Delete
                  </Button>
                </>
              ) : userGroup?.groupId === card.groupId ? (
                <Button variant="outlined" size="medium" color="error" sx={{ fontSize: '1rem' }} onClick={() => handleLeave(card.groupId)}>
                  Leave
                </Button>
              ) : !userGroup && card.size < card.capacity ? (
                <Button variant="outlined" size="medium" sx={{ fontSize: '1rem' }} onClick={() => handleJoin(index, card.groupId)}>
                  Join
                </Button>
              ) : card.size >= card.capacity ? (
                <Typography>Party if Full!</Typography>
              ) : null}
            </Box>
          </Box>
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

      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <form onSubmit={(e) => { e.preventDefault(); handleConfirmEdit(); }}>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Select
              value={editGroup?.type || ''}
              onChange={(e) =>
                setEditGroup(prev =>
                  prev ? { ...prev, type: e.target.value, name: e.target.value } : null
                )
              }
              fullWidth
            >
              {Object.entries(partySizeOptions).map(([name, { default: size }]) => (
                <MenuItem key={name} value={name}>
                  {`${name} (${size})`}
                </MenuItem>
              ))}
            </Select>

            <Select
              value={editGroup?.capacity || ''}
              onChange={(e) =>
                setEditGroup(prev =>
                  prev ? { ...prev, capacity: Number(e.target.value) } : null
                )
              }
              fullWidth
            >
              {editGroup &&
                Array.from(
                  {
                    length:
                      partySizeOptions[editGroup.type]?.max -
                      partySizeOptions[editGroup.type]?.min +
                      1,
                  },
                  (_, i) => partySizeOptions[editGroup.type]?.min + i
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
              value={editGroup?.description || ''}
              onChange={(e) =>
                setEditGroup(prev =>
                  prev ? { ...prev, description: e.target.value } : null
                )
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              type="submit"
              disabled={
                editGroup?.capacity !== undefined &&
                editGroup.capacity < editGroup.size
              }
            >
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default PartyFinderPage;