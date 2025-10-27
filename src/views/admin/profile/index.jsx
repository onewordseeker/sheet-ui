import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  Divider,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  Avatar,
  Badge,
  Spinner,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import {
  MdPerson,
  MdEmail,
  MdLock,
  MdEdit,
  MdSave,
  MdCancel,
  MdVisibility,
  MdVisibilityOff,
  MdCheckCircle,
  MdError,
  MdCalendarToday,
  MdLogin,
} from 'react-icons/md';

export default function Profile() {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // User data state
  const [userData, setUserData] = useState({
    fullName: '',
    email: '',
    accountCreated: '',
    lastLogin: '',
  });

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password visibility
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const bgCard = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('secondaryGray.600', 'secondaryGray.400');

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setProfileForm({
          fullName: data.user.fullName,
          email: data.user.email,
        });
      } else {
        // Fallback to localStorage
        const storedUser = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
        setUserData({
          fullName: storedUser.fullName || 'John Doe',
          email: storedUser.email || 'admin@example.com',
          accountCreated: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        });
        setProfileForm({
          fullName: storedUser.fullName || 'John Doe',
          email: storedUser.email || 'admin@example.com',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to localStorage
      const storedUser = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
      setUserData({
        fullName: storedUser.fullName || 'John Doe',
        email: storedUser.email || 'admin@example.com',
        accountCreated: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });
      setProfileForm({
        fullName: storedUser.fullName || 'John Doe',
        email: storedUser.email || 'admin@example.com',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileInputChange = (field, value) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5001/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(prev => ({
          ...prev,
          ...data.user
        }));
        
        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem('userData') || sessionStorage.getItem('userData') || '{}');
        const updatedUser = { ...currentUser, ...data.user };
        if (localStorage.getItem('userData')) {
          localStorage.setItem('userData', JSON.stringify(updatedUser));
        } else {
          sessionStorage.setItem('userData', JSON.stringify(updatedUser));
        }

        setIsEditing(false);
        toast({
          title: 'Profile updated successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'There was an error updating your profile. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: 'All fields required',
        description: 'Please fill in all password fields',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure the new password and confirmation match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 8 characters long',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch('http://localhost:5001/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        onClose();
        toast({
          title: 'Password changed successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to change password');
      }
    } catch (error) {
      toast({
        title: 'Password change failed',
        description: error.message || 'There was an error changing your password',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isLoading) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Center h="400px">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color={textColorSecondary}>Loading profile...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color={textColor} mb={2}>
            Profile Settings
          </Text>
          <Text color={textColorSecondary}>
            Manage your account information and security settings
          </Text>
        </Box>

        {/* Profile Overview */}
        <Card bg={bgCard}>
          <CardHeader>
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                Account Overview
              </Text>
              <Button
                leftIcon={<Icon as={isEditing ? MdCancel : MdEdit} />}
                colorScheme={isEditing ? "red" : "blue"}
                variant="outline"
                onClick={() => {
                  if (isEditing) {
                    setProfileForm({
                      fullName: userData.fullName,
                      email: userData.email,
                    });
                  }
                  setIsEditing(!isEditing);
                }}
                isDisabled={isSaving}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={6}>
              {/* Avatar and Basic Info */}
              <HStack spacing={6} w="100%">
                <Avatar
                  size="xl"
                  name={userData.fullName}
                  bg="blue.500"
                  color="white"
                />
                <VStack align="start" spacing={2}>
                  <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                    {userData.fullName}
                  </Text>
                  <Text color={textColorSecondary}>
                    {userData.email}
                  </Text>
                  <Badge colorScheme="green" variant="subtle">
                    Active Account
                  </Badge>
                </VStack>
              </HStack>

              <Divider />

              {/* Editable Profile Fields */}
              <VStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>
                    <HStack>
                      <Icon as={MdPerson} color="blue.500" />
                      <Text>Full Name</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    value={profileForm.fullName}
                    onChange={(e) => handleProfileInputChange('fullName', e.target.value)}
                    isDisabled={!isEditing || isSaving}
                    placeholder="Enter your full name"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>
                    <HStack>
                      <Icon as={MdEmail} color="green.500" />
                      <Text>Email Address</Text>
                    </HStack>
                  </FormLabel>
                  <Input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => handleProfileInputChange('email', e.target.value)}
                    isDisabled={!isEditing || isSaving}
                    placeholder="Enter your email address"
                  />
                </FormControl>
              </VStack>

              {isEditing && (
                <Button
                  leftIcon={<Icon as={MdSave} />}
                  colorScheme="blue"
                  onClick={handleSaveProfile}
                  isLoading={isSaving}
                  loadingText="Saving..."
                  w="100%"
                  maxW="300px"
                >
                  Save Changes
                </Button>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Account Information */}
        <Card bg={bgCard}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Account Information
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <HStack>
                  <Icon as={MdCalendarToday} color="purple.500" />
                  <Text color={textColor}>Account Created:</Text>
                </HStack>
                <Text color={textColorSecondary}>
                  {formatDate(userData.accountCreated)}
                </Text>
              </HStack>

              <HStack justify="space-between">
                <HStack>
                  <Icon as={MdLogin} color="orange.500" />
                  <Text color={textColor}>Last Login:</Text>
                </HStack>
                <Text color={textColorSecondary}>
                  {formatDate(userData.lastLogin)}
                </Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Security Settings */}
        <Card bg={bgCard}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Security Settings
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <Button
                leftIcon={<Icon as={MdLock} />}
                colorScheme="orange"
                variant="outline"
                onClick={onOpen}
                w="100%"
                maxW="300px"
              >
                Change Password
              </Button>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Password Requirements:</AlertTitle>
                  <AlertDescription>
                    • Minimum 8 characters<br/>
                    • At least one uppercase letter<br/>
                    • At least one number<br/>
                    • At least one special character
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Change Password Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Current Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                    placeholder="Enter current password"
                  />
                  <InputRightElement>
                    <Icon
                      as={showPasswords.current ? MdVisibilityOff : MdVisibility}
                      cursor="pointer"
                      onClick={() => togglePasswordVisibility('current')}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>New Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                    placeholder="Enter new password"
                  />
                  <InputRightElement>
                    <Icon
                      as={showPasswords.new ? MdVisibilityOff : MdVisibility}
                      cursor="pointer"
                      onClick={() => togglePasswordVisibility('new')}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel>Confirm New Password</FormLabel>
                <InputGroup>
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <InputRightElement>
                    <Icon
                      as={showPasswords.confirm ? MdVisibilityOff : MdVisibility}
                      cursor="pointer"
                      onClick={() => togglePasswordVisibility('confirm')}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleChangePassword}
              isLoading={isChangingPassword}
              loadingText="Changing..."
            >
              Change Password
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
