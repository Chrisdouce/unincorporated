import { 
  Container,
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Fade
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { baseUrl } from '../services/BaseUrl';

export default function SignUpPage() {

  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hasFailedSignup, setHasFailedSignup] = useState(false);
  const [failedSignupMessage, setFailedSignupMessage] = useState('');

  function handleUpdateUsername(value: string) {
    setUsername(value);
    setHasFailedSignup(false);
  }

  function handleUpdatePassword(value: string) {
    setPassword(value);
    setHasFailedSignup(false);
  }

  function handleUpdateConfirmPassword(value: string) {
    setConfirmPassword(value);
    setHasFailedSignup(false);
  }

  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!username || !password || !confirmPassword) {
      setHasFailedSignup(true);
      setFailedSignupMessage("All fields are required");
      return;
    }
    if (password !== confirmPassword) {
      setHasFailedSignup(true);
      setFailedSignupMessage("Passwords do not match");
      return;
    }
    let res = null;
    try {
      res = await fetch(`${baseUrl}/api/v1/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
    } catch (error) {
      setHasFailedSignup(true);
      setFailedSignupMessage('Network error. Please try again later.');
      return;
    }
    
    const data = await res.json();
    if (data.error) {
      setFailedSignupMessage(data.error);
    }
    if (res.status !== 201) {
      setHasFailedSignup(true);
      setFailedSignupMessage(data.error);
      return;
    } else {
      navigate('/', {
        state: { 
          newlyRegistered: true,
          registeredUsername: username 
        }
      });
    }
  };

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
      {hasFailedSignup && (
        <Fade in={hasFailedSignup}>
          <Box
            sx={{
              position: 'fixed',
              top: '10%',
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
        <Container component="main" maxWidth="xs">
          <Box
            sx={{
              marginTop: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign up
            </Typography>
            <Box component="form" onSubmit={handleSignupSubmit} noValidate sx={{ mt: 1 }}>
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
                autoComplete="new-password"
                onChange={(e) => handleUpdatePassword(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                autoComplete="new-password"
                onChange={(e) => handleUpdateConfirmPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Sign Up
              </Button>
              <Typography variant="body2" sx={{ textAlign: 'center' }}>
                {"Already have an account? "}
                <Link 
                  component={RouterLink}
                  to="/"
                  variant="body2"
                  sx={{ 
                      textDecoration: 'none', 
                      '&:hover': { textDecoration: 'underline' } 
                  }}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Container>
      </Container>
    </Box>
  );
}