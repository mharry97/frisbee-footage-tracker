"use client"

import BackButton from "@/components/back-button"

interface StandardHeaderProps {
  text: string
}

export default function StandardHeader({ text }: StandardHeaderProps) {
  return (
    <div className="pt-2 mb-6">
      <BackButton />
      <h1 style={{ fontSize: "2.5rem", fontWeight: 300 }} className="mt-2">{text}</h1>
    </div>
  )
}
