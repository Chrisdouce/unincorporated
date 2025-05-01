import React from 'react';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function App() {
  const [tabValue, setTabValue] = React.useState(1);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const tabLabels = ["Party Finder", "Guides", "Friends"];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

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
          <MenuItem onClick={handleMenuClose}>Logout</MenuItem>
        </Menu>
      </Toolbar>
      </AppBar>

      <Paper sx={{ margin: 2, padding: 5 }}>
        <Typography variant="h5" align="center">
          {tabLabels[tabValue]}
        </Typography>
      </Paper>

      <Box sx={{ padding: 2, paddingLeft: 5, paddingRight: 5, paddingTop: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, paddingBottom: 2 }}>
          <Button variant="outlined">Create</Button>
          <Box sx={{ flexGrow: 1 }}>
            <TextField fullWidth label="Search" variant="outlined" />
          </Box>
          <Button variant="outlined">Filter</Button>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, padding: 2, border: '2px solid', borderColor: 'black', borderRadius: 2, marginBottom: 2 }}>
          <Typography>Diana</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {[...Array(5)].map((_, index) => (
              <Box key={index} sx={{ width: 40, height: 40, border: '2px solid', borderColor: index % 2 ? 'yellow' : 'black' }} />
            ))}
          </Box>
          <Typography>Message</Typography>
          <Typography>2/5</Typography>
          <Button variant="outlined">Join</Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, padding: 2, border: '2px solid', borderColor: 'black', borderRadius: 2 }}>
          <Typography>Dungeons</Typography>
          {[...Array(5)].map((_, index) => (
            <Box key={index} sx={{ width: 40, height: 40, border: '2px solid', borderColor: index % 2 ? 'yellow' : 'black' }} />
          ))}
          <Typography>Message</Typography>
          <Typography>4/5</Typography>
          <Button variant="outlined">Join</Button>
        </Box>
      </Box>
    </Box>
  );
}
