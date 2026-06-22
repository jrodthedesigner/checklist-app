import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import useChecklistStore from '../hooks/useChecklists'
import Checkbox from '../components/Checkbox'
import PriorityBadge from '../components/PriorityBadge'
import ProgressBar from '../components/ProgressBar'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import { DetailSkeleton } from '../components/Skeleton'

function SortableItem({ item, checklistId, checklistColor }) {
  const { toggleItem, updateItem, deleteItem } = useChecklistStore()
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(item.text)
  const [showDelete, setShowDelete] = useState(false)
  const inputRef = useRef(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item._id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  }

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus()
  }, [editing])

  const saveEdit = () => {
    if (editText.trim() && editText !== item.text) {
      updateItem(checklistId, item._id, { text: editText.trim() })
    } else {
      setEditText(item.text)
    }
    setEditing(false)
  }

  const cyclePriority = () => {
    const next = { low: 'medium', medium: 'high', high: 'low' }
    updateItem(checklistId, item._id, { priority: next[item.priority] })
  }

  const dueFormatted = item.dueDate
    ? new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  return (
    <>
      <motion.div
        ref={setNodeRef}
        style={style}
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.2 }}
        className={`group flex items-center gap-3 px-4 py-3 bg-white rounded-xl border transition-all ${
          isDragging ? 'shadow-lg border-accent/30' : 'border-warm-100 hover:border-warm-200 hover:shadow-sm'
        } ${item.completed ? 'opacity-60' : ''}`}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-warm-400 hover:text-warm-600 transition-opacity touch-none"
          aria-label="Drag to reorder"
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="3" r="1.5" /><circle cx="11" cy="3" r="1.5" />
            <circle cx="5" cy="8" r="1.5" /><circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="13" r="1.5" /><circle cx="11" cy="13" r="1.5" />
          </svg>
        </button>

        <Checkbox
          checked={item.completed}
          onChange={() => toggleItem(checklistId, item._id)}
          color={checklistColor}
        />

        {editing ? (
          <input
            ref={inputRef}
            value={editText}
            onChange={e => setEditText(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') { setEditText(item.text); setEditing(false) } }}
            className="flex-1 px-2 py-1 bg-warm-50 border border-warm-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        ) : (
          <span
            onClick={() => { if (!item.completed) { setEditing(true) } }}
            className={`flex-1 text-sm cursor-text select-none ${item.completed ? 'line-through text-warm-400' : 'text-warm-800'}`}
          >
            {item.text}
          </span>
        )}

        <div className="flex items-center gap-2">
          {dueFormatted && (
            <span className="text-[11px] text-warm-500 whitespace-nowrap">{dueFormatted}</span>
          )}
          <button onClick={cyclePriority} className="focus:outline-none" title="Click to change priority">
            <PriorityBadge priority={item.priority} />
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="opacity-0 group-hover:opacity-100 p-1 text-warm-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
            aria-label="Delete item"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </motion.div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={() => deleteItem(checklistId, item._id)}
        title="Delete Item"
        message={`Delete "${item.text}"?`}
      />
    </>
  )
}

export default function ChecklistDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    currentChecklist: checklist, loading, fetchChecklist,
    updateChecklist, addItem, reorderItems, clearCompleted, deleteChecklist,
  } = useChecklistStore()

  const [newItemText, setNewItemText] = useState('')
  const [newItemPriority, setNewItemPriority] = useState('medium')
  const [newItemDue, setNewItemDue] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [editingDesc, setEditingDesc] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [descDraft, setDescDraft] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const titleRef = useRef(null)
  const descRef = useRef(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  )

  useEffect(() => { fetchChecklist(id) }, [id, fetchChecklist])

  useEffect(() => {
    if (editingTitle && titleRef.current) titleRef.current.focus()
  }, [editingTitle])

  useEffect(() => {
    if (editingDesc && descRef.current) descRef.current.focus()
  }, [editingDesc])

  const handleAddItem = (e) => {
    e.preventDefault()
    if (!newItemText.trim()) return
    addItem(id, { text: newItemText.trim(), priority: newItemPriority, dueDate: newItemDue || null })
    setNewItemText('')
    setNewItemPriority('medium')
    setNewItemDue('')
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id || !checklist) return

    const items = [...checklist.items]
    const oldIndex = items.findIndex(i => i._id === active.id)
    const newIndex = items.findIndex(i => i._id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)
    reorderItems(id, reordered)
  }

  const saveTitle = () => {
    if (titleDraft.trim() && titleDraft !== checklist.title) {
      updateChecklist(id, { title: titleDraft.trim() })
    }
    setEditingTitle(false)
  }

  const saveDesc = () => {
    if (descDraft !== checklist.description) {
      updateChecklist(id, { description: descDraft })
    }
    setEditingDesc(false)
  }

  const handleDeleteChecklist = async () => {
    await deleteChecklist(id)
    navigate('/')
  }

  if (loading || !checklist) {
    return (
      <div className="min-h-screen bg-warm-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <DetailSkeleton />
        </div>
      </div>
    )
  }

  const sortedItems = [...checklist.items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  const completed = sortedItems.filter(i => i.completed).length
  const total = sortedItems.length

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-warm-200 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-warm-500 hover:text-warm-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </Link>
          <div className="flex items-center gap-2">
            {completed > 0 && (
              <button
                onClick={() => clearCompleted(id)}
                className="px-3 py-1.5 text-xs font-medium text-warm-500 hover:text-warm-700 hover:bg-warm-100 rounded-lg transition-colors"
              >
                Clear completed
              </button>
            )}
            <button
              onClick={() => setDeleteConfirm(true)}
              className="p-2 text-warm-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              aria-label="Delete checklist"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Title */}
        <div className="mb-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: checklist.color }} />
            {editingTitle ? (
              <input
                ref={titleRef}
                value={titleDraft}
                onChange={e => setTitleDraft(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false) }}
                maxLength={100}
                className="font-display text-2xl sm:text-3xl font-bold text-warm-800 bg-transparent border-b-2 border-accent focus:outline-none w-full"
              />
            ) : (
              <h1
                onClick={() => { setTitleDraft(checklist.title); setEditingTitle(true) }}
                className="font-display text-2xl sm:text-3xl font-bold text-warm-800 cursor-text hover:text-accent transition-colors"
              >
                {checklist.title}
              </h1>
            )}
          </div>

          {editingDesc ? (
            <textarea
              ref={descRef}
              value={descDraft}
              onChange={e => setDescDraft(e.target.value)}
              onBlur={saveDesc}
              onKeyDown={e => { if (e.key === 'Escape') setEditingDesc(false) }}
              rows={2}
              className="w-full ml-6 text-sm text-warm-500 bg-transparent border-b border-warm-300 focus:outline-none resize-none"
              placeholder="Add a description..."
            />
          ) : (
            <p
              onClick={() => { setDescDraft(checklist.description || ''); setEditingDesc(true) }}
              className="ml-6 text-sm text-warm-500 cursor-text hover:text-warm-600 transition-colors min-h-[20px]"
            >
              {checklist.description || 'Add a description...'}
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="my-6">
          <ProgressBar completed={completed} total={total} color={checklist.color} />
        </div>

        {/* Items */}
        {sortedItems.length === 0 ? (
          <EmptyState
            title="No items yet"
            message="Add your first item below to get started."
          />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sortedItems.map(i => i._id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2 mb-6">
                <AnimatePresence mode="popLayout">
                  {sortedItems.map(item => (
                    <SortableItem
                      key={item._id}
                      item={item}
                      checklistId={id}
                      checklistColor={checklist.color}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Add Item Form */}
        <form onSubmit={handleAddItem} className="mt-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={e => setNewItemText(e.target.value)}
                placeholder="Add a new item..."
                className="flex-1 px-4 py-3 bg-white border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-shadow"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={newItemPriority}
                onChange={e => setNewItemPriority(e.target.value)}
                className="px-3 py-2.5 bg-white border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 text-warm-600"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <input
                type="date"
                value={newItemDue}
                onChange={e => setNewItemDue(e.target.value)}
                className="px-3 py-2.5 bg-white border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 text-warm-600"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-accent hover:bg-accent-dark text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-accent/20 whitespace-nowrap"
              >
                Add
              </button>
            </div>
          </div>
        </form>
      </main>

      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDeleteChecklist}
        title="Delete Checklist"
        message={`Delete "${checklist.title}" and all its items? This cannot be undone.`}
      />
    </div>
  )
}
