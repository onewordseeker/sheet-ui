import React from 'react';
import { Button, Icon, useToast } from '@chakra-ui/react';
import { MdLogout } from 'react-icons/md';
import { useAuth } from 'contexts/AuthContext';

export default function LogoutButton({ variant = "ghost", size = "sm", ...props }) {
  const toast = useToast();
  const { logout, getToken } = useAuth();

  const handleLogout = async () => {
    try {
      // Call logout API if available
      const token = getToken();
      if (token) {
        await fetch(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      toast({
        title: "Logged out successfully!",
        description: "You have been securely logged out",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Use AuthContext logout
      logout();
    }
  };

  return (
    <Button
      leftIcon={<Icon as={MdLogout} />}
      colorScheme="red"
      variant={variant}
      size={size}
      onClick={handleLogout}
      {...props}
    >
      Logout
    </Button>
  );
}
