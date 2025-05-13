"use client"

import type React from "react"

import { RegistrationProvider } from "@/context/retreatRegistrationContext"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <RegistrationProvider>{children}</RegistrationProvider>
}
