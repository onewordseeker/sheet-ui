import React from 'react';

// Chakra imports
import { Flex, useColorModeValue, Text, Image } from '@chakra-ui/react';
import { MdQuiz } from 'react-icons/md';

import logoWhite from 'assets/img/layout/logoWhite.png';
// Custom components
import { HSeparator } from 'components/separator/Separator';

export function SidebarBrand() {
  //   Chakra color mode
  let logoColor = useColorModeValue('navy.700', 'white');
  let brandColor = useColorModeValue('brand.500', 'white');

  return (
    <Flex align="center" direction="column">
      <Flex align="center" direction="row" my="32px">
        <Flex
          border="5px solid"
          borderColor={brandColor}
          bg="linear-gradient(135deg, #868CFF 0%, #4318FF 100%)"
          borderRadius="50%"
          w="44px"
          h="44px"
          align="center"
          justify="center"
          mx="auto"
          transform="translate(-50%, 0%)"
        >
          <Image src={logoWhite} w="20px" h="20px" />
        </Flex>
        <Text fontSize="xl" fontWeight="bold" color={logoColor}>
          Project Horizon
        </Text>
      </Flex>
      <HSeparator mb="20px" />
    </Flex>
  );
}

export default SidebarBrand;
