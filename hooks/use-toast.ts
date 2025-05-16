"use client"

import { useState, useCallback } from "react"

type Toast = {
  id: string
  description: string
  visible: boolean
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ description, duration = 3000 }: { description: string; duration?: number }) => {
    const id = Math.random().toString(36).substring(2, 9)

    // 새 토스트 추가
    setToasts((prev) => [...prev, { id, description, visible: true }])

    // 지정된 시간 후 토스트 제거
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  return { toast, toasts }
}
