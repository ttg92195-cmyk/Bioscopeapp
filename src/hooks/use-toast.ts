"use client"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ToastVariant = "default" | "destructive"

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

let toastListeners: Array<(toast: Toast) => void> = []

export function toast(props: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2, 9)
  const newToast: Toast = { id, ...props }
  toastListeners.forEach((listener) => listener(newToast))

  // Auto dismiss
  const duration = props.duration ?? 5000
  setTimeout(() => {
    dismissToast(id)
  }, duration)
}

function dismissToast(id: string) {
  // Simple implementation
  toastListeners = toastListeners.filter(() => false)
}

export function addToastListener(listener: (toast: Toast) => void) {
  toastListeners.push(listener)
  return () => {
    toastListeners = toastListeners.filter((l) => l !== listener)
  }
}
