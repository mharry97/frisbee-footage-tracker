type LoadingSpinnerProps = {
  text: string
}

export default function LoadingSpinner({ text }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center min-h-[50vh]">
      <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mr-3" />
      <p className="text-lg">{text}</p>
    </div>
  )
}
