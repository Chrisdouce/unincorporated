import { 
    Container,
    Box,
    Avatar,
    Typography,
    TextField,
    Button,
    Link,
    Checkbox,
    FormControlLabel,
    Alert,
    Fade
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import { Link as RouterLink } from 'react-router-dom';
import { JSX, useState } from 'react';

type Props = {
    onLogin: (token: string, rememberMe: boolean) => void;
}

export default function LoginPage({onLogin}: Props): JSX.Element {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [hasFailedLogin, setHasFailedLogin] = useState(false);
    const [failedSignupMessage, setFailedSignupMessage] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    function handleUpdateUsername(value: string) {
        setUsername(value);
        setHasFailedLogin(false);
    }
    
    function handleUpdatePassword(value: string) {
        setPassword(value);
        setHasFailedLogin(false);
    }

    async function handleLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!username || !password) {
            setHasFailedLogin(true);
            setFailedSignupMessage('Invalid username or password');
            return;
        }
        let res = null;
        try {
            res = await fetch('http://localhost:3000/api/v1/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
        } catch (error) {
            setHasFailedLogin(true);
            setFailedSignupMessage('Network error. Please try again later.');
            return;
        }
        if (res.status !== 200) {
            setHasFailedLogin(true);
            setFailedSignupMessage('Invalid username or password');
            return;
        }
        const data = await res.json();
        onLogin(data.token, rememberMe);
    }
    
    return (
        <Box
        sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}
        >
            {hasFailedLogin && (
            <Fade in={hasFailedLogin}>
                <Box
                sx={{
                    position: 'fixed',
                    top: '5%',
                    zIndex: 10,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                }}
                > 
                <Alert
                variant="outlined"
                severity="error"
                sx={{ mb: 2, width: '100%', maxWidth: 400 }}
                >
                {failedSignupMessage}
                </Alert>
                </Box>
            </Fade>
            )}
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
                <Box
                    sx={{
                        marginTop: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                        <LoginIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <Box component="form" onSubmit={handleLoginSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            onChange={(e) => handleUpdateUsername(e.target.value)}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            onChange={(e) => handleUpdatePassword(e.target.value)}
                        />
                        <FormControlLabel
                            control={<Checkbox name="rememberMe" color="primary" />}
                            label="Remember me"
                            onChange={(e) => setRememberMe((e.target as HTMLInputElement).checked)}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </Button>
                        <Box>
                            <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                {"Don't have an account? "}
                                <Link 
                                    component={RouterLink}
                                    to="/signup"
                                    variant="body2"
                                    >
                                    Sign Up
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}