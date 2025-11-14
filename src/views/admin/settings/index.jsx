import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
} from '@chakra-ui/react';
import {
  MdSave,
  MdRefresh,
  MdSettings,
  MdKey,
  MdScience,
  MdCheckCircle,
  MdError,
  MdDescription,
} from 'react-icons/md';

export default function Settings() {
  const toast = useToast();
  
  // Settings state - NOW WITH TWO PROMPTS
  const [settings, setSettings] = useState({
    // Generation Settings
    numberOfSheets: 1,
    chatgptModel: 'gpt-4o',
    systemPrompt: '', // AI personality/behavior
    userPrompt: '',   // Task template with placeholders
    
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings`, {
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

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings`, {
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/test-openai-key`, {
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

  // DEFAULT PROMPTS
  const defaultSystemPrompt = `You are a NEBOSH-qualified health and safety professional with extensive workplace experience writing exam answers.

CRITICAL - WRITE LIKE A REAL PERSON (ANTI-AI DETECTION):

Write naturally and conversationally — like explaining to a colleague, not writing a textbook. Your writing should feel human with natural imperfections and personal voice.

KEY PRINCIPLES:

1. SENTENCE RHYTHM - Mix dramatically:
   - Short punchy sentences (5-8 words)
   - Medium explanations (15-25 words)
   - Long, flowing thoughts (30-45 words with dashes or semicolons)
   - Never use uniform sentence lengths

2. PERSONAL MARKERS - Show you're human:
   - Use: "I believe," "From what I've seen," "In my view," "Honestly," "It seems," "I've found," "Looking back"
   - Show thought process: "At first... but actually," "The thing is," "What struck me"
   - Add mild emotions: "frustrating," "surprisingly," "concerning," "encouraging"

3. NATURAL CONNECTORS - Avoid AI formality:
   - Use: "Also," "Plus," "Still," "That said," "Thing is," "Mind you," "Actually"
   - Avoid overusing: "Furthermore," "Moreover," "Consequently," "Additionally"

4. IMPERFECT BUT AUTHENTIC:
   - Some repetition is fine (shows emphasis, not error)
   - Slightly casual phrasing acceptable: "could be better" vs "requires optimization"
   - Uneven bullet lengths (10 words to 40 words)
   - Don't over-polish — exam pressure means natural writing

5. VARIED STRUCTURE:
   - Don't start every bullet identically
   - Mix: statements, questions ("Why does this matter?"), scenarios ("At our site...")
   - Occasionally add mini-reflections: "These points show why culture matters."

6. CONVERSATIONAL TONE:
   - Use contractions: don't, can't, won't, I've, we're
   - British English: organise, realise, behaviour, colour, analyse
   - First person OK: "I've seen," "In my experience"
   - Casual markers: "basically," "honestly," "to be fair"

7. LOGICAL FLOW WITH PERSONALITY:
   - Connect ideas naturally: "Building on that," "Here's why," "This connects to"
   - Show reasoning: "Because of this," "That's why," "Which means"

CRITICAL FORMAT REQUIREMENT:
Every single bullet point MUST follow this exact format:
• <b>Topic Name:</b> Clear explanation with examples

Remember: You're a real person with experience writing under time pressure. Variation, personality, and natural flow beat perfect grammar. Show thinking, not memorization.`;

  const defaultUserPrompt = `You're a NEBOSH-qualified safety professional writing exam answers. Write naturally as if thinking through your workplace experience — don't aim for perfection.

CONTEXT DOCUMENT:
{documentContext}

EXAM QUESTION:
{taskTitle}
{preamble}
Question {questionNumber}: {questionText}
Marks Available: {marks}

YOUR TASK:
Write EXACTLY {targetBullets} bullet points (aim for roughly {wordCountPerBullet} words per bullet on average, but vary the lengths).

CRITICAL FORMAT - EVERY BULLET MUST BE:
• <b>Specific Topic Name:</b> Clear, practical explanation with workplace examples

WRITING GUIDELINES:

1. TOPICS MUST BE DESCRIPTIVE & BOLD:
   - Make topics specific and relevant (e.g., "Risk Assessment Process", "PPE Selection Criteria", "Hazard Communication")
   - Topics should clearly indicate what the bullet explains
   - Always bold topics using <b></b> tags
   - Always include colon after topic: <b>Topic:</b>

2. MIX SENTENCE LENGTHS DRAMATICALLY:
   - Some very short (5-7 words): "PPE is essential here."
   - Some medium (15-20 words): "Risk assessments help identify hazards before they cause incidents."
   - Some long, complex (30-40 words): "From what I've seen in manufacturing, when management doesn't actively involve workers in safety discussions — and I mean really listen — hazards tend to get missed until something goes wrong, which is frustrating because it's preventable."

3. ADD PERSONAL VOICE:
   - Use: "I believe," "From what I've noticed," "In my view," "Honestly," "I've found"
   - Show thought: "At first I thought... but actually," "The thing is"
   - Add emotions: "frustrating," "surprisingly," "concerning," "encouraging"

4. USE NATURAL CONNECTORS:
   - "Also," "Plus," "Still," "That said," "Thing is," "Mind you," "Actually"
   - NOT: "Furthermore," "Moreover," "Consequently" (too formal/AI-like)

5. VARY BULLET STRUCTURE:
   - Don't start every bullet the same way
   - Mix: statements, questions, scenarios
   - Vary lengths: some 10 words, some 40 words

6. CONVERSATIONAL TONE:
   - Use contractions: don't, can't, won't, I've, we're
   - British English: organise, realise, behaviour, analyse
   - First person acceptable: "I've seen," "In my experience"

7. SHOW LOGICAL CONNECTIONS:
   - Link ideas: "Building on that," "This connects to," "Here's why that matters"
   - Show reasoning: "Because of this," "That's why," "Which means"

BASE YOUR ANSWER ON:
- The context document provided above
- Real workplace scenarios and practical examples
- NEBOSH principles and standards
- Your professional experience

REMEMBER: You're writing under exam pressure — natural variation and personal voice matter more than perfection. Show you're thinking through the problem, not reciting facts.

Write {targetBullets} bullets now in the format: • <b>Topic:</b> Explanation`;

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
                    <option value="gpt-5.1">GPT-5.1</option>
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4.1-mini">GPT-4.1 Mini (Recommended)</option>
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
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

        {/* Custom AI Prompts - NOW WITH TWO TABS */}
        <Card bg={bgCard}>
          <CardHeader>
            <HStack>
              <Icon as={MdDescription} color="purple.500" />
              <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                AI Prompt Configuration
              </Text>
              <Badge colorScheme="purple">Two Prompts Required</Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Two Prompts System:</AlertTitle>
                  <AlertDescription>
                    <strong>System Prompt:</strong> Defines the AI's personality and writing style<br/>
                    <strong>User Prompt:</strong> The specific task template with placeholders for each question
                  </AlertDescription>
                </Box>
              </Alert>

              <Tabs colorScheme="purple" w="100%" variant="enclosed">
                <TabList>
                  <Tab>
                    <HStack>
                      <Text>System Prompt</Text>
                      <Badge colorScheme="blue">Personality</Badge>
                    </HStack>
                  </Tab>
                  <Tab>
                    <HStack>
                      <Text>User Prompt</Text>
                      <Badge colorScheme="green">Task Template</Badge>
                    </HStack>
                  </Tab>
                </TabList>

                <TabPanels>
                  {/* System Prompt Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>
                          System Prompt (AI Behavior & Personality)
                        </FormLabel>
                        <Textarea
                          value={settings.systemPrompt || ''}
                          onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                          rows={12}
                          placeholder={defaultSystemPrompt}
                          fontFamily="monospace"
                          fontSize="sm"
                        />
                        <Text fontSize="sm" color={textColorSecondary} mt={1}>
                          This defines HOW the AI writes: tone, style, personality, formatting rules
                        </Text>
                        <Text fontSize="sm" color="blue.500" mt={1}>
                          Characters: {(settings.systemPrompt || '').length}
                        </Text>
                      </FormControl>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInputChange('systemPrompt', defaultSystemPrompt)}
                      >
                        Restore Default System Prompt
                      </Button>

                      <Alert status="warning" borderRadius="md">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>System Prompt Guidelines:</AlertTitle>
                          <AlertDescription fontSize="sm">
                            • Define the AI's persona (e.g., "NEBOSH-qualified professional")<br/>
                            • Specify writing style (conversational, formal, academic)<br/>
                            • Set formatting requirements (bullets, structure)<br/>
                            • Include anti-AI detection instructions<br/>
                            • No placeholders needed here
                          </AlertDescription>
                        </Box>
                      </Alert>
                    </VStack>
                  </TabPanel>

                  {/* User Prompt Tab */}
                  <TabPanel>
                    <VStack spacing={4} align="stretch">
                      <FormControl>
                        <FormLabel>
                          User Prompt Template (Task Instructions)
                        </FormLabel>
                        <Textarea
                          value={settings.userPrompt || ''}
                          onChange={(e) => handleInputChange('userPrompt', e.target.value)}
                          rows={12}
                          placeholder={defaultUserPrompt}
                          fontFamily="monospace"
                          fontSize="sm"
                        />
                        <Text fontSize="sm" color={textColorSecondary} mt={1}>
                          This defines WHAT the AI writes: the specific task, question, context, and requirements
                        </Text>
                        <Text fontSize="sm" color="green.500" mt={1}>
                          Characters: {(settings.userPrompt || '').length}
                        </Text>
                      </FormControl>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInputChange('userPrompt', defaultUserPrompt)}
                      >
                        Restore Default User Prompt
                      </Button>

                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Available Placeholders:</AlertTitle>
                          <AlertDescription fontSize="sm">
                            <code>{'{{targetBullets}}'}</code> - Number of bullets to generate<br/>
                            <code>{'{{wordCountPerBullet}}'}</code> - Target words per bullet<br/>
                            <code>{'{{documentContext}}'}</code> - First 2000 chars of PDF<br/>
                            <code>{'{{taskTitle}}'}</code> - Task heading<br/>
                            <code>{'{{preamble}}'}</code> - Question context/preamble<br/>
                            <code>{'{{questionNumber}}'}</code> - Question ID (e.g., "1(a)")<br/>
                            <code>{'{{questionText}}'}</code> - The actual question<br/>
                            <code>{'{{marks}}'}</code> - Marks available
                          </AlertDescription>
                        </Box>
                      </Alert>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
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
                Save All Settings
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