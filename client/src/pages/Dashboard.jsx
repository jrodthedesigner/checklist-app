import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useChecklistStore from '../hooks/useChecklists'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import ProgressBar from '../components/ProgressBar'
import EmptyState from '../components/EmptyState'
import ColorPicker from '../components/ColorPicker'
import { CardSkeleton } from '../components/Skeleton'

const SORT_OPTIONS = [
  { value: 'date', label: 'Newest' },
  { value: 'name', label: 'A-Z' },
  { value: 'progress', label: 'Progress' },
]

export default function Dashboard() {
  const { checklists, loading, fetchChecklists, createChecklist, deleteChecklist, resetDemo } = useChecklistStore()
  const [showCreate, setShowCreate] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('date')
  const [form, setForm] = useState({ title: '', description: '', color: '#6366f1' })

  useEffect(() => { fetchChecklists() }, [fetchChecklists])

  const filtered = useMemo(() => {
    let result = checklists.filter(c =>
      c.title.toLowerCase().includes(search.toLowerCase())
    )
    switch (sort) {
      case 'name':
        result = [...result].sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'progress':
        result = [...result].sort((a, b) => {
          const pA = a.items.length ? a.items.filter(i => i.completed).length / a.items.length : 0
          const pB = b.items.length ? b.items.filter(i => i.completed).length / b.items.length : 0
          return pB - pA
        })
        break
      default:
        break
    }
    return result
  }, [checklists, search, sort])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    await createChecklist(form)
    setForm({ title: '', description: '', color: '#6366f1' })
    setShowCreate(false)
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-warm-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-bold text-warm-800">Checklists</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReset(true)}
              className="inline-flex items-center gap-2 px-3 py-2.5 text-warm-500 hover:text-warm-800 text-sm font-medium rounded-xl hover:bg-warm-100 transition-colors"
              title="Restore the demo to its default sample data"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span className="hidden sm:inline">Reset demo</span>
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-dark text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-accent/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Checklist
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Search & Sort */}
        {checklists.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search checklists..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow"
              />
            </div>
            <div className="flex gap-1 bg-white border border-warm-200 rounded-xl p-1">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSort(opt.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    sort === opt.value
                      ? 'bg-accent text-white'
                      : 'text-warm-500 hover:text-warm-700 hover:bg-warm-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 && !search ? (
          <EmptyState
            title="No checklists yet"
            message="Create your first checklist to get started organizing your tasks."
            action={
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-dark text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create Checklist
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-warm-500 text-sm">
            No checklists match "{search}"
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            layout
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((checklist, i) => {
                const completed = checklist.items.filter(i => i.completed).length
                const total = checklist.items.length
                return (
                  <motion.div
                    key={checklist._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <Link
                      to={`/checklist/${checklist._id}`}
                      className="group block bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-warm-100 hover:border-warm-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: checklist.color }} />
                            <h3 className="font-display text-lg font-semibold text-warm-800 truncate group-hover:text-accent transition-colors">
                              {checklist.title}
                            </h3>
                          </div>
                          {checklist.description && (
                            <p className="text-warm-500 text-sm truncate pl-[18px]">{checklist.description}</p>
                          )}
                        </div>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteTarget(checklist) }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 text-warm-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          aria-label="Delete checklist"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                      <ProgressBar completed={completed} total={total} color={checklist.color} />
                    </Link>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Checklist">
        <form onSubmit={handleCreate} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-medium text-warm-600 mb-1.5">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="My checklist..."
              maxLength={100}
              autoFocus
              className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-warm-600 mb-1.5">Description (optional)</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="What's this checklist for?"
              rows={2}
              className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-warm-600 mb-2">Color</label>
            <ColorPicker value={form.color} onChange={color => setForm({ ...form, color })} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-sm font-medium text-warm-600 hover:text-warm-800 rounded-xl hover:bg-warm-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-accent hover:bg-accent-dark rounded-xl transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteChecklist(deleteTarget._id)}
        title="Delete Checklist"
        message={`Delete "${deleteTarget?.title}"? All items will be permanently removed.`}
      />

      {/* Reset Demo Confirm */}
      <ConfirmDialog
        isOpen={showReset}
        onClose={() => setShowReset(false)}
        onConfirm={() => resetDemo()}
        title="Reset demo"
        message="Restore the demo to its default sample checklists? This clears all current data."
        confirmLabel="Reset demo"
      />
    </div>
  )
}
