import Modal from './Modal'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Delete' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Are you sure?'}>
      <p className="text-warm-600 text-sm mt-2 mb-6">{message || 'This action cannot be undone.'}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-warm-600 hover:text-warm-800 rounded-xl hover:bg-warm-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose() }}
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
