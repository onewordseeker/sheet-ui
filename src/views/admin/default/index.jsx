import React, { useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  useColorModeValue,
  Text,
  VStack,
  HStack,
  Icon,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Button,
  useToast,
  Spinner,
  Center,
  Divider,
} from '@chakra-ui/react';
import {
  MdQuiz,
  MdFileDownload,
  MdTrendingUp,
  MdToday,
  MdDateRange,
  MdCalendarMonth,
  MdSettings,
  MdCheckCircle,
  MdError,
  MdRefresh,
} from 'react-icons/md';
import MiniStatistics from 'components/card/MiniStatistics';
import IconBox from 'components/icons/IconBox';
import LineChart from 'components/charts/LineChart';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  const brandColor = useColorModeValue("brand.500", "white");
  const boxBg = useColorModeValue("secondaryGray.300", "whiteAlpha.100");
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const textColorSecondary = useColorModeValue("secondaryGray.600", "secondaryGray.400");
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  useEffect(() => {
    loadAnalytics();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/dashboard/analytics`);
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      } else {
        throw new Error(data.error || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Analytics load error:', error);
      setError(error.message);
      toast({
        title: "Error loading analytics",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (sheet) => {
    try {
      console.log('Downloading sheet:', sheet);
      console.log('Sheet ID:', sheet.id);
      console.log('Sheet storageId:', sheet.storageId);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/download-answer-sheet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storageId: sheet.id || sheet.storageId }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = sheet.filename || 'answer-sheet.docx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Download started!",
          description: "Your answer sheet is being downloaded",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      toast({
        title: "Download failed",
        description: "There was an error downloading the file",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (isLoading) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Center h="400px">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color={textColorSecondary}>Loading dashboard analytics...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  if (error) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Center h="400px">
          <VStack spacing={4}>
            <Icon as={MdError} w={12} h={12} color="red.500" />
            <Text color={textColor} fontSize="lg" fontWeight="semibold">
              Error Loading Dashboard
            </Text>
            <Text color={textColorSecondary} textAlign="center">
              {error}
            </Text>
            <Button
              leftIcon={<Icon as={MdRefresh} />}
              colorScheme="blue"
              onClick={loadAnalytics}
            >
              Retry
            </Button>
          </VStack>
        </Center>
      </Box>
    );
  }

  const { overview, currentModel, recentSheets, charts } = analytics;

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      {/* Header */}
      <VStack spacing={4} align="stretch" mb={8}>
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Text fontSize="3xl" fontWeight="bold" color={textColor}>
              Dashboard
            </Text>
            <Text color={textColorSecondary} fontSize="lg">
              Answer Sheet Generator Analytics
            </Text>
          </VStack>
          <Button
            leftIcon={<Icon as={MdRefresh} />}
            colorScheme="blue"
            variant="outline"
            onClick={loadAnalytics}
          >
            Refresh
          </Button>
        </HStack>
      </VStack>

      {/* Statistics Cards */}
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 4, "2xl": 6 }}
        gap='20px'
        mb='20px'
      >
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdQuiz} color={brandColor} />
              }
            />
          }
          name='Total Answer Sheets'
          value={overview.totalSheets.toString()}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg='linear-gradient(90deg, #4481EB 0%, #04BEFE 100%)'
              icon={<Icon w='28px' h='28px' as={MdToday} color='white' />}
            />
          }
          name='Today'
          value={overview.todaySheets.toString()}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdDateRange} color={brandColor} />
              }
            />
          }
          name='This Week'
          value={overview.weekSheets.toString()}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdCalendarMonth} color={brandColor} />
              }
            />
          }
          name='This Month'
          value={overview.monthSheets.toString()}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdTrendingUp} color={brandColor} />
              }
            />
          }
          name='Total Questions'
          value={overview.totalQuestions.toString()}
        />
        <MiniStatistics
          startContent={
            <IconBox
              w='56px'
              h='56px'
              bg={boxBg}
              icon={
                <Icon w='32px' h='32px' as={MdFileDownload} color={brandColor} />
              }
            />
          }
          name='Total Tasks'
          value={overview.totalTasks.toString()}
        />
      </SimpleGrid>

      {/* Charts and Model Info */}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 2 }} gap='20px' mb='20px'>
        {/* Weekly Chart */}
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Answer Sheets Generated (Last 7 Days)
            </Text>
          </CardHeader>
          <CardBody>
            <LineChart
              chartData={[
                {
                  name: "Answer Sheets",
                  data: charts.weekly.map(item => item.count)
                }
              ]}
              chartOptions={{
                xaxis: {
                  categories: charts.weekly.map(item => 
                    new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })
                  )
                }
              }}
            />
          </CardBody>
        </Card>

        {/* Model Information */}
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Current AI Model Configuration
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text color={textColorSecondary}>Model:</Text>
                <Badge colorScheme="blue" fontSize="sm">
                  {currentModel.name}
                </Badge>
              </HStack>
              
              <HStack justify="space-between">
                <Text color={textColorSecondary}>API Key:</Text>
                <HStack>
                  {currentModel.apiKeyConfigured ? (
                    <>
                      <Icon as={MdCheckCircle} color="green.500" />
                      <Text color="green.500" fontSize="sm">Configured</Text>
                    </>
                  ) : (
                    <>
                      <Icon as={MdError} color="red.500" />
                      <Text color="red.500" fontSize="sm">Not Configured</Text>
                    </>
                  )}
                </HStack>
              </HStack>
              
              <HStack justify="space-between">
                <Text color={textColorSecondary}>Temperature:</Text>
                <Text color={textColor} fontWeight="medium">
                  {currentModel.temperature}
                </Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text color={textColorSecondary}>Max Tokens:</Text>
                <Text color={textColor} fontWeight="medium">
                  {currentModel.maxTokens}
                </Text>
              </HStack>
              
              <Divider />
              
              <Button
                leftIcon={<Icon as={MdSettings} />}
                colorScheme="blue"
                variant="outline"
                size="sm"
                onClick={() => window.location.href = '/admin/settings'}
              >
                Configure Settings
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Recent Answer Sheets */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Recently Generated Answer Sheets
            </Text>
            <Button
              colorScheme="blue"
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/admin/list'}
            >
              View All
            </Button>
          </HStack>
        </CardHeader>
        <CardBody>
          {recentSheets.length === 0 ? (
            <Center h="200px">
              <VStack spacing={4}>
                <Icon as={MdQuiz} w={12} h={12} color={textColorSecondary} />
                <Text color={textColorSecondary} fontSize="lg">
                  No answer sheets generated yet
                </Text>
                <Text color={textColorSecondary} fontSize="sm" textAlign="center">
                  Start by uploading a questionnaire PDF to generate your first answer sheet
                </Text>
                <Button
                  colorScheme="blue"
                  onClick={() => window.location.href = '/admin/generate'}
                >
                  Generate Answer Sheet
                </Button>
              </VStack>
            </Center>
          ) : (
            <VStack spacing={4} align="stretch">
              {recentSheets.map((sheet, index) => (
                <Box
                  key={sheet.id}
                  p={4}
                  border="1px"
                  borderColor={borderColor}
                  borderRadius="md"
                >
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium" color={textColor}>
                        {sheet.learnerName} ({sheet.learnerNumber})
                      </Text>
                      <HStack spacing={4}>
                        <Text fontSize="sm" color={textColorSecondary}>
                          {sheet.questionsCount} questions
                        </Text>
                        <Text fontSize="sm" color={textColorSecondary}>
                          {sheet.tasksCount} tasks
                        </Text>
                        <Text fontSize="sm" color={textColorSecondary}>
                          {new Date(sheet.createdAt).toLocaleDateString()}
                        </Text>
                      </HStack>
                    </VStack>
                    <HStack spacing={2}>
                      <Badge colorScheme="green">Completed</Badge>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        leftIcon={<Icon as={MdFileDownload} />}
                        onClick={() => handleDownload(sheet)}
                      >
                        Download
                      </Button>
                    </HStack>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </CardBody>
      </Card>
    </Box>
  );
}
