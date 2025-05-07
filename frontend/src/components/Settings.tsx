import { useEffect, useState } from 'react';
import {
    Container, Typography, FormControlLabel, Switch, TextField,
    Button, Alert, Box, Fade, Tabs, Tab, Dialog, DialogTitle,
    DialogContent, DialogActions
} from '@mui/material';
import { useUser } from "../context/UserContext";
import { Setting } from '../types/Settings';

export default function SettingsPage() {
    const { token, logout, isLoading } = useUser();
    const [tabIndex, setTabIndex] = useState(0);

    const [darkMode, setDarkMode] = useState(false);
    const [ign, setIgn] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [hasFailed, setHasFailed] = useState(false);
    const [hasUpdated, setHasUpdated] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [passwordMismatch, setPasswordMismatch] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            if (!token) return logout();
            try {
                const decoded = JSON.parse(atob(token.split('.')[1]));
                const userId = decoded.userId;

                const res = await fetch(`http://localhost:3000/api/v1/users/${userId}/settings`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) throw new Error('Failed to fetch settings');

                const data = await res.json();
                setDarkMode(data.darkMode ?? false);
                setIgn(data.ign ?? '');
                setUsername(data.username ?? '');
            } catch (err: any) {
                setHasFailed(true);
                setErrorMessage(err.message || 'Error fetching settings');
            }
        }

        fetchSettings();
    }, [token]);

    if (isLoading) return null;

    async function updateSettings() {
        if (!token) return logout();
        try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            const userId = decoded.userId;
            const settings: Pick<Setting, 'userId' | 'darkMode' | 'ign'> = {
                userId, darkMode, ign
            };

            const res = await fetch(`http://localhost:3000/api/v1/users/${userId}/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update settings');

            setHasUpdated(true);
        } catch (err: any) {
            setHasFailed(true);
            setErrorMessage(err.message || 'Error updating settings');
        }
    }

    async function updateAccount() {
        setPasswordMismatch(false);
        if (password && password !== confirmPassword) {
            setPasswordMismatch(true);
            return;
        }

        if (!token) return logout();
        try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            const userId = decoded.userId;

            const payload: any = { userId, username };
            if (password) payload.password = password;

            const res = await fetch(`http://localhost:3000/api/v1/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update account');
            
            setHasUpdated(true);
        } catch (err: any) {
            setHasFailed(true);
            setErrorMessage(err.message || 'Error updating account');
        }
    }

    async function deleteAccount() {
        if (!token) return logout();
        try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            const userId = decoded.userId;

            const res = await fetch(`http://localhost:3000/api/v1/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to delete account');
            logout();
        } catch (err: any) {
            setHasFailed(true);
            setErrorMessage(err.message || 'Error deleting account');
        }
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            {hasFailed && <Fade in={hasFailed}><Alert severity="error">{errorMessage}</Alert></Fade>}
            {hasUpdated && <Fade in={hasUpdated}><Alert severity="success">Changes saved successfully!</Alert></Fade>}

            <Typography variant="h4" align="center" gutterBottom>
                Manage Your Account
            </Typography>

            <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)} centered>
                <Tab label="Settings" />
                <Tab label="Account" />
            </Tabs>

            {/* Settings Tab */}
            {tabIndex === 0 && (
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                        control={<Switch checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />}
                        label={darkMode ? "Dark Mode" : "Light Mode"}
                    />
                    <TextField
                        label="In-Game Name (IGN)"
                        value={ign}
                        onChange={e => setIgn(e.target.value)}
                        fullWidth
                    />
                    <Button variant="contained" onClick={updateSettings}>Save Settings</Button>
                </Box>
            )}

            {/* Account Tab */}
            {tabIndex === 1 && (
                <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="New Password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        fullWidth
                        error={passwordMismatch}
                        helperText={passwordMismatch ? "Passwords do not match" : ""}
                    />
                    <Button variant="contained" onClick={updateAccount}>Update Account</Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        Delete Account
                    </Button>
                </Box>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Account Deletion</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete your account? This action is permanent.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={deleteAccount}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
