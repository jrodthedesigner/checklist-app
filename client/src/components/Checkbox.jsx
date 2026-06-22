import { motion } from 'framer-motion'

export default function Checkbox({ checked, onChange, color = '#6366f1' }) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className="relative w-5 h-5 rounded-md border-2 flex-shrink-0 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/50"
      style={{
        borderColor: checked ? color : '#d5cfc4',
        backgroundColor: checked ? color : 'transparent',
      }}
    >
      {checked && (
        <motion.svg
          className="absolute inset-0 w-full h-full p-0.5 text-white"
          viewBox="0 0 12 12"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <motion.path
            d="M2.5 6L5 8.5L9.5 3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.2, delay: 0.05 }}
          />
        </motion.svg>
      )}
    </button>
  )
}
