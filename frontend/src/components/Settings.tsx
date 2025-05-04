import { useEffect, useState } from 'react';
import { Container, Typography, FormControlLabel, Switch, TextField, Button, Alert, Box, Fade } from '@mui/material';
import { useUser } from "../context/UserContext";
import { Setting } from '../types/Settings';

export default function SettingsPage() {
    const { token, logout, isLoading } = useUser();
    const [darkMode, setDarkMode] = useState(false);
    const [ign, setIgn] = useState(''); 
    const [hasFailedSettings, setHasFailedSettings] = useState(false);
    const [hasUpdatedSettings, setHasUpdatedSettings] = useState(false);
    const [failedSettingsMessage, setFailedSettingsMessage] = useState('');

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
                    setHasFailedSettings(true);
                    setFailedSettingsMessage('Failed to fetch settings. Please try again later.');
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
                setHasFailedSettings(true);
                setFailedSettingsMessage('An error occurred while fetching settings. Please try again later.');
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
                setHasUpdatedSettings(true);
                console.log('Settings updated successfully');
            } else {
                setHasFailedSettings(true);
                setFailedSettingsMessage(data.error);
            }
        } catch (error) {
            setHasFailedSettings(true);
            setFailedSettingsMessage('An error occurred while updating settings. Please try again later.');
            console.error('Error updating settings:', error);
        }
    }

    function handleDarkModeChange(event: React.ChangeEvent<HTMLInputElement>) {
        setDarkMode(event.target.checked);
        setHasFailedSettings(false);
        setHasUpdatedSettings(false);
    }

    function handleIgnChange(value: string): void {
        setIgn(value);
        setHasFailedSettings(false);
        setHasUpdatedSettings(false);
    }

    return (
        <Container
            component="main"
            maxWidth="xs"
            sx={{
                borderRadius: 2,
                boxShadow: 3,
                padding: 3,
                mt: 8,
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                        ? 'rgba(255, 255, 255, 0.8)'
                        : 'rgba(0, 0, 0, 0.8)',
                backdropFilter: 'blur(8px)',
            }}
        >
            <Box sx={{ mb: 2 }}>
                {hasFailedSettings && (
                    <Fade in={hasFailedSettings}>
                        <Alert
                            variant="outlined"
                            severity="error"
                            sx={{ width: '100%' }}
                        >
                            {failedSettingsMessage}
                        </Alert>
                    </Fade>
                )}
                {hasUpdatedSettings && (
                    <Fade in={hasUpdatedSettings}>
                        <Alert
                            variant="outlined"
                            severity="success"
                            sx={{ width: '100%' }}
                        >
                            Settings updated successfully!
                        </Alert>
                    </Fade>
                )}
            </Box>
            <Typography variant="h4" gutterBottom align="center">
                Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={darkMode}
                            onChange={handleDarkModeChange}
                        />
                    }
                    label="Dark Mode"
                />
                <TextField
                    label="In-Game Name (IGN)"
                    value={ign}
                    onChange={(e) => handleIgnChange(e.target.value)}
                    fullWidth
                />
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    onClick={updateSettings}
                    sx={{ mt: 2 }}
                >
                    Submit
                </Button>
            </Box>
        </Container>
    );
}
