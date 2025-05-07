import {
  Container,
  createTheme,
  CssBaseline,
  ThemeProvider,
} from "@mui/material";
import { JSX, useEffect, useState } from "react";
import Header from "./components/Header";
import PartyFinderPage from './pages/PartyFinderPage';
import GuidesList from './components/Guide-List';
import Guide from './components/Single-Guide-Page';
import FriendsPage from './pages/FriendsPage';
import PersonalPage from "./pages/Personal-Page";
import PersonalPageWrapper from "./components/Personal-Page-Wrapper";
import SettingsPage from './components/Settings';
import LoginForm from "./pages/Login-Form";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "./context/UserContext";
import SignupForm from "./pages/Signup-Form";

function App(): JSX.Element {
  const { token, isLoading, login, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const publicRoutes = ["/", "/signup"];
    const isPublic = publicRoutes.includes(location.pathname);

    if (!token && !isLoading && !isPublic) {
      navigate("/");
    }

    async function fetchSettings() {
      if (!token) return;
      try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          const userId = decoded.userId;

          const res = await fetch(`http://localhost:3000/api/v1/users/${userId}/settings`, {
              headers: { Authorization: `Bearer ${token}` },
          });
          if(res.status === 401) {
              logout();
              return;
          }
          if (!res.ok) throw new Error('Failed to fetch settings');

          const data = await res.json();
          setDarkMode(data.darkMode ?? false);
      } catch (err: any) {
          console.error(err.message || 'Error fetching settings');
          setDarkMode(true);
      }
  }

  fetchSettings();
  }, [token, isLoading, location.pathname, navigate]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  return (
    <>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!isLoading && (
          <Container sx={{ mt: 2 }} maxWidth={false}>
            <Header isLoggedIn={!!token} onLogout={logout} />
            <Routes>
              {!token ? (
                <>
                  <Route path="/" element={<LoginForm onLogin={login} />} />
                  <Route path="/signup" element={<SignupForm />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<PartyFinderPage />} />
                  <Route path="/users/:userId" element={<PersonalPageWrapper />} />
                  <Route path="/guides" element={<GuidesList />} />
                  <Route path="/guides/:postId" element={<Guide />} />
                  <Route path="/friends" element={<FriendsPage />} />
                  <Route path="/profile" element={<PersonalPage openedUserId={JSON.parse(atob(token.split(".")[1])).userId} />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </>
              )}
            </Routes>
          </Container>
      )}
      </ThemeProvider>
    </>
  );
}

export default App;
