import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import dynamic from 'next/dynamic';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Alert,
  CircularProgress 
} from '@mui/material';

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = [] }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure we're on the client side
    setIsClient(true);
    
    // Wait a moment for auth to initialize
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleNavigation = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  if (loading || !isClient) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            You need to be logged in to access this page.
          </Alert>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Please log in to continue.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleNavigation}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  // Check role-based access if required
  if (requiredRole && user.role !== requiredRole) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            You don&apos;t have permission to access this page.
          </Alert>
          <Typography variant="h6" gutterBottom>
            Insufficient Permissions
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            This page requires {requiredRole} role. Your current role: {user.role}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleNavigation}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  // Check if user role is in allowed roles list
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Box sx={{ p: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            You don&apos;t have permission to access this page.
          </Alert>
          <Typography variant="h6" gutterBottom>
            Insufficient Permissions
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            This page requires one of these roles: {allowedRoles.join(', ')}. 
            Your current role: {user.role}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleNavigation}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
