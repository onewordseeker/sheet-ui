import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  Icon,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Image,
  Divider,
  Badge,
  Spinner,
  Center,
} from '@chakra-ui/react';
import {
  MdFileDownload,
  MdDescription,
  MdQuiz,
  MdSchool,
  MdFormatListNumbered,
  MdAccessTime,
  MdInfo,
  MdCheckCircle,
} from 'react-icons/md';

export default function DownloadSample() {
  const toast = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const bgCard = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const cardBg = useColorModeValue('gray.50', 'whiteAlpha.50');

  const handleDownloadSample = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('http://localhost:5001/api/download-sample', {
        method: 'GET',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sample-answer-sheet.docx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Sample downloaded successfully!",
          description: "The sample answer sheet has been saved to your downloads",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        throw new Error('Download failed');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the sample. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const sampleFeatures = [
    {
      icon: MdFormatListNumbered,
      title: "Structured Format",
      description: "Professional layout with clear question numbering and answer spaces"
    },
    {
      icon: MdSchool,
      title: "NEBOSH Standards",
      description: "Follows NEBOSH format and academic writing standards"
    },
    {
      icon: MdQuiz,
      title: "Sample Questions",
      description: "Includes example questions with model answers for reference"
    },
    {
      icon: MdAccessTime,
      title: "Time Management",
      description: "Shows how to structure answers within time constraints"
    }
  ];

  const formatHighlights = [
    "Clear question numbering and answer spaces",
    "Professional header with learner information",
    "Structured answer format with bullet points",
    "Proper academic writing style and tone",
    "Examples of comprehensive yet concise answers",
    "Time allocation suggestions for each question"
  ];

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box textAlign="center">
          <Text fontSize="3xl" fontWeight="bold" color={textColor} mb={4}>
            Download Sample Answer Sheet
          </Text>
          <Text color={textColorSecondary} fontSize="lg" maxW="600px" mx="auto">
            Get a sample answer sheet to understand the format and structure that our AI generates. 
            Use this as a reference for creating your own answer sheets.
          </Text>
        </Box>

        {/* Main Download Card */}
        <Card bg={bgCard} maxW="800px" mx="auto">
          <CardHeader textAlign="center">
            <VStack spacing={4}>
              <Icon as={MdFileDownload} w={20} h={20} color="blue.500" />
              <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                Sample Answer Sheet
              </Text>
              <Text color={textColorSecondary}>
                Professional NEBOSH-style answer sheet with example questions and answers
              </Text>
            </VStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={6}>
              <Button
                size="lg"
                colorScheme="blue"
                leftIcon={<Icon as={MdFileDownload} />}
                onClick={handleDownloadSample}
                isLoading={isDownloading}
                loadingText="Downloading..."
                w="100%"
                maxW="400px"
                h="60px"
                fontSize="lg"
              >
                Download Sample Answer Sheet
              </Button>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>What's Included:</AlertTitle>
                  <AlertDescription>
                    This sample contains 5 example questions with model answers, 
                    demonstrating the format, style, and depth expected in NEBOSH assessments.
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </CardBody>
        </Card>

        {/* Features Grid */}
        <Card bg={bgCard}>
          <CardHeader>
            <Text fontSize="xl" fontWeight="semibold" color={textColor} textAlign="center">
              Sample Features
            </Text>
          </CardHeader>
          <CardBody>
            <Flex wrap="wrap" gap={6} justify="center">
              {sampleFeatures.map((feature, index) => (
                <Card key={index} bg={cardBg} maxW="300px" flex="1" minW="250px">
                  <CardBody textAlign="center">
                    <VStack spacing={3}>
                      <Icon as={feature.icon} w={12} h={12} color="blue.500" />
                      <Text fontWeight="semibold" color={textColor}>
                        {feature.title}
                      </Text>
                      <Text fontSize="sm" color={textColorSecondary}>
                        {feature.description}
                      </Text>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </Flex>
          </CardBody>
        </Card>

        {/* Format Details */}
        <Card bg={bgCard}>
          <CardHeader>
            <Text fontSize="xl" fontWeight="semibold" color={textColor}>
              Answer Sheet Format
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Text color={textColorSecondary}>
                Our AI-generated answer sheets follow professional academic standards and include:
              </Text>
              
              <VStack spacing={2} align="stretch">
                {formatHighlights.map((highlight, index) => (
                  <HStack key={index} spacing={3}>
                    <Icon as={MdCheckCircle} color="green.500" />
                    <Text color={textColor}>{highlight}</Text>
                  </HStack>
                ))}
              </VStack>

              <Divider />

              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Professional Quality:</AlertTitle>
                  <AlertDescription>
                    Each generated answer sheet maintains consistent formatting, 
                    professional appearance, and academic standards suitable for 
                    NEBOSH and other professional assessments.
                  </AlertDescription>
                </Box>
              </Alert>
            </VStack>
          </CardBody>
        </Card>

        {/* Usage Instructions */}
        <Card bg={bgCard}>
          <CardHeader>
            <Text fontSize="xl" fontWeight="semibold" color={textColor}>
              How to Use This Sample
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4} align="start">
                <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>1</Badge>
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium" color={textColor}>
                    Review the Format
                  </Text>
                  <Text color={textColorSecondary} fontSize="sm">
                    Examine the structure, layout, and formatting of the sample answer sheet
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={4} align="start">
                <Badge colorScheme="green" fontSize="sm" px={3} py={1}>2</Badge>
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium" color={textColor}>
                    Study the Answers
                  </Text>
                  <Text color={textColorSecondary} fontSize="sm">
                    Analyze the depth, style, and quality of the model answers provided
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={4} align="start">
                <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>3</Badge>
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium" color={textColor}>
                    Use as Reference
                  </Text>
                  <Text color={textColorSecondary} fontSize="sm">
                    Use this sample as a template when creating your own answer sheets
                  </Text>
                </VStack>
              </HStack>

              <HStack spacing={4} align="start">
                <Badge colorScheme="orange" fontSize="sm" px={3} py={1}>4</Badge>
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium" color={textColor}>
                    Customize Settings
                  </Text>
                  <Text color={textColorSecondary} fontSize="sm">
                    Adjust the AI prompt in Settings to match your specific requirements
                  </Text>
                </VStack>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Additional Information */}
        <Card bg={bgCard}>
          <CardHeader>
            <HStack>
              <Icon as={MdInfo} color="blue.500" />
              <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                Additional Information
              </Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="medium" color={textColor} mb={2}>
                  File Format:
                </Text>
                <Text color={textColorSecondary}>
                  The sample is provided in Microsoft Word (.docx) format, 
                  which is compatible with most word processors and can be easily edited.
                </Text>
              </Box>

              <Box>
                <Text fontWeight="medium" color={textColor} mb={2}>
                  Customization:
                </Text>
                <Text color={textColorSecondary}>
                  You can modify the AI generation settings in the Settings page to 
                  customize the style, format, and content of your generated answer sheets.
                </Text>
              </Box>

              <Box>
                <Text fontWeight="medium" color={textColor} mb={2}>
                  Support:
                </Text>
                <Text color={textColorSecondary}>
                  If you have questions about the format or need assistance with 
                  customization, please refer to the Settings page or contact support.
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
}
