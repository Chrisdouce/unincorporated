import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import FriendNotif from './Friend-Notif';

type Props = {
  isLoggedIn: boolean;
  onLogout: () => void;
};

export default function Header({ isLoggedIn, onLogout }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabRoutes = ['/', '/guides', '/friends'];
  const tabLabels = ['Party Finder', 'Guides', 'Friends'];

  const currentPath = location.pathname;
  const currentTab = tabRoutes.findIndex(route => currentPath.startsWith(route));
  const [tabValue, setTabValue] = useState(currentTab === -1 ? 0 : currentTab);

  useEffect(() => {
    setTabValue(currentTab === -1 ? 0 : currentTab);
  }, [currentTab]);

  useEffect(() => {
    setTabValue(currentTab === -1 ? 0 : currentTab);
  }, [currentTab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    navigate(tabRoutes[newValue]);
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => onLogout();


  return isLoggedIn ? (
    <Box>
      <AppBar position="static" color="default">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <img src="../src/assets/icon.jpg" alt="Logo" style={{ height: 40 }} />
            <Typography variant="h6" component="div" sx={{ pl: 2 }}>
              Unincorporated
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              {tabLabels.map((label, index) => (
                <Tab key={index} label={label} />
              ))}
            </Tabs>
          </Box>
          
          <FriendNotif />

          <IconButton onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
          
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>Profile</MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>Settings</MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
    </Box>
  ) : null;
}
