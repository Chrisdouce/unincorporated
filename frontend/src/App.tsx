import {
  Container,
  CssBaseline,
} from "@mui/material";
import { JSX, useEffect } from "react";
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

  useEffect(() => {
    const publicRoutes = ["/", "/signup"];
    const isPublic = publicRoutes.includes(location.pathname);

    if (!token && !isLoading && !isPublic) {
      navigate("/");
    }
  }, [token, isLoading, location.pathname, navigate]);

  return (
    <>
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
    </>
  );
}

export default App;
