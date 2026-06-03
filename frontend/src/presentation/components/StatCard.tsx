interface StatCardProps {
  icon: string
  value: number
  label: string
  bgColor: string
}

export default function StatCard({ icon, value, label, bgColor }: StatCardProps) {
  const displayValue = value >= 0 ? `+${value}` : value

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[140px]">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-1">{displayValue}</div>
      <div className="text-sm text-gray-600 text-center">{label}</div>
    </div>
  )
}
