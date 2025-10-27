import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Switch,
  Icon,
  Spinner,
  Center,
} from '@chakra-ui/react';
import {
  MdSave,
  MdRefresh,
  MdSettings,
  MdKey,
  MdScience,
  MdCheckCircle,
  MdError,
  MdInfo,
} from 'react-icons/md';

export default function Settings() {
  const toast = useToast();
  
  // Settings state
  const [settings, setSettings] = useState({
    // Generation Settings
    numberOfSheets: 1,
    chatgptModel: 'gpt-4o',
    customPrompt: '',
    
    // API Settings
    openaiApiKey: '',
    apiKeyVisible: false,
    
    // System Settings
    autoSave: true,
    notifications: true,
    darkMode: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState(null);

  const bgCard = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('secondaryGray.600', 'secondaryGray.400');

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(prev => ({
          ...prev,
          ...data.settings,
          openaiApiKey: data.settings.openaiApiKey ? '••••••••••••••••' : '',
        }));
      } else {
        // Fallback to localStorage
        const storedSettings = JSON.parse(localStorage.getItem('appSettings') || '{}');
        setSettings(prev => ({
          ...prev,
          ...storedSettings,
          openaiApiKey: storedSettings.openaiApiKey ? '••••••••••••••••' : '',
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Fallback to localStorage
      const storedSettings = JSON.parse(localStorage.getItem('appSettings') || '{}');
      setSettings(prev => ({
        ...prev,
        ...storedSettings,
        openaiApiKey: storedSettings.openaiApiKey ? '••••••••••••••••' : '',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSwitchChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsToSave = {
        ...settings,
        openaiApiKey: settings.openaiApiKey === '••••••••••••••••' ? undefined : settings.openaiApiKey,
      };

      const response = await fetch('http://localhost:5001/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ settings: settingsToSave }),
      });

      if (response.ok) {
        // Also save to localStorage as backup
        localStorage.setItem('appSettings', JSON.stringify(settingsToSave));
        
        toast({
          title: 'Settings saved successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      // Fallback to localStorage
      localStorage.setItem('appSettings', JSON.stringify(settings));
      
      toast({
        title: 'Settings saved locally!',
        description: 'Settings saved to browser storage (API unavailable)',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestApiKey = async () => {
    if (!settings.openaiApiKey || settings.openaiApiKey === '••••••••••••••••') {
      toast({
        title: 'API Key Required',
        description: 'Please enter your OpenAI API key first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsTestingApi(true);
    setApiTestResult(null);

    try {
      const response = await fetch('http://localhost:5001/api/test-openai-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ apiKey: settings.openaiApiKey }),
      });

      const data = await response.json();

      if (response.ok) {
        setApiTestResult({ success: true, message: 'API key is valid and working!' });
        toast({
          title: 'API Key Test Successful!',
          description: 'Your OpenAI API key is working correctly',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        setApiTestResult({ success: false, message: data.message || 'API key test failed' });
      }
    } catch (error) {
      setApiTestResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setIsTestingApi(false);
    }
  };

  const toggleApiKeyVisibility = () => {
    setSettings(prev => ({
      ...prev,
      apiKeyVisible: !prev.apiKeyVisible
    }));
  };

  const defaultPrompt = `You are an AI assistant specialized in generating academic answer sheets. Your task is to create comprehensive, well-structured answer sheets based on the provided questionnaire and reference materials.

Guidelines:
1. Analyze the questionnaire thoroughly to understand the questions and requirements
2. Use the reference answer sheets as examples for format, style, and depth
3. Generate answers that are:
   - Academically sound and well-reasoned
   - Properly formatted and structured
   - Comprehensive but concise
   - Professional in tone
4. Ensure answers demonstrate understanding of the subject matter
5. Follow the NEBOSH format and standards where applicable
6. Include relevant examples and explanations where appropriate

Generate high-quality answer sheets that would be suitable for academic assessment.`;

  if (isLoading) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Center h="400px">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color={textColorSecondary}>Loading settings...</Text>
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
            System Settings
          </Text>
          <Text color={textColorSecondary}>
            Configure your Answer Sheet Generator preferences and AI behavior
          </Text>
        </Box>

        {/* Generation Settings */}
        <Card bg={bgCard}>
          <CardHeader>
            <HStack>
              <Icon as={MdSettings} color="blue.500" />
              <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                Generation Settings
              </Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Number of Sheets to Generate</FormLabel>
                  <NumberInput
                    value={settings.numberOfSheets}
                    onChange={(value) => handleInputChange('numberOfSheets', parseInt(value))}
                    min={1}
                    max={10}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <Text fontSize="sm" color={textColorSecondary} mt={1}>
                    Default number of answer sheets to generate per request
                  </Text>
                </FormControl>
                <FormControl>
                  <FormLabel>OpenAI Model</FormLabel>
                  <Select
                    value={settings.chatgptModel}
                    onChange={(e) => handleInputChange('chatgptModel', e.target.value)}
                  >
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4.1-mini">GPT-4.1 Mini (Recommended)</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Legacy)</option>
                  </Select>
                  <Text fontSize="sm" color={textColorSecondary} mt={1}>
                    Choose the AI model for answer generation
                  </Text>
                </FormControl>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Custom AI Prompt */}
        <Card bg={bgCard}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Custom AI Prompt
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>System Prompt for Answer Generation</FormLabel>
                <Textarea
                  value={settings.customPrompt || defaultPrompt}
                  onChange={(e) => handleInputChange('customPrompt', e.target.value)}
                  rows={8}
                  placeholder={defaultPrompt}
                />
                <Text fontSize="sm" color={textColorSecondary} mt={1}>
                  This prompt guides the AI in generating answer sheets. Modify it to customize the style and approach.
                </Text>
                <Text fontSize="sm" color={textColorSecondary}>
                  Characters: {settings.customPrompt?.length || defaultPrompt.length}
                </Text>
              </FormControl>
              
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Custom Prompt Tips:</AlertTitle>
                  <AlertDescription>
                    • Be specific about the format and style you want<br/>
                    • Include examples of good answers<br/>
                    • Specify the academic level and subject area<br/>
                    • Mention any special requirements or standards
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </CardBody>
        </Card>

        {/* API Key Management */}
        <Card bg={bgCard}>
          <CardHeader>
            <HStack>
              <Icon as={MdKey} color="orange.500" />
              <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                API Key Management
              </Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>OpenAI API Key</FormLabel>
                <HStack>
                  <Input
                    type={settings.apiKeyVisible ? "text" : "password"}
                    placeholder="Enter your OpenAI API key"
                    value={settings.openaiApiKey}
                    onChange={(e) => handleInputChange('openaiApiKey', e.target.value)}
                  />
                  <Button
                    onClick={toggleApiKeyVisibility}
                    variant="outline"
                    size="md"
                  >
                    {settings.apiKeyVisible ? "Hide" : "Show"}
                  </Button>
                  <Button
                    leftIcon={<Icon as={MdScience} />}
                    colorScheme="blue"
                    variant="outline"
                    onClick={handleTestApiKey}
                    isLoading={isTestingApi}
                    loadingText="Testing..."
                  >
                    Test
                  </Button>
                </HStack>
                <Text fontSize="sm" color={textColorSecondary} mt={1}>
                  Your API key is stored securely and used only for generating answer sheets
                </Text>
              </FormControl>

              {apiTestResult && (
                <Alert status={apiTestResult.success ? "success" : "error"} borderRadius="md">
                  <AlertIcon as={apiTestResult.success ? MdCheckCircle : MdError} />
                  <Box>
                    <AlertTitle>{apiTestResult.success ? "Success!" : "Error"}</AlertTitle>
                    <AlertDescription>{apiTestResult.message}</AlertDescription>
                  </Box>
                </Alert>
              )}

              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>API Key Security:</AlertTitle>
                  <AlertDescription>
                    • Never share your API key with others<br/>
                    • Keep your API key secure and private<br/>
                    • Monitor your OpenAI usage to avoid unexpected charges<br/>
                    • You can find your API key at: https://platform.openai.com/api-keys
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </CardBody>
        </Card>

        {/* System Preferences */}
        <Card bg={bgCard}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              System Preferences
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <HStack justify="space-between" w="100%">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium" color={textColor}>Auto-save Settings</Text>
                  <Text fontSize="sm" color={textColorSecondary}>
                    Automatically save settings when changes are made
                  </Text>
                </VStack>
                <Switch
                  isChecked={settings.autoSave}
                  onChange={(e) => handleSwitchChange('autoSave', e.target.checked)}
                />
              </HStack>

              <HStack justify="space-between" w="100%">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium" color={textColor}>Notifications</Text>
                  <Text fontSize="sm" color={textColorSecondary}>
                    Show notifications for successful operations and errors
                  </Text>
                </VStack>
                <Switch
                  isChecked={settings.notifications}
                  onChange={(e) => handleSwitchChange('notifications', e.target.checked)}
                />
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Action Buttons */}
        <Card bg={bgCard}>
          <CardBody>
            <HStack spacing={4} justify="center">
              <Button
                leftIcon={<Icon as={MdSave} />}
                colorScheme="blue"
                onClick={handleSave}
                isLoading={isSaving}
                loadingText="Saving..."
                size="lg"
              >
                Save Settings
              </Button>
              <Button
                leftIcon={<Icon as={MdRefresh} />}
                variant="outline"
                onClick={loadSettings}
                size="lg"
              >
                Reset to Saved
              </Button>
            </HStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
