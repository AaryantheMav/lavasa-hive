import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Listings from './pages/Listings';
import AdminLayout from './components/AdminLayout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e',
      light: '#534bae',
      dark: '#000051'
    },
    secondary: {
      main: '#c62828',
      light: '#ff5f52',
      dark: '#8e0000'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600
    }
  }
});

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  return token ? <AdminLayout>{children}</AdminLayout> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/listings" element={<ProtectedRoute><Listings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
