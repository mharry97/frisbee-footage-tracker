'use client'
import React from 'react';
import { Box, Button, Heading } from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

type HeaderProps = {
  title: string;
  buttonText?: string;
  redirectUrl?: string;
  onBack?: () => void;
};

const Header: React.FC<HeaderProps> = ({ title, buttonText, redirectUrl, onBack }) => {
  const router = useRouter();

  const handleClick = onBack ? onBack : () => router.push(redirectUrl || '/');

  return (
    <Box bg="black" pt={4}>
      <Box mx="auto" w="100%">
        <Button
          variant="ghost"
          colorPalette="yellow"
          _hover={{ bg: "#2a2a2a" }}
          onClick={handleClick}
        >
          <FiArrowLeft style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          {buttonText || "return"}
        </Button>
        <Heading as="h1" size="4xl" fontWeight="light" color="white" mb={8}>
          {title}
        </Heading>
      </Box>
    </Box>
  );
};

export default Header;
