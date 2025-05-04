import { 
    Container,
    CssBaseline,
    Box,
    Avatar,
    Typography,
    TextField,
    Button,
    Divider,
    Link,
    Checkbox,
    FormControlLabel,
    Alert
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import GoogleIcon from '@mui/icons-material/Google';
import { JSX, useState } from 'react';
import { useNavigate } from 'react-router';

type Props = {
    onLogin: (token: string) => void;
}

export default function LoginPage({onLogin}: Props): JSX.Element {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [hasFailedLogin, setHasFailedLogin] = useState(false);
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
        if (!username || !password) return;
        const res = await fetch('http://localhost:3000/api/v1/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        if (res.status !== 200) {
            console.log('Login failed:', res.status, res.statusText);
            setHasFailedLogin(true);
            console.log(hasFailedLogin);
            return;
        }
        const data = await res.json();
        onLogin(data.token);
    }
    
    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
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
            <CssBaseline />
            {hasFailedLogin && (
                <Alert variant="outlined" severity="error">
                    Invalid username or password. Please try again.
                </Alert>
            )}
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
                                href="/signup" 
                                variant="body2" 
                                sx={{ 
                                    textDecoration: 'none', 
                                    '&:hover': { textDecoration: 'underline' } 
                                }}
                            >
                                Sign Up
                            </Link>
                        </Typography>
                    </Box>
                    <Box sx={{ mt: 3, mb: 2, display: 'flex', alignItems: 'center' }}>
                        <Divider sx={{ flexGrow: 1 }} />
                        <Typography variant="body2" sx={{ px: 2 }}>Or</Typography>
                        <Divider sx={{ flexGrow: 1 }} />
                    </Box>
                    <Button
                        fullWidth
                        variant="contained"
                        startIcon={<GoogleIcon />}
                        sx={{ 
                            mt: 1, 
                            mb: 2, 
                            bgcolor: '#4285F4', 
                            color: 'white', 
                            '&:hover': { bgcolor: '#357AE8' } 
                        }}
                    >
                        Sign in with Google
                    </Button>
                </Box>
            </Box>
        </Container>
        </Box>
    );
}