"use client"

import { IoMdAdd } from "react-icons/io"
import { FiEdit } from "react-icons/fi"
import { FaScissors } from "react-icons/fa6"

interface FloatingActionButtonProps {
  iconType: "add" | "edit" | "clip"
  onClick?: () => void
}

const iconMap = {
  add: IoMdAdd,
  edit: FiEdit,
  clip: FaScissors,
}

export default function FloatingActionButton({ iconType, onClick }: FloatingActionButtonProps) {
  const Icon = iconMap[iconType]
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-neutral-700 hover:bg-neutral-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
      aria-label="Floating action button"
    >
      <Icon className="w-6 h-6" />
    </button>
  )
}
