import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from 'contexts/AuthContext';
import { Box, Spinner, Center, Text } from '@chakra-ui/react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Center h="400px">
          <Box textAlign="center">
            <Spinner size="xl" color="blue.500" mb={4} />
            <Text color="gray.500">Loading...</Text>
          </Box>
        </Center>
      </Box>
    );
  }

  if (!isAuthenticated()) {
    // Redirect to sign-in page with return url
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
