"use client"

import * as React from "react"
import { addToastListener } from "@/hooks/use-toast"
import type { Toast } from "@/hooks/use-toast"

function Toaster() {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  React.useEffect(() => {
    const unsubscribe = addToastListener((newToast: Toast) => {
      setToasts((prev) => [...prev, newToast])

      // Auto remove after duration
      const duration = newToast.duration ?? 5000
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id))
      }, duration)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${
            t.variant === "destructive"
              ? "bg-red-600 text-white"
              : "bg-[#1E1E1E] text-white border border-white/10"
          } rounded-lg p-3 shadow-lg animate-in slide-in-from-right`}
        >
          {t.title && <p className="font-medium text-sm">{t.title}</p>}
          {t.description && (
            <p className="text-xs text-gray-300 mt-1">{t.description}</p>
          )}
        </div>
      ))}
    </div>
  )
}

export { Toaster }
