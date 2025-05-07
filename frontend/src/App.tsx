import {
  Container,
  CssBaseline,
} from "@mui/material";
import { JSX } from "react";
import Header from "./components/Header";
import PartyFinderPage from './pages/PartyFinderPage';
//import GuidesPage from './pages/GuidesPage';
//import FriendsPage from './pages/FriendsPage';
import PersonalPage from "./components/Personal-Page";
import SettingsPage from './components/Settings';
import LoginForm from "./pages/Login-Form";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useUser } from "./context/UserContext";

function App(): JSX.Element {
  const { token, isLoading, login, logout } = useUser();

  return (
    <>
      <CssBaseline />
      {!isLoading && (
        <BrowserRouter>
          <Container sx={{ mt: 2 }} maxWidth={false}>
            <Header isLoggedIn={!!token} onLogout={logout} />
            {!token ? (
              <LoginForm onLogin={login} />
            ) : (
              <Routes>
                <Route path="/" element={<PartyFinderPage />} />
                {/*<Route path="/guides" element={<GuidesPage />} />
                <Route path="/friends" element={<FriendsPage />} /> */}
                <Route path="/profile" element={<PersonalPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            )}
          </Container>
        </BrowserRouter>
      )}
    </>
  );
}

export default App;
