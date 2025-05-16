import { Button } from "@chakra-ui/react"
import React from "react"
import { getFootageProvider } from "@/lib/utils"

interface WatchButtonProps {
  url: string
}

export const WatchButton: React.FC<WatchButtonProps> = ({ url }) => {
  const host = getFootageProvider(url)

  const handleClick = () => {
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <Button colorPalette="green" mt={4} onClick={handleClick}>
      Watch on {host}
    </Button>
  )
}
