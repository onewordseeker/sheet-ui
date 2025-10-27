import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
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
  Icon,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  Badge,
  Divider,
  Spinner,
  Center,
} from '@chakra-ui/react';
import {
  MdCloudUpload,
  MdDelete,
  MdDownload,
  MdDescription,
  MdQuiz,
  MdPerson,
  MdBadge,
} from 'react-icons/md';

export default function Generate() {
  const toast = useToast();
  
  // Form state
  const [formData, setFormData] = useState({
    learnerName: '',
    learnerNumber: '',
  });
  
  // File state
  const [pdfFile, setPdfFile] = useState(null);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedSheets, setGeneratedSheets] = useState([]);
  const [error, setError] = useState('');

  const bgCard = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // PDF dropzone
  const onPdfDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setError('');
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file for the questionnaire",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps, isDragActive: isPdfDragActive } = useDropzone({
    onDrop: onPdfDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024, // 10MB
  });


  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const removePdfFile = () => {
    setPdfFile(null);
  };


  const handleGenerate = async () => {
    // Validation
    if (!pdfFile) {
      setError('Please upload a questionnaire PDF file');
      return;
    }
    
    
    if (!formData.learnerName.trim()) {
      setError('Please enter the learner name');
      return;
    }
    
    if (!formData.learnerNumber.trim()) {
      setError('Please enter the learner number');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGenerationProgress(0);

    try {
      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append('pdf', pdfFile);
      formDataToSend.append('learnerName', formData.learnerName);
      formDataToSend.append('learnerNumber', formData.learnerNumber);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      // API call to horizon-ui backend
      const response = await fetch('http://localhost:5001/api/generate-answers', {
        method: 'POST',
        body: formDataToSend,
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      const data = await response.json();

      if (response.ok) {
        setGeneratedSheets(data.answerSheets || []);
        
        toast({
          title: "Answer sheets generated successfully!",
          description: `${data.answerSheets?.length || 1} answer sheet(s) ready for download`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
      } else {
        setError(data.message || 'Failed to generate answer sheets');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleDownload = async (sheetId, sheetName) => {
    try {
      const response = await fetch('http://localhost:5001/api/download-answer-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storageId: sheetId }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sheetName || 'answer-sheet'}.docx`;
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

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="3xl" fontWeight="bold" color={textColor} mb={2}>
            Generate Answer Sheets
          </Text>
          <Text color={textColorSecondary} fontSize="lg">
            Upload your questionnaire and reference materials to generate AI-powered answer sheets
          </Text>
        </Box>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Learner Information */}
        <Card bg={bgCard}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Learner Information
            </Text>
          </CardHeader>
          <CardBody>
            <HStack spacing={4}>
              <FormControl>
                <FormLabel>
                  <HStack>
                    <Icon as={MdPerson} color="blue.500" />
                    <Text>Learner Name</Text>
                  </HStack>
                </FormLabel>
                <Input
                  placeholder="Enter learner name"
                  value={formData.learnerName}
                  onChange={(e) => handleInputChange('learnerName', e.target.value)}
                  isDisabled={isGenerating}
                />
              </FormControl>
              <FormControl>
                <FormLabel>
                  <HStack>
                    <Icon as={MdBadge} color="green.500" />
                    <Text>Learner Number</Text>
                  </HStack>
                </FormLabel>
                <Input
                  placeholder="Enter learner number"
                  value={formData.learnerNumber}
                  onChange={(e) => handleInputChange('learnerNumber', e.target.value)}
                  isDisabled={isGenerating}
                />
              </FormControl>
            </HStack>
          </CardBody>
        </Card>

        {/* PDF Upload Section */}
        <Card bg={bgCard} maxW="600px" mx="auto">
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Upload Questionnaire PDF
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              {!pdfFile ? (
                <Box
                  {...getPdfRootProps()}
                  p={8}
                  border="2px dashed"
                  borderColor={isPdfDragActive ? "blue.400" : borderColor}
                  borderRadius="md"
                  textAlign="center"
                  cursor="pointer"
                  bg={isPdfDragActive ? "blue.50" : "transparent"}
                  _hover={{ bg: "gray.50" }}
                  transition="all 0.2s"
                >
                  <input {...getPdfInputProps()} />
                  <Icon as={MdCloudUpload} w={12} h={12} color="blue.500" mb={4} />
                  <Text color={textColor} fontWeight="medium" mb={2}>
                    {isPdfDragActive ? 'Drop the PDF here' : 'Drag & drop questionnaire PDF'}
                  </Text>
                  <Text color={textColorSecondary} fontSize="sm">
                    or click to browse (Max 10MB)
                  </Text>
                </Box>
              ) : (
                <Box p={4} border="1px" borderColor={borderColor} borderRadius="md" w="100%">
                  <HStack justify="space-between">
                    <HStack>
                      <Icon as={MdDescription} color="red.500" />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium" color={textColor}>
                          {pdfFile.name}
                        </Text>
                        <Text fontSize="sm" color={textColorSecondary}>
                          {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </VStack>
                    </HStack>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      leftIcon={<Icon as={MdDelete} />}
                      onClick={removePdfFile}
                      isDisabled={isGenerating}
                    >
                      Remove
                    </Button>
                  </HStack>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Generate Button */}
        <Card bg={bgCard}>
          <CardBody>
            <VStack spacing={4}>
              {isGenerating && (
                <Box w="100%">
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm" color={textColorSecondary}>
                      Generating answer sheets...
                    </Text>
                    <Text fontSize="sm" color={textColorSecondary}>
                      {Math.round(generationProgress)}%
                    </Text>
                  </HStack>
                  <Progress value={generationProgress} colorScheme="blue" size="sm" />
                </Box>
              )}
              
              <Button
                size="lg"
                colorScheme="blue"
                leftIcon={<Icon as={MdQuiz} />}
                onClick={handleGenerate}
                isLoading={isGenerating}
                loadingText="Generating..."
                isDisabled={!pdfFile || !formData.learnerName || !formData.learnerNumber}
                w="100%"
                maxW="400px"
              >
                Generate Answer Sheets
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Generated Sheets */}
        {generatedSheets.length > 0 && (
          <Card bg={bgCard}>
            <CardHeader>
              <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                Generated Answer Sheets
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                {generatedSheets.map((sheet, index) => (
                  <Box key={index} p={4} border="1px" borderColor={borderColor} borderRadius="md" w="100%">
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium" color={textColor}>
                          Answer Sheet {index + 1}
                        </Text>
                        <HStack spacing={2}>
                          <Badge colorScheme="green">Ready</Badge>
                          <Text fontSize="sm" color={textColorSecondary}>
                            {sheet.questions || 'N/A'} questions
                          </Text>
                        </HStack>
                      </VStack>
                      <Button
                        colorScheme="blue"
                        leftIcon={<Icon as={MdDownload} />}
                        onClick={() => handleDownload(sheet.id, `answer-sheet-${index + 1}`)}
                      >
                        Download
                      </Button>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
}
