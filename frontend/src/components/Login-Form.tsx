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
    FormControlLabel
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import GoogleIcon from '@mui/icons-material/Google';

export default function LoginPage() {
    const handleSubmit = (event: { preventDefault: () => void; currentTarget: HTMLFormElement | undefined; }) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        console.log({
            email: data.get('email'),
            password: data.get('password'),
            rememberMe: data.get('rememberMe') === 'on',
        });
    };

    return (
        <Container
            component="main"
            maxWidth="xs"
            sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: 2,
                boxShadow: 3,
                padding: 1
            }}
        >
            <CssBaseline />
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
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
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
                    />
                    <FormControlLabel
                        control={<Checkbox name="rememberMe" color="primary" />}
                        label="Remember me"
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
                                href="#" 
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
                        sx={{ mt: 1, mb: 2, bgcolor: 'red', '&:hover': { bgcolor: 'darkred' } }}
                    >
                        Sign in with Google
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}