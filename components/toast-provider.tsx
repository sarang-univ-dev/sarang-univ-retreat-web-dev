"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

export function ToastProvider() {
  const { toasts } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-white border rounded-md shadow-md p-4 max-w-sm animate-in fade-in slide-in-from-top-5 flex items-center gap-2"
        >
          <p>{toast.description}</p>
          <button className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
