import { useEffect, useState } from 'react';
import { Container, Typography, FormControlLabel, Switch, TextField, Button } from '@mui/material';
import { useUser } from "../context/UserContext";
import { Setting } from '../types/Settings';

export default function SettingsPage() {
    const { token, logout, isLoading } = useUser();
    const [darkMode, setDarkMode] = useState(false);
    const [ign, setIgn] = useState(''); 

    useEffect(() => {
        async function fetchSettings() {
            try {
                if (!token) {
                    logout();
                    return;
                }
                const decodedToken = JSON.parse(atob(token.split('.')[1]));
                const userId = decodedToken.userId;
                const res = await fetch(`http://localhost:3000/api/v1/users/${userId}/settings`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (res.status === 200) {
                    const data = await res.json();
                    setDarkMode(data.darkMode ?? false);
                    setIgn(data.ign ?? '');
                } else {
                    console.error('Failed to fetch settings:', res.statusText);
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        }
        fetchSettings();
    }, [token]);
    
    if (isLoading) return null;
    async function updateSettings() {
        try {
            if (!token) {
                logout();
                return;
            }
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const userId = decodedToken.userId;
            const newSettings: Pick<Setting, 'userId' | 'darkMode' | 'ign'> = {
                userId: userId,
                darkMode: darkMode,
                ign: ign,
            };
            const res = await fetch(`http://localhost:3000/api/v1/users/${userId}/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newSettings),
            });
            const data = await res.json();
            if (res.status === 401) {
                logout();
                return;
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
        <><Container
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
                    label="Dark Mode" />
                <TextField
                    label="In-Game Name (IGN)"
                    value={ign}
                    onChange={(event) => setIgn(event.target.value)}
                    fullWidth
                    margin="normal" />
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={updateSettings}
                >
                    Submit
                </Button>

            </Container></>
    );
}
