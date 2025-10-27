import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  Badge,
  HStack,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Divider,
} from '@chakra-ui/react';
import { Icon } from '@chakra-ui/react';
import {
  MdSearch,
  MdMoreVert,
  MdDownload,
  MdDelete,
  MdVisibility,
  MdFilterList,
  MdRefresh,
  MdDescription,
  MdPerson,
  MdBadge,
  MdAccessTime,
} from 'react-icons/md';

export default function List() {
  const toast = useToast();
  
  // State
  const [answerSheets, setAnswerSheets] = useState([]);
  const [filteredSheets, setFilteredSheets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLearner, setFilterLearner] = useState('');
  const [selectedSheet, setSelectedSheet] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgCard = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  // Load data on component mount
  useEffect(() => {
    loadAnswerSheets();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = answerSheets;

    if (searchTerm) {
      filtered = filtered.filter(sheet =>
        sheet.learnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sheet.learnerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sheet.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterLearner) {
      filtered = filtered.filter(sheet => sheet.learnerName === filterLearner);
    }

    setFilteredSheets(filtered);
  }, [searchTerm, filterLearner, answerSheets]);

  const loadAnswerSheets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/answer-sheets/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnswerSheets(data.answerSheets || []);
      } else {
        // Fallback to localStorage if API fails
        const storedSheets = JSON.parse(localStorage.getItem('answerSheetsHistory') || '[]');
        setAnswerSheets(storedSheets);
      }
    } catch (error) {
      console.error('Error loading answer sheets:', error);
      // Fallback to localStorage
      const storedSheets = JSON.parse(localStorage.getItem('answerSheetsHistory') || '[]');
      setAnswerSheets(storedSheets);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (sheet) => {
    setSelectedSheet(sheet);
    onOpen();
  };

  const handleDownload = async (sheet) => {
    try {
      const response = await fetch('http://localhost:5001/api/download-answer-sheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({ storageId: sheet.storageId || sheet.id }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${sheet.learnerName}-${sheet.learnerNumber}-answer-sheet.docx`;
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

  const handleDelete = async (sheet) => {
    if (window.confirm('Are you sure you want to delete this answer sheet? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:5001/api/answer-sheets/${sheet.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
          },
        });

        if (response.ok) {
          setAnswerSheets(prev => prev.filter(s => s.id !== sheet.id));
          toast({
            title: "Answer sheet deleted",
            description: "The answer sheet has been removed from your history",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          throw new Error('Delete failed');
        }
      } catch (error) {
        // Fallback to localStorage
        const updatedSheets = answerSheets.filter(s => s.id !== sheet.id);
        setAnswerSheets(updatedSheets);
        localStorage.setItem('answerSheetsHistory', JSON.stringify(updatedSheets));
        
        toast({
          title: "Answer sheet deleted",
          description: "The answer sheet has been removed from your history",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const learners = [...new Set(answerSheets.map(sheet => sheet.learnerName))];

  if (isLoading) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Center h="400px">
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color={textColorSecondary}>Loading answer sheets...</Text>
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
            Answer Sheets History
          </Text>
          <Text color={textColorSecondary}>
            View and manage all your previously generated answer sheets
          </Text>
        </Box>

        {/* Filters */}
        <Card bg={bgCard}>
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              <InputGroup maxW="300px">
                <InputLeftElement>
                  <Icon as={MdSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search by learner name, number, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              <Select
                placeholder="Filter by Learner"
                value={filterLearner}
                onChange={(e) => setFilterLearner(e.target.value)}
                maxW="200px"
              >
                {learners.map(learner => (
                  <option key={learner} value={learner}>{learner}</option>
                ))}
              </Select>

              <Button
                leftIcon={<Icon as={MdFilterList} />}
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterLearner('');
                }}
              >
                Clear Filters
              </Button>

              <Button
                leftIcon={<Icon as={MdRefresh} />}
                colorScheme="blue"
                variant="outline"
                onClick={loadAnswerSheets}
              >
                Refresh
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Results Summary */}
        <Card bg={bgCard}>
          <CardBody>
            <HStack justify="space-between">
              <Text color={textColorSecondary}>
                Showing {filteredSheets.length} of {answerSheets.length} answer sheets
              </Text>
              <Text color={textColorSecondary}>
                Total Downloads: {answerSheets.reduce((sum, sheet) => sum + (sheet.downloadCount || 0), 0)}
              </Text>
            </HStack>
          </CardBody>
        </Card>

        {/* Table */}
        <Card bg={bgCard}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Answer Sheets
            </Text>
          </CardHeader>
          <CardBody>
            {filteredSheets.length === 0 ? (
              <Center py={8}>
                <VStack spacing={4}>
                  <Icon as={MdDescription} w={16} h={16} color="gray.400" />
                  <Text color={textColorSecondary} textAlign="center">
                    {answerSheets.length === 0 
                      ? "No answer sheets generated yet. Start by creating your first answer sheet!"
                      : "No answer sheets match your current filters."
                    }
                  </Text>
                </VStack>
              </Center>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th color={textColor}>Learner</Th>
                      <Th color={textColor}>Questions</Th>
                      <Th color={textColor}>Word Count</Th>
                      <Th color={textColor}>Generated</Th>
                      <Th color={textColor}>Downloads</Th>
                      <Th color={textColor}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredSheets.map((sheet) => (
                      <Tr key={sheet.id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium" color={textColor}>
                              {sheet.learnerName}
                            </Text>
                            <Text fontSize="sm" color={textColorSecondary}>
                              #{sheet.learnerNumber}
                            </Text>
                          </VStack>
                        </Td>
                        <Td color={textColorSecondary}>{sheet.questions || 'N/A'}</Td>
                        <Td color={textColorSecondary}>{sheet.wordCount || 'N/A'}</Td>
                        <Td color={textColorSecondary}>{formatDate(sheet.createdAt)}</Td>
                        <Td color={textColorSecondary}>{sheet.downloadCount || 0}</Td>
                        <Td>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<Icon as={MdMoreVert} />}
                              variant="ghost"
                              size="sm"
                            />
                            <MenuList>
                              <MenuItem
                                icon={<Icon as={MdVisibility} />}
                                onClick={() => handleViewDetails(sheet)}
                              >
                                View Details
                              </MenuItem>
                              <MenuItem
                                icon={<Icon as={MdDownload} />}
                                onClick={() => handleDownload(sheet)}
                              >
                                Download
                              </MenuItem>
                              <MenuItem
                                icon={<Icon as={MdDelete} />}
                                onClick={() => handleDelete(sheet)}
                                color="red.500"
                              >
                                Delete
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Details Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Answer Sheet Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedSheet && (
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontWeight="bold" color={textColor}>Learner Information:</Text>
                  <HStack mt={2}>
                    <Icon as={MdPerson} color="blue.500" />
                    <Text color={textColorSecondary}>{selectedSheet.learnerName}</Text>
                  </HStack>
                  <HStack mt={1}>
                    <Icon as={MdBadge} color="green.500" />
                    <Text color={textColorSecondary}>#{selectedSheet.learnerNumber}</Text>
                  </HStack>
                </Box>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="bold" color={textColor}>Sheet Information:</Text>
                  <HStack mt={2} spacing={6}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color={textColorSecondary}>Questions:</Text>
                      <Text fontWeight="medium" color={textColor}>{selectedSheet.questions || 'N/A'}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color={textColorSecondary}>Word Count:</Text>
                      <Text fontWeight="medium" color={textColor}>{selectedSheet.wordCount || 'N/A'}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color={textColorSecondary}>Downloads:</Text>
                      <Text fontWeight="medium" color={textColor}>{selectedSheet.downloadCount || 0}</Text>
                    </VStack>
                  </HStack>
                </Box>
                
                <Divider />
                
                <Box>
                  <Text fontWeight="bold" color={textColor}>Generation Details:</Text>
                  <HStack mt={2}>
                    <Icon as={MdAccessTime} color="orange.500" />
                    <Text color={textColorSecondary}>{formatDate(selectedSheet.createdAt)}</Text>
                  </HStack>
                  {selectedSheet.fileSize && (
                    <Text mt={1} fontSize="sm" color={textColorSecondary}>
                      File Size: {formatFileSize(selectedSheet.fileSize)}
                    </Text>
                  )}
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button colorScheme="blue" onClick={() => {
              handleDownload(selectedSheet);
              onClose();
            }}>
              Download
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
