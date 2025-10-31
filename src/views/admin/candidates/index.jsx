import React, { useEffect, useState } from 'react';
import {
  Box, VStack, HStack, Text, useColorModeValue, Card, CardHeader, CardBody,
  Button, Input, FormControl, FormLabel, useToast, Table, Thead, Tbody, Tr, Th, Td,
  Icon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, useDisclosure, Center
} from '@chakra-ui/react';
import { MdUpload, MdDelete, MdEdit } from 'react-icons/md';

export default function Candidates() {
  const toast = useToast();
  const bgCard = useColorModeValue('white', 'navy.800');
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const textColorSecondary = useColorModeValue('secondaryGray.600', 'secondaryGray.400');
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100');

  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [lists, setLists] = useState([]);
  const [editingList, setEditingList] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const load = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/candidate-lists`);
      const data = await res.json();
      if (res.ok) setLists(data.lists || []);
    } catch (e) { /* noop */ }
  };

  useEffect(() => { load(); }, []);

  const onUpload = async () => {
    if (!title.trim()) { toast({ title: 'Title required', status: 'warning' }); return; }
    if (!file) { toast({ title: 'CSV file required', status: 'warning' }); return; }
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title.trim());
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/candidate-lists/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'List uploaded', status: 'success' });
        setTitle('');
        setFile(null);
        load();
      } else {
        toast({ title: data.error || 'Upload failed', status: 'error' });
      }
    } catch (e) {
      toast({ title: 'Upload failed', status: 'error' });
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this list? This will remove all candidates.')) return;
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/candidate-lists/${id}`, { method: 'DELETE' });
      if (res.ok) { toast({ title: 'Deleted', status: 'success' }); load(); } else { toast({ title: 'Delete failed', status: 'error' }); }
    } catch (e) { toast({ title: 'Delete failed', status: 'error' }); }
  };

  const openEdit = (list) => { setEditingList(list); onOpen(); };
  const saveEdit = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/candidate-lists/${editingList.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: editingList.title })
      });
      if (res.ok) { toast({ title: 'Updated', status: 'success' }); onClose(); setEditingList(null); load(); }
      else { toast({ title: 'Update failed', status: 'error' }); }
    } catch (e) { toast({ title: 'Update failed', status: 'error' }); }
  };

  return (
    <Box pt={{ base: '130px', md: '80px', xl: '80px' }}>
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="2xl" fontWeight="bold" color={textColor} mb={2}>Candidate Lists</Text>
          <Text color={textColorSecondary}>Upload CSV lists and manage candidates</Text>
        </Box>

        <Card bg={bgCard}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>Upload CSV</Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. November candidates list" />
              </FormControl>
              <FormControl>
                <FormLabel>CSV File</FormLabel>
                <Input type="file" accept=".csv,text/csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </FormControl>
              <Button leftIcon={<Icon as={MdUpload} />} colorScheme="blue" onClick={onUpload}>Upload</Button>
              <Text fontSize="sm" color={textColorSecondary}>CSV columns: sequence id, learner name, learner id</Text>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={bgCard}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold" color={textColor}>Existing Lists</Text>
          </CardHeader>
          <CardBody>
            {lists.length === 0 ? (
              <Center py={8}><Text color={textColorSecondary}>No lists yet.</Text></Center>
            ) : (
              <Box overflowX="auto">
                <Table>
                  <Thead>
                    <Tr>
                      <Th color={textColor}>Title</Th>
                      <Th color={textColor}>Candidates</Th>
                      <Th color={textColor}>Created</Th>
                      <Th color={textColor}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {lists.map(l => (
                      <Tr key={l.id}>
                        <Td>{l.title}</Td>
                        <Td>{l.entriesCount}</Td>
                        <Td>{new Date(l.createdAt).toLocaleString()}</Td>
                        <Td>
                          <HStack>
                            <Button size="sm" leftIcon={<Icon as={MdEdit} />} variant="outline" onClick={() => openEdit(l)}>Edit</Button>
                            <Button size="sm" leftIcon={<Icon as={MdDelete} />} colorScheme="red" variant="outline" onClick={() => onDelete(l.id)}>Delete</Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </CardBody>
        </Card>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit List</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {editingList && (
                <FormControl>
                  <FormLabel>Title</FormLabel>
                  <Input value={editingList.title} onChange={(e) => setEditingList({ ...editingList, title: e.target.value })} />
                </FormControl>
              )}
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onClose}>Cancel</Button>
              <Button colorScheme="blue" onClick={saveEdit}>Save</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
}


