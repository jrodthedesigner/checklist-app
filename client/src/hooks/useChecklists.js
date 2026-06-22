import { create } from 'zustand'
import { checklistAPI } from '../services/api'
import toast from 'react-hot-toast'

const useChecklistStore = create((set, get) => ({
  checklists: [],
  currentChecklist: null,
  loading: false,
  error: null,

  fetchChecklists: async () => {
    set({ loading: true })
    try {
      const { data } = await checklistAPI.getAll()
      set({ checklists: data, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
      toast.error('Failed to load checklists')
    }
  },

  fetchChecklist: async (id) => {
    set({ loading: true })
    try {
      const { data } = await checklistAPI.getOne(id)
      set({ currentChecklist: data, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
      toast.error('Failed to load checklist')
    }
  },

  createChecklist: async (checklistData) => {
    try {
      const { data } = await checklistAPI.create(checklistData)
      set(state => ({ checklists: [data, ...state.checklists] }))
      toast.success('Checklist created!')
      return data
    } catch (err) {
      toast.error(err.response?.data?.messages?.[0] || 'Failed to create checklist')
      throw err
    }
  },

  updateChecklist: async (id, updates) => {
    try {
      const { data } = await checklistAPI.update(id, updates)
      set(state => ({
        checklists: state.checklists.map(c => c._id === id ? data : c),
        currentChecklist: state.currentChecklist?._id === id ? data : state.currentChecklist,
      }))
      return data
    } catch (err) {
      toast.error('Failed to update checklist')
      throw err
    }
  },

  deleteChecklist: async (id) => {
    try {
      await checklistAPI.delete(id)
      set(state => ({ checklists: state.checklists.filter(c => c._id !== id) }))
      toast.success('Checklist deleted')
    } catch (err) {
      toast.error('Failed to delete checklist')
    }
  },

  addItem: async (checklistId, itemData) => {
    try {
      const { data } = await checklistAPI.addItem(checklistId, itemData)
      set({ currentChecklist: data })
      set(state => ({
        checklists: state.checklists.map(c => c._id === checklistId ? data : c),
      }))
    } catch (err) {
      toast.error('Failed to add item')
    }
  },

  updateItem: async (checklistId, itemId, updates) => {
    try {
      const { data } = await checklistAPI.updateItem(checklistId, itemId, updates)
      set({ currentChecklist: data })
      set(state => ({
        checklists: state.checklists.map(c => c._id === checklistId ? data : c),
      }))
    } catch (err) {
      toast.error('Failed to update item')
    }
  },

  deleteItem: async (checklistId, itemId) => {
    // Optimistic removal
    const prev = get().currentChecklist
    if (prev) {
      set({
        currentChecklist: {
          ...prev,
          items: prev.items.filter(i => i._id !== itemId),
        },
      })
    }
    try {
      const { data } = await checklistAPI.deleteItem(checklistId, itemId)
      set({ currentChecklist: data })
      set(state => ({
        checklists: state.checklists.map(c => c._id === checklistId ? data : c),
      }))
    } catch (err) {
      set({ currentChecklist: prev })
      toast.error('Failed to delete item')
    }
  },

  toggleItem: async (checklistId, itemId) => {
    // Optimistic toggle
    const prev = get().currentChecklist
    if (prev) {
      set({
        currentChecklist: {
          ...prev,
          items: prev.items.map(i =>
            i._id === itemId ? { ...i, completed: !i.completed } : i
          ),
        },
      })
    }
    try {
      const { data } = await checklistAPI.toggleItem(checklistId, itemId)
      set({ currentChecklist: data })
      set(state => ({
        checklists: state.checklists.map(c => c._id === checklistId ? data : c),
      }))
    } catch (err) {
      set({ currentChecklist: prev })
      toast.error('Failed to toggle item')
    }
  },

  reorderItems: async (checklistId, newItems) => {
    const prev = get().currentChecklist
    set({
      currentChecklist: { ...prev, items: newItems },
    })
    try {
      const itemsWithOrder = newItems.map((item, i) => ({ ...item, order: i }))
      const { data } = await checklistAPI.update(checklistId, { items: itemsWithOrder })
      set({ currentChecklist: data })
    } catch (err) {
      set({ currentChecklist: prev })
      toast.error('Failed to reorder items')
    }
  },

  clearCompleted: async (checklistId) => {
    const prev = get().currentChecklist
    if (!prev) return
    const remaining = prev.items.filter(i => !i.completed)
    set({ currentChecklist: { ...prev, items: remaining } })
    try {
      const { data } = await checklistAPI.update(checklistId, { items: remaining })
      set({ currentChecklist: data })
      set(state => ({
        checklists: state.checklists.map(c => c._id === checklistId ? data : c),
      }))
      toast.success('Completed items cleared')
    } catch (err) {
      set({ currentChecklist: prev })
      toast.error('Failed to clear completed items')
    }
  },
}))

export default useChecklistStore
