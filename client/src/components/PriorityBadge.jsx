const config = {
  low: { label: 'Low', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  medium: { label: 'Med', bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  high: { label: 'High', bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
}

export default function PriorityBadge({ priority }) {
  const c = config[priority] || config.medium

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  )
}
