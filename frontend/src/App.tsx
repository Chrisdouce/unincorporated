import {
  Container,
  CssBaseline,
} from "@mui/material";
import { JSX } from "react";
import Header from "./components/Header";
import PartyFinderPage from './pages/PartyFinderPage';
import GuidesList from './components/Guide-List';
import Guide from './components/Single-Guide';
//import FriendsPage from './pages/FriendsPage';
import PersonalPage from "./components/Personal-Page";
import SettingsPage from './components/Settings';
import LoginForm from "./pages/Login-Form";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useUser } from "./context/UserContext";
import SignupForm from "./pages/Signup-Form";

function App(): JSX.Element {
  const { token, isLoading, login, logout } = useUser();
  
  return (
    <>
      <CssBaseline />
      {!isLoading && (
        <BrowserRouter>
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
                  <Route path="/guides" element={<GuidesList />} />
                  <Route path="/guides/:postId" element={<Guide />} />
                  {/*<Route path="/friends" element={<FriendsPage />} />*/}
                  <Route path="/profile" element={<PersonalPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </>
              )}
            </Routes>
          </Container>
        </BrowserRouter>
      )}
    </>
  );
}

export default App;
