import React, { useState, useCallback, useEffect } from 'react';
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  NumberInput,
  NumberInputField,
  Textarea,
  Tag,
} from '@chakra-ui/react';
import {
  MdCloudUpload,
  MdDelete,
  MdDescription,
  MdQuiz,
  MdAttachFile,
  MdSettings,
} from 'react-icons/md';

const MAX_ATTACHMENT_SIZE_MB = 15;

export default function AttachmentGenerate() {
  const toast = useToast();

  const [formData, setFormData] = useState({
    listId: '',
    candidateIds: [],
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [lists, setLists] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [questionsPreview, setQuestionsPreview] = useState([]);
  const [bulletConfig, setBulletConfig] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedSheets, setGeneratedSheets] = useState([]);
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [prompts, setPrompts] = useState({
    attachmentSystemPrompt: '',
    attachmentUserPrompt: '',
  });

  const bgCard = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  const fetchPreview = useCallback(async (file) => {
    if (!file) return;
    setIsPreviewLoading(true);
    setPreviewError('');
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('pdf', file);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/attachment-generation/preview`, {
        method: 'POST',
        body: formDataToSend,
      });
      const data = await response.json();
      if (response.ok) {
        setQuestionsPreview(data.questions || []);
        const newConfig = {};
        (data.questions || []).forEach((q) => {
          newConfig[q.number] = q.suggestedBullets;
        });
        setBulletConfig(newConfig);
      } else {
        setQuestionsPreview([]);
        setBulletConfig({});
        setPreviewError(data.error || 'Failed to analyze question paper');
      }
    } catch (err) {
      setPreviewError('Failed to analyze question paper');
    } finally {
      setIsPreviewLoading(false);
    }
  }, []);

  const onPdfDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setError('');
      fetchPreview(file);
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file for the question paper',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast, fetchPreview]);

  const { getRootProps: getPdfRootProps, getInputProps: getPdfInputProps, isDragActive: isPdfDragActive } = useDropzone({
    onDrop: onPdfDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024,
  });

  const onAttachmentDrop = useCallback((acceptedFiles) => {
    const filtered = acceptedFiles.filter((file) => {
      const sizeMb = file.size / 1024 / 1024;
      if (sizeMb > MAX_ATTACHMENT_SIZE_MB) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds ${MAX_ATTACHMENT_SIZE_MB}MB`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return false;
      }
      return true;
    });
    if (filtered.length) {
      setAttachmentFiles((prev) => [...prev, ...filtered]);
    }
  }, [toast]);

  const { getRootProps: getAttachmentRootProps, getInputProps: getAttachmentInputProps, isDragActive: isAttachmentDragActive } = useDropzone({
    onDrop: onAttachmentDrop,
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    maxSize: MAX_ATTACHMENT_SIZE_MB * 1024 * 1024,
  });

  useEffect(() => {
    const loadLists = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/candidate-lists`);
        const data = await res.json();
        if (res.ok) setLists(data.lists || []);
      } catch (e) {
        /* noop */
      }
    };
    loadLists();
  }, []);

  useEffect(() => {
    const loadCandidates = async () => {
      if (!formData.listId) {
        setCandidates([]);
        setFormData((prev) => ({ ...prev, candidateIds: [] }));
        return;
      }
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/candidate-lists/${formData.listId}`);
        const data = await res.json();
        if (res.ok) {
          setCandidates(data.candidates || []);
          setFormData((prev) => ({ ...prev, candidateIds: [] }));
          setSelectAll(false);
        }
      } catch (e) {
        /* noop */
      }
    };
    loadCandidates();
  }, [formData.listId]);

  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/settings`);
        const data = await res.json();
        if (res.ok && data.settings) {
          setPrompts({
            attachmentSystemPrompt: data.settings.attachmentSystemPrompt || '',
            attachmentUserPrompt: data.settings.attachmentUserPrompt || '',
          });
        }
      } catch (e) {
        /* noop */
      }
    };
    loadPrompts();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleCandidate = (id) => {
    setFormData((prev) => {
      const exists = prev.candidateIds.includes(id);
      const next = exists ? prev.candidateIds.filter((x) => x !== id) : [...prev.candidateIds, id];
      return { ...prev, candidateIds: next };
    });
  };

  const toggleSelectAll = () => {
    if (!candidates.length) return;
    if (selectAll) {
      setFormData((prev) => ({ ...prev, candidateIds: [] }));
      setSelectAll(false);
    } else {
      setFormData((prev) => ({ ...prev, candidateIds: candidates.map((c) => c.id) }));
      setSelectAll(true);
    }
  };

  const removePdfFile = () => {
    setPdfFile(null);
    setQuestionsPreview([]);
    setBulletConfig({});
  };

  const removeAttachment = (index) => {
    setAttachmentFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleBulletChange = (questionNumber, value) => {
    const parsed = parseInt(value, 10);
    setBulletConfig((prev) => ({
      ...prev,
      [questionNumber]: Math.max(1, Number.isNaN(parsed) ? 1 : parsed),
    }));
  };

  const handleGenerate = async () => {
    if (!pdfFile) {
      setError('Please upload a question paper PDF');
      return;
    }
    if (questionsPreview.length === 0) {
      setError('Please analyze the question paper before generating');
      return;
    }
    if (!formData.listId) {
      setError('Please select a candidates list');
      return;
    }
    if (!selectAll && (!formData.candidateIds || formData.candidateIds.length === 0)) {
      setError('Please select at least one candidate or choose Select All');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGenerationProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('questionPaper', pdfFile);
      attachmentFiles.forEach((file) => formDataToSend.append('attachments', file));
      formDataToSend.append('listId', formData.listId);
      if (selectAll) {
        formDataToSend.append('generateAll', 'true');
      } else {
        formData.candidateIds.forEach((id) => formDataToSend.append('candidateIds', id));
      }

      const sanitizedBullets = {};
      questionsPreview.forEach((q) => {
        const configured = parseInt(bulletConfig[q.number], 10);
        sanitizedBullets[q.number] = Number.isNaN(configured) ? q.suggestedBullets : Math.max(1, configured);
      });

      formDataToSend.append('bulletOverrides', JSON.stringify(sanitizedBullets));
      formDataToSend.append('attachmentSystemPrompt', prompts.attachmentSystemPrompt || '');
      formDataToSend.append('attachmentUserPrompt', prompts.attachmentUserPrompt || '');

      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/attachment-generation/generate`, {
        method: 'POST',
        body: formDataToSend,
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      const data = await response.json();
      if (response.ok) {
        const mapped = (data.generated || []).map((g, idx) => ({
          id: g.id,
          name: `Attachment Answer Sheet ${idx + 1} for ${g.name}`,
        }));
        setGeneratedSheets(mapped);
        toast({
          title: 'Answer sheets generated successfully!',
          description: `${data.count || mapped.length} answer sheet(s) ready for download`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        setError(data.error || 'Failed to generate answer sheets');
      }
    } catch (err) {
      console.error('Attachment generation error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleDownload = async (sheetId, sheetName) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/download-answer-sheet`, {
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
          title: 'Download started!',
          description: 'Your answer sheet is being downloaded',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error('Download failed');
      }
    } catch (err) {
      toast({
        title: 'Download failed',
        description: 'There was an error downloading the file',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDownloadAllZip = async () => {
    try {
      const storageIds = generatedSheets.map((s) => s.id);
      if (storageIds.length === 0) return;
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/download-answer-sheets-zip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storageIds }),
      });
      if (!response.ok) throw new Error('Zip download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'answer-sheets.zip';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: 'Download started', description: 'ZIP file is downloading', status: 'success', duration: 3000, isClosable: true });
    } catch (e) {
      toast({ title: 'ZIP download failed', status: 'error', duration: 3000, isClosable: true });
    }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="3xl" fontWeight="bold" color={textColor} mb={2}>
            Attachment-Based Generation
          </Text>
          <Text color={textColorSecondary} fontSize="lg">
            Upload attachment-heavy question papers, preview bullet counts, and control prompts before generating answer sheets.
          </Text>
        </Box>

        {(error || previewError) && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error || previewError}</AlertDescription>
          </Alert>
        )}

        <Card bg={bgCard}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Candidates
            </Text>
          </CardHeader>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <FormControl>
                <FormLabel>Candidate List</FormLabel>
                <select
                  value={formData.listId}
                  onChange={(e) => handleInputChange('listId', e.target.value)}
                  disabled={isGenerating}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', width: '100%' }}
                >
                  <option value="">Select a list...</option>
                  {lists.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.entriesCount})
                    </option>
                  ))}
                </select>
              </FormControl>

              {formData.listId && (
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between">
                    <Text color={textColorSecondary}>Select candidates</Text>
                    <Button size="sm" variant="outline" onClick={toggleSelectAll} isDisabled={!candidates.length}>
                      {selectAll ? 'Clear All' : 'Select All'}
                    </Button>
                  </HStack>
                  <Box maxH="260px" overflowY="auto" border="1px solid" borderColor={borderColor} borderRadius="md" p={2}>
                    {candidates.length === 0 ? (
                      <Center py={8}>
                        <Text color={textColorSecondary}>No candidates in this list.</Text>
                      </Center>
                    ) : (
                      candidates.map((c) => (
                        <HStack key={c.id} justify="space-between" py={1}>
                          <Text color={textColor}>
                            {(c.sequenceId || '-')} {c.learnerName} — #{c.learnerId}
                          </Text>
                          <input
                            type="checkbox"
                            checked={selectAll || formData.candidateIds.includes(c.id)}
                            onChange={() => toggleCandidate(c.id)}
                            disabled={isGenerating}
                          />
                        </HStack>
                      ))
                    )}
                  </Box>
                </VStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card bg={bgCard}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Question Paper
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {!pdfFile ? (
                <Box
                  {...getPdfRootProps()}
                  p={8}
                  border="2px dashed"
                  borderColor={isPdfDragActive ? 'blue.400' : borderColor}
                  borderRadius="md"
                  textAlign="center"
                  cursor="pointer"
                  bg={isPdfDragActive ? 'blue.50' : 'transparent'}
                  _hover={{ bg: 'gray.50' }}
                  transition="all 0.2s"
                >
                  <input {...getPdfInputProps()} />
                  <Icon as={MdCloudUpload} w={12} h={12} color="blue.500" mb={4} />
                  <Text color={textColor} fontWeight="medium" mb={2}>
                    {isPdfDragActive ? 'Drop the PDF here' : 'Drag & drop question paper PDF'}
                  </Text>
                  <Text color={textColorSecondary} fontSize="sm">
                    or click to browse (Max 10MB)
                  </Text>
                </Box>
              ) : (
                <Box p={4} border="1px" borderColor={borderColor} borderRadius="md" w="100%">
                  <HStack justify="space-between" align="flex-start">
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
                    <Button size="sm" colorScheme="red" variant='ghost' leftIcon={<Icon as={MdDelete} />} onClick={removePdfFile} isDisabled={isGenerating}>
                      Remove
                    </Button>
                  </HStack>
                  {isPreviewLoading && (
                    <HStack mt={3}>
                      <Spinner size="sm" />
                      <Text color={textColorSecondary}>Analyzing question paper...</Text>
                    </HStack>
                  )}
                </Box>
              )}

              {questionsPreview.length > 0 && (
                <Box border="1px solid" borderColor={borderColor} borderRadius="md" p={4}>
                  <HStack mb={2} spacing={2}>
                    <Icon as={MdSettings} color="blue.500" />
                    <Text fontWeight="semibold" color={textColor}>
                      Bullet Control
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color={textColorSecondary} mb={4}>
                    Review marks and suggested bullets. Adjust counts to control exactly how many bullets will be generated.
                  </Text>
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Question</Th>
                        <Th>Marks</Th>
                        <Th>Suggested Bullets</Th>
                        <Th>Set Bullets</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {questionsPreview.map((question) => (
                        <Tr key={question.number}>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium" color={textColor}>
                                {question.number}
                              </Text>
                              <Text fontSize="sm" color={textColorSecondary} noOfLines={2}>
                                {question.text}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>{question.marks}</Td>
                          <Td>{question.suggestedBullets}</Td>
                          <Td>
                            <NumberInput
                              size="sm"
                              min={1}
                              value={bulletConfig[question.number] || question.suggestedBullets}
                              onChange={(value) => handleBulletChange(question.number, value)}
                              isDisabled={isGenerating}
                            >
                              <NumberInputField />
                            </NumberInput>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card bg={bgCard}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Attachments
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Box
                {...getAttachmentRootProps()}
                p={6}
                border="2px dashed"
                borderColor={isAttachmentDragActive ? 'green.400' : borderColor}
                borderRadius="md"
                textAlign="center"
                cursor="pointer"
                bg={isAttachmentDragActive ? 'green.50' : 'transparent'}
                _hover={{ bg: 'gray.50' }}
                transition="all 0.2s"
              >
                <input {...getAttachmentInputProps()} />
                <Icon as={MdAttachFile} w={10} h={10} color="green.500" mb={2} />
                <Text color={textColor} fontWeight="medium">Drag & drop related attachments</Text>
                <Text color={textColorSecondary} fontSize="sm">PDF, DOCX, TXT, PNG, JPG • Max {MAX_ATTACHMENT_SIZE_MB}MB each</Text>
              </Box>

              {attachmentFiles.length > 0 && (
                <VStack align="stretch" spacing={2}>
                  {attachmentFiles.map((file, index) => (
                    <HStack key={`${file.name}-${index}`} justify="space-between" p={3} border="1px solid" borderColor={borderColor} borderRadius="md">
                      <VStack align="start" spacing={0}>
                        <Text color={textColor} fontWeight="medium">{file.name}</Text>
                        <Text fontSize="sm" color={textColorSecondary}>{(file.size / 1024 / 1024).toFixed(2)} MB</Text>
                      </VStack>
                      <Button size="xs" colorScheme="red" variant="ghost" leftIcon={<Icon as={MdDelete} />} onClick={() => removeAttachment(index)} isDisabled={isGenerating}>
                        Remove
                      </Button>
                    </HStack>
                  ))}
                </VStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card bg={bgCard}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>
              Attachment Prompts
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Attachment System Prompt</FormLabel>
                <Textarea
                  placeholder="System instructions for attachment-based generation"
                  value={prompts.attachmentSystemPrompt}
                  onChange={(e) => setPrompts((prev) => ({ ...prev, attachmentSystemPrompt: e.target.value }))}
                  rows={4}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Attachment User Prompt Template</FormLabel>
                <Textarea
                  placeholder="User prompt template"
                  value={prompts.attachmentUserPrompt}
                  onChange={(e) => setPrompts((prev) => ({ ...prev, attachmentUserPrompt: e.target.value }))}
                  rows={6}
                />
                <Text fontSize="xs" color={textColorSecondary} mt={2}>
                  Available placeholders: {'{taskTitle}'}, {'{questionNumber}'}, {'{questionText}'}, {'{marks}'}, {'{targetBullets}'}, {'{documentContext}'}, {'{attachmentsContext}'}, {'{preamble}'}
                </Text>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

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
                isDisabled={!pdfFile || !formData.listId || (!selectAll && formData.candidateIds.length === 0) || questionsPreview.length === 0}
                w="100%"
                maxW="400px"
              >
                Generate Attachment Answer Sheets
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {generatedSheets.length > 0 && (
          <Card bg={bgCard}>
            <CardHeader>
              <Text fontSize="lg" fontWeight="semibold" color={textColor}>
                Generated Answer Sheets
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack w="100%" justify="space-between">
                  <Text color={textColorSecondary}>
                    {generatedSheets.length} file(s) ready
                  </Text>
                  <Button colorScheme="blue" variant="outline" onClick={handleDownloadAllZip}>
                    Download all as ZIP
                  </Button>
                </HStack>
                {generatedSheets.map((sheet, index) => (
                  <Box key={sheet.id} p={4} border="1px" borderColor={borderColor} borderRadius="md" w="100%">
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium" color={textColor}>
                          {sheet.name || `Answer Sheet ${index + 1}`}
                        </Text>
                        <HStack spacing={2}>
                          <Badge colorScheme="green">Ready</Badge>
                          <Tag size="sm" colorScheme="purple">
                            Attachments
                          </Tag>
                        </HStack>
                      </VStack>
                      <Button colorScheme="blue" onClick={() => handleDownload(sheet.id, `attachment-answer-sheet-${index + 1}`)}>
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


