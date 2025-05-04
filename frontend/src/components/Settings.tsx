import React, { useEffect, useState } from 'react';
import { Container, Typography, FormControlLabel, Switch, TextField, Box, Button } from '@mui/material';
import { useUser } from "../context/UserContext";

export default function SettingsPage() {
    const { token, logout } = useUser();
    const [darkMode, setDarkMode] = useState(false);
    const [ign, setIgn] = useState(''); 

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch('http://localhost:3000/api/v1/users/userId/settings', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setDarkMode(data.dark_mode);
                    setIgn(data.ign);
                } else {
                    console.error('Failed to fetch settings:', res.statusText);
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        }
        fetchSettings();
    })

    async function updateSettings() {
        try {
            const res = await fetch('http://localhost:3000/api/v1/users/userId/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dark_mode: darkMode, ign: ign }),
            });
            if (res.status === 401) {
                logout();
              }
            if (res.ok) {
                console.log('Settings updated successfully');
            } else {
                console.error('Failed to update settings:', res.statusText);
            }
        } catch (error) {
            console.error('Error updating settings:', error);
        }
    }

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundImage: (theme) => theme.palette.mode === 'light' 
                ? 'url(/assets/background-light.jpg)' 
                : 'url(/assets/background-dark.jpg)',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
        }}>
            <Container
                    component="main"
                    maxWidth="xs"
                    sx={{
                        borderRadius: 2,
                        boxShadow: 3,
                        padding: 1,
                        backgroundColor: (theme) => theme.palette.mode === 'light' 
                            ? 'rgba(255, 255, 255, 0.8)' 
                            : 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                <Typography variant="h4" gutterBottom>Settings</Typography>
                <FormControlLabel
                    control={<Switch checked={darkMode} onChange={(event) => setDarkMode(event.target.checked)} />}
                    label="Dark Mode"
                />
                <TextField
                    label="In-Game Name (IGN)"
                    value={ign}
                    onChange={(event) => setIgn(event.target.value)}
                    fullWidth
                    margin="normal"
                />
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={updateSettings}
                >
                    Submit
                </Button>

            </Container>
        </Box>
    );
}
