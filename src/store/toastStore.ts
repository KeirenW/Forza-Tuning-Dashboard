import { create } from 'zustand'
import { nanoid } from 'nanoid'

export type ToastVariant = 'success' | 'danger' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastState {
  toasts: Toast[]
  addToast: (message: string, variant?: ToastVariant) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  addToast: (message, variant = 'success') =>
    set((state) => ({
      toasts: [...state.toasts, { id: nanoid(), message, variant }],
    })),

  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
