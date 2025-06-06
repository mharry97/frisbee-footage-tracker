import { useRouter } from 'next/navigation'
import {Button} from "@chakra-ui/react";
import {FiArrowLeft} from "react-icons/fi";
import React from "react";

export default function BackButton() {
  const router = useRouter()

  return (
    <Button mt={4} variant='ghost' type="button" onClick={() => router.back()}>
      <FiArrowLeft style={{ marginRight: '8px', verticalAlign: 'middle' }} />Back
    </Button>
  )
}
