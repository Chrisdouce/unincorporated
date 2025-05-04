import React, { useEffect, useState } from 'react';
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
import { BrowserRouter, Route, Routes } from "react-router";
import LoginPage from './components/Login-Form';
import { useUser } from "./context/UserContext";
import SignUpPage from './components/Signup-Form';
import { Navigate } from 'react-router';
import SettingsPage from './components/Settings';

interface CardData {
  name: string;
  count: number;
  total: number;
  message: string;
}

export default function App() {
  const [tabValue, setTabValue] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [cards, setCards] = useState<CardData[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('Diana');
  const [newMessage, setNewMessage] = useState('');
  const tabLabels = ["Party Finder", "Guides", "Friends"];
  const { token, isLoading, login, logout } = useUser();

  const partySizeOptions: Record<string, { default: number; min: number; max: number }> = {
    Kuddra: { default: 4, min: 2, max: 4 },
    Dungeons: { default: 5, min: 2, max: 5 },
    Diana: { default: 6, min: 2, max: 10 },
    Fishing: { default: 6, min: 2, max: 10 }
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

  const handleCreateCard = () => {
    const newCard: CardData = {
      name: newName,
      count: 1,
      total: partySize,
      message: newMessage || 'No description'
    };
  
    setCards(prev => [...prev, newCard]);
    setDialogOpen(false);
    setNewMessage('');
    setNewName('Diana');
  };

  const handleJoin = (index: number) => {
    setCards(prevCards =>
      prevCards.map((card, i) =>
        i === index && card.count < card.total
          ? { ...card, count: card.count + 1 }
          : card
      )
    )
  };

  const testing = true;
  if(testing){
    if (!token) {
      return (
      <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage onLogin={login} />} />
            <Route path="/signup" element={<SignUpPage />} />
          </Routes>
        </BrowserRouter>
      );
    } else {
      return (<>
        <AppBar position="static" color="default">
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <img src="/assets/logo.jpg" alt="Logo" style={{ height: 40,  }} />
                <Typography variant="h5">Unincorporated</Typography>
              </Box>
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
        <SettingsPage />
        </>);
      }
  }

  return (
    <Box>
      <AppBar position="static" color="default">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <img src="/assets/logo.jpg" alt="Logo" style={{ height: 40,  }} />
              <Typography variant="h5">Unincorporated</Typography>
            </Box>
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
            <Typography>{card.name}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {[...Array(card.total)].map((_, i) => (
                <Box
                  key={i}
                  sx={{
                    width: 40,
                    height: 40,
                    border: '2px solid',
                    borderColor: i < card.count ? 'yellow' : 'black'
                  }}
                />
              ))}
            </Box>
            <Typography>{card.message}</Typography>
            <Typography>{card.count}/{card.total}</Typography>
            {card.count < card.total ? (
              <Button variant="outlined" onClick={() => handleJoin(index)}>
                Join
              </Button>
            ) : (
              <Typography color="error" fontWeight="bold">
                Party is full
              </Typography>
            )}
          </Box>
        ))}
      </Box>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Create Party</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <Select
          value={newName}
          onChange={(e) => {
            const selected = e.target.value;
            setNewName(selected);
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
            { length: partySizeOptions[newName].max - partySizeOptions[newName].min + 1 },
            (_, i) => partySizeOptions[newName].min + i
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
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCard}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
