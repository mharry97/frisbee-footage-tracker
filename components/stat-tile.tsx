interface StatTileProps {
  title: string
  value: number
}

export default function StatTile({ title, value }: StatTileProps) {
  return (
    <div className="flex justify-center">
      <div className="w-[110px] h-[110px] flex flex-col items-center pt-2">
        <p className="text-neutral-400 text-sm text-center">{title}</p>
        <p className="text-yellow-400 text-3xl mt-2">{value}</p>
      </div>
    </div>
  )
}
