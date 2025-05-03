import { Box } from "@mui/material"
import LoginForm from "./components/Login-Form"
import SignupForm from "./components/Signup-Form"

function App() {
    return (
        <>
            <h1>Demo for login + sign up components</h1>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 2 }}>
                <LoginForm />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: 2 }}>
                <SignupForm />
            </Box>
        </>
    )
}

export default App