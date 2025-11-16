import dynamic from 'next/dynamic';
import { CircularProgress, Box } from '@mui/material';

// Dynamically import ProtectedRoute with no SSR
const DynamicProtectedRoute = dynamic(
  () => import('./ProtectedRoute'),
  {
    ssr: false,
    loading: () => (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    ),
  }
);

export default DynamicProtectedRoute;
