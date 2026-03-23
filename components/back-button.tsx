"use client"

import { useRouter } from "next/navigation"
import { FiArrowLeft } from "react-icons/fi"

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mt-4 flex items-center gap-2 text-sm text-gray-400 hover:text-gray-100 transition-colors"
    >
      <FiArrowLeft className="w-4 h-4" />
      Back
    </button>
  )
}
