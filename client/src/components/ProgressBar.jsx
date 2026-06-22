import { motion } from 'framer-motion'

export default function ProgressBar({ completed, total, color = '#6366f1' }) {
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-warm-500">
          {completed}/{total} completed
        </span>
        <span className="text-xs font-semibold" style={{ color }}>
          {percent}%
        </span>
      </div>
      <div className="w-full h-2 bg-warm-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
